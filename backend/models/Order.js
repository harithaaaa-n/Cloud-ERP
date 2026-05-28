import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contact',
    required: true,
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative'],
  },
  type: {
    type: String,
    enum: ['Sales', 'Purchase'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending Approval', 'Approved', 'Shipped', 'Delivered', 'Completed', 'Cancelled'],
    default: 'Draft',
  },
  paymentStatus: {
    type: String,
    enum: ['Unpaid', 'Partially Paid', 'Paid'],
    default: 'Unpaid',
  },
  // Shipment Tracking Attributes
  shippingCarrier: {
    type: String,
    trim: true,
  },
  trackingNumber: {
    type: String,
    trim: true,
  },
  shippingStatus: {
    type: String,
    enum: ['Pending', 'In Transit', 'Out for Delivery', 'Delivered', 'Delayed', 'Returned'],
    default: 'Pending',
  },
  estimatedDelivery: {
    type: Date,
  },
  actualDelivery: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index to optimize loading contact-specific order histories
orderSchema.index({ contact: 1, orderDate: -1 });

// Compound index for tracking order states over time
orderSchema.index({ type: 1, status: 1, orderDate: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
