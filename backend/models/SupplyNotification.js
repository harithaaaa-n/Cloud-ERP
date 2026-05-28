import mongoose from 'mongoose';

const supplyNotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Status Change', 'Low Stock', 'Shipment Alert', 'General'],
    default: 'General',
  },
  read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const SupplyNotification = mongoose.model('SupplyNotification', supplyNotificationSchema);
export default SupplyNotification;
