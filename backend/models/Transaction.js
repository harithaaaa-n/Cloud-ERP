import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['Income', 'Expense'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  reference: {
    type: String, // e.g., Order ID or Invoice ID
  },
}, {
  timestamps: true,
});

// Index to optimize general date ranges
transactionSchema.index({ date: -1 });

// Compound index for filtering by transaction type and category over time
transactionSchema.index({ type: 1, category: 1, date: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
