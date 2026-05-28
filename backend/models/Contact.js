import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a contact name'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['Customer', 'Supplier'],
    required: true,
  },
  company: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  // Advanced Vendor attributes
  contactPerson: {
    type: String,
    trim: true,
  },
  taxId: {
    type: String,
    trim: true,
  },
  paymentTerms: {
    type: String,
    enum: ['Immediate', 'Net 15', 'Net 30', 'Net 60'],
    default: 'Net 30',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5,
  },
  leadTime: {
    type: Number, // average lead time in days
    default: 5,
    min: 0,
  },
}, {
  timestamps: true,
});

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
