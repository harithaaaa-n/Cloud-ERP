import Order from '../models/Order.js';
import Contact from '../models/Contact.js';
import Product from '../models/Product.js';
import Transaction from '../models/Transaction.js';
import InventoryLog from '../models/InventoryLog.js';
import SupplyNotification from '../models/SupplyNotification.js';

// --- Helper: Process Stock Updates conditionally ---
const triggerStockUpdate = async (order, userId) => {
  const { type, orderNumber, items } = order;
  
  for (const item of items) {
    // Check if we already logged this stock movement to prevent duplicate adjustment
    const logExists = await InventoryLog.findOne({
      product: item.product,
      reference: orderNumber,
      type: type === 'Purchase' ? 'Order Purchase' : 'Order Sales'
    });
    
    if (logExists) continue;

    const product = await Product.findById(item.product);
    if (product) {
      const oldStock = product.stock;
      let newStock = oldStock;
      
      if (type === 'Purchase') {
        newStock += item.quantity;
      } else if (type === 'Sales') {
        newStock -= item.quantity;
      }
      
      if (newStock < 0) {
        throw new Error(`Fulfillment failed: Insufficient stock for ${product.name} (Available: ${oldStock}, Requested: ${item.quantity})`);
      }
      
      product.stock = newStock;
      await product.save();
      
      await InventoryLog.create({
        product: product._id,
        user: userId,
        type: type === 'Purchase' ? 'Order Purchase' : 'Order Sales',
        quantityChanged: type === 'Purchase' ? item.quantity : -item.quantity,
        previousStock: oldStock,
        newStock,
        reference: orderNumber,
        notes: `Automated stock update via supply chain status change.`
      });
    }
  }
};

// --- Contact / Vendor CRUD ---

export const getContacts = async (req, res) => {
  try {
    const { type, search, status } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(query).sort('-createdAt');
    res.status(200).json({ success: true, count: contacts.length, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createContact = async (req, res) => {
  try {
    const contact = await Contact.create(req.body);
    res.status(201).json({ success: true, data: contact });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.status(200).json({ success: true, data: contact });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- Order Management ---

export const getOrders = async (req, res) => {
  try {
    const { type, status } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const orders = await Order.find(query)
      .populate('contact', 'name company type rating email phone address')
      .populate('items.product', 'name sku barcode unit price');
      
    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { orderNumber, type, status, items, totalAmount } = req.body;
    
    // Auto-generate order number if blank
    const prefix = type === 'Purchase' ? 'PO' : 'SO';
    const computedNum = orderNumber && orderNumber.trim() !== '' 
      ? orderNumber.trim() 
      : `${prefix}-${Date.now().toString().slice(-6)}`;

    const order = await Order.create({
      ...req.body,
      orderNumber: computedNum
    });

    // Populate order items/contact details for stock checks
    const populated = await Order.findById(order._id)
      .populate('items.product');

    // Trigger stock updates immediately ONLY if order status warrants it
    // Purchase Order: Delivered or Completed increments stock
    // Sales Order: Shipped or Completed decrements stock
    const isPurchaseFulfillment = type === 'Purchase' && ['Delivered', 'Completed'].includes(status);
    const isSalesFulfillment = type === 'Sales' && ['Shipped', 'Completed'].includes(status);

    if (isPurchaseFulfillment || isSalesFulfillment) {
      await triggerStockUpdate(populated, req.user._id);
    }

    // Create a financial transaction
    await Transaction.create({
      description: `${type} Order: ${computedNum}`,
      amount: totalAmount,
      type: type === 'Sales' ? 'Income' : 'Expense',
      category: type === 'Sales' ? 'Sales Revenue' : 'Inventory Purchase',
      reference: order._id,
      date: order.orderDate
    });

    // Send supply notification
    await SupplyNotification.create({
      user: req.user._id,
      title: `Order Created: ${computedNum}`,
      message: `A new ${type.toLowerCase()} order has been logged in status: ${status || 'Draft'}.`,
      type: 'General'
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, shippingStatus, shippingCarrier, trackingNumber, estimatedDelivery, actualDelivery, paymentStatus } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Update order status fields
    if (status) order.status = status;
    if (shippingStatus) order.shippingStatus = shippingStatus;
    if (shippingCarrier) order.shippingCarrier = shippingCarrier;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;
    if (actualDelivery) order.actualDelivery = actualDelivery;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    // Re-query populated version for stock update logic
    const populated = await Order.findById(order._id).populate('items.product');

    // Perform state-driven stock updates
    const isPurchaseFulfillment = order.type === 'Purchase' && ['Delivered', 'Completed'].includes(order.status);
    const isSalesFulfillment = order.type === 'Sales' && ['Shipped', 'Completed'].includes(order.status);

    if (isPurchaseFulfillment || isSalesFulfillment) {
      await triggerStockUpdate(populated, req.user._id);
    }

    // Record supply notification alerts
    await SupplyNotification.create({
      user: req.user._id,
      title: `Order status change: ${order.orderNumber}`,
      message: `Order status changed to "${order.status}" / Tracking Status: "${order.shippingStatus}".`,
      type: 'Status Change'
    });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- Supplier Analytics ---

export const getSupplierAnalytics = async (req, res) => {
  try {
    const suppliers = await Contact.find({ type: 'Supplier' });
    const orders = await Order.find({ type: 'Purchase' });

    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter(s => s.status === 'Active').length;

    const totalSpent = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const pendingOrdersCount = orders.filter(o => ['Pending Approval', 'Approved', 'Shipped'].includes(o.status)).length;
    const completedOrdersCount = orders.filter(o => o.status === 'Completed').length;

    // Build charts: Spent per vendor
    const supplierStatsMap = {};
    orders.forEach(o => {
      if (o.status === 'Cancelled') return;
      const key = o.contact.toString();
      if (!supplierStatsMap[key]) {
        supplierStatsMap[key] = { id: key, name: 'Supplier', amount: 0, orderCount: 0 };
      }
      supplierStatsMap[key].amount += o.totalAmount;
      supplierStatsMap[key].orderCount += 1;
    });

    const supplierSpendData = [];
    for (const key in supplierStatsMap) {
      const contactObj = await Contact.findById(key);
      if (contactObj) {
        supplierSpendData.push({
          name: contactObj.company || contactObj.name,
          amount: supplierStatsMap[key].amount,
          orders: supplierStatsMap[key].orderCount,
          rating: contactObj.rating || 5
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalSuppliers,
          activeSuppliers,
          totalSpent,
          pendingOrdersCount,
          completedOrdersCount
        },
        supplierSpendData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- In-App Notifications ---

export const getNotifications = async (req, res) => {
  try {
    const notifications = await SupplyNotification.find()
      .sort('-createdAt')
      .limit(30);
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await SupplyNotification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
