import Transaction from '../models/Transaction.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find().sort('-date');
  res.status(200).json({ success: true, count: transactions.length, data: transactions });
});

export const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.create(req.body);
  res.status(201).json({ success: true, data: transaction });
});

export const getFinanceSummary = asyncHandler(async (req, res) => {
  const income = await Transaction.aggregate([
    { $match: { type: 'Income' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const expenses = await Transaction.aggregate([
    { $match: { type: 'Expense' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const totalIncome   = income[0]?.total   || 0;
  const totalExpenses = expenses[0]?.total || 0;

  res.status(200).json({
    success: true,
    data: {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses
    }
  });
});
