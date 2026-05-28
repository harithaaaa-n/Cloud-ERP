import Product from '../models/Product.js';
import InventoryLog from '../models/InventoryLog.js';
import { createAndSendNotification } from './notificationController.js';
import { sendStockAlertEmail } from '../utils/mail.js';

// Helper: Auto-generate SKU
const generateSKU = (name, category) => {
  const cat = (category || 'GEN').slice(0, 3).toUpperCase();
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  const rand = Math.floor(100 + Math.random() * 900);
  return `${cat}-${cleanName}-${rand}`;
};

// Helper: Auto-generate simulated Barcode
const generateBarcode = () => {
  const randPart = Math.floor(10000000 + Math.random() * 90000000);
  return `890${randPart}`; // 11-digit simulated GTIN/UPC code
};

// @desc    Get all products (Search, Filter, Sort, Paginate)
// @route   GET /api/inventory
// @access  Private
export const getProducts = async (req, res) => {
  try {
    const { search, category, status, sortBy = '-createdAt', page = 1, limit = 10 } = req.query;

    const query = {};

    // 1. Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // 3. Status filter
    if (status && status !== 'All') {
      if (status === 'Low Stock') {
        query.$expr = { $and: [ { $gt: ["$stock", 0] }, { $lt: ["$stock", "$minStock"] } ] };
      } else if (status === 'Out of Stock') {
        query.stock = 0;
      } else if (status === 'In Stock') {
        query.$expr = { $gte: ["$stock", "$minStock"] };
      }
    }

    // 4. Pagination params
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // 5. Query execution
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('supplier', 'name company')
      .sort(sortBy)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum) || 1
      },
      data: products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/inventory
// @access  Private
export const createProduct = async (req, res) => {
  try {
    const { name, category, sku, barcode, stock, price, costPrice, minStock, unit, location, description, supplier } = req.body;

    const computedSKU = sku && sku.trim() !== '' ? sku.trim() : generateSKU(name, category);
    const computedBarcode = barcode && barcode.trim() !== '' ? barcode.trim() : generateBarcode();

    const product = await Product.create({
      name,
      category,
      sku: computedSKU,
      barcode: computedBarcode,
      stock: Number(stock) || 0,
      price: Number(price) || 0,
      costPrice: Number(costPrice) || 0,
      minStock: Number(minStock) || 10,
      unit,
      location,
      description,
      supplier: supplier || null
    });

    // Create starting stock audit log entry
    if (product.stock > 0) {
      await InventoryLog.create({
        product: product._id,
        user: req.user._id,
        type: 'Stock In',
        quantityChanged: product.stock,
        previousStock: 0,
        newStock: product.stock,
        reference: 'Initial Stocking',
        notes: 'Initial inventory logged at product registration.'
      });
    }

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update product details
// @route   PUT /api/inventory/:id
// @access  Private
export const updateProduct = async (req, res) => {
  try {
    const { stock } = req.body;
    
    // Find current product state
    const current = await Product.findById(req.params.id);
    if (!current) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if stock is updated directly via PUT
    const oldStock = current.stock;
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Log stock change if modified
    if (stock !== undefined && Number(stock) !== oldStock) {
      const diff = Number(stock) - oldStock;
      await InventoryLog.create({
        product: product._id,
        user: req.user._id,
        type: 'Audit Adjustment',
        quantityChanged: diff,
        previousStock: oldStock,
        newStock: product.stock,
        reference: 'Direct Update',
        notes: 'Stock updated directly via product profile update.'
      });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/inventory/:id
// @access  Private
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Clean up related inventory log history
    await InventoryLog.deleteMany({ product: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Adjust/Audit stock level manually
// @route   POST /api/inventory/:id/adjust
// @access  Private
export const adjustStock = async (req, res) => {
  try {
    const { type, quantityChanged, notes, reference } = req.body;
    
    if (!type || quantityChanged === undefined) {
      return res.status(400).json({ success: false, message: 'Adjustment type and quantity are required.' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product record not found.' });
    }

    const oldStock = product.stock;
    const diff = Number(quantityChanged);

    let newStock = oldStock;
    if (type === 'Stock In') {
      newStock += diff;
    } else if (type === 'Stock Out') {
      newStock -= diff;
    } else if (type === 'Audit Adjustment') {
      newStock = diff; // Audit overrides stock
    }

    if (newStock < 0) {
      return res.status(400).json({ success: false, message: 'Stock levels cannot go below 0.' });
    }

    // Save product
    product.stock = newStock;
    await product.save();

    // Create audit log
    const log = await InventoryLog.create({
      product: product._id,
      user: req.user._id,
      type,
      quantityChanged: type === 'Audit Adjustment' ? newStock - oldStock : diff,
      previousStock: oldStock,
      newStock,
      reference: reference || 'Manual Entry',
      notes
    });

    // Send Low Stock alert if levels fall below minimum threshold
    if (product.stock < product.minStock) {
      await createAndSendNotification(
        req.user._id,
        'Low Stock Warning',
        `SKU item: ${product.name} is running low (Current: ${product.stock} pcs / Min: ${product.minStock} pcs).`,
        'Low Stock'
      );
      
      // Send alert email asynchronously
      sendStockAlertEmail(req.user.email, product).catch(err => console.error("Stock email warning failed:", err));
    }

    res.status(200).json({ success: true, data: product, log });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get Inventory Analytics & KPIs
// @route   GET /api/inventory/analytics
// @access  Private
export const getInventoryAnalytics = async (req, res) => {
  try {
    const allProducts = await Product.find();

    // Total counts
    const totalProducts = allProducts.length;
    const totalStock = allProducts.reduce((sum, p) => sum + p.stock, 0);

    let totalRetailValue = 0;
    let totalCostValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    const categoryStatsMap = {};

    allProducts.forEach(p => {
      totalRetailValue += p.stock * p.price;
      totalCostValue += p.stock * p.costPrice;

      if (p.stock === 0) {
        outOfStockCount++;
      } else if (p.stock < p.minStock) {
        lowStockCount++;
      }

      // Group by category
      if (!categoryStatsMap[p.category]) {
        categoryStatsMap[p.category] = { name: p.category, stock: 0, retailValue: 0, count: 0 };
      }
      categoryStatsMap[p.category].stock += p.stock;
      categoryStatsMap[p.category].retailValue += p.stock * p.price;
      categoryStatsMap[p.category].count += 1;
    });

    const categoryData = Object.values(categoryStatsMap);

    // Fetch recent movement logs
    const recentLogs = await InventoryLog.find()
      .populate('product', 'name sku barcode')
      .populate('user', 'name role')
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProducts,
          totalStock,
          totalRetailValue,
          totalCostValue,
          netMarginPotential: totalRetailValue - totalCostValue,
          lowStockCount,
          outOfStockCount
        },
        categoryData,
        recentLogs
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all inventory movement logs
// @route   GET /api/inventory/logs
// @access  Private
export const getInventoryLogs = async (req, res) => {
  try {
    const logs = await InventoryLog.find()
      .populate('product', 'name sku barcode')
      .populate('user', 'name role')
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
