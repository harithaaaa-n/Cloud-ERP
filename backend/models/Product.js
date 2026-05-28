import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  sku: {
    type: String,
    required: [true, 'Please add a SKU'],
    unique: true,
    trim: true,
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Electronics', 'Storage', 'Display', 'Peripherals', 'Mobile', 'Networking', 'Software'],
    default: 'Electronics',
  },
  price: {
    type: Number,
    required: [true, 'Please add a retail price'],
    min: [0, 'Price cannot be negative'],
  },
  costPrice: {
    type: Number,
    required: [true, 'Please add a cost price'],
    default: 0,
    min: [0, 'Cost price cannot be negative'],
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    default: 0,
    min: [0, 'Stock cannot be negative'],
  },
  minStock: {
    type: Number,
    required: [true, 'Please add a minimum stock warning level'],
    default: 10,
    min: [0, 'Minimum stock cannot be negative'],
  },
  unit: {
    type: String,
    default: 'pcs',
  },
  location: {
    type: String,
    placeholder: 'e.g. Aisle A, Shelf 3',
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
  },
}, {
  timestamps: true,
});

// Compound index for category listings sorted by name
productSchema.index({ category: 1, name: 1 });

// Helper index for querying stockouts and low stock levels
productSchema.index({ stock: 1, minStock: 1 });

// Text index to support full-text search capability
productSchema.index(
  { name: 'text', description: 'text', sku: 'text' },
  { weights: { name: 10, sku: 5, description: 1 } }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
