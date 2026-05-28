import mongoose from 'mongoose';

const inventoryLogSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['Stock In', 'Stock Out', 'Audit Adjustment', 'Order Purchase', 'Order Sales'],
    required: true,
  },
  quantityChanged: {
    type: Number,
    required: true,
  },
  previousStock: {
    type: Number,
    required: true,
  },
  newStock: {
    type: Number,
    required: true,
  },
  reference: {
    type: String,
    default: 'Manual Adjust',
  },
  notes: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Index to optimize loading product-specific stock logs chronologically
inventoryLogSchema.index({ product: 1, createdAt: -1 });

const InventoryLog = mongoose.model('InventoryLog', inventoryLogSchema);
export default InventoryLog;
