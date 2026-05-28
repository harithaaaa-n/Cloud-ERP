import express from 'express';
import { getTransactions, createTransaction, getFinanceSummary } from '../controllers/financeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { financeSchemas } from '../middleware/validationSchemas.js';

const router = express.Router();

router.use(protect);

router.route('/transactions')
  .get(authorize('admin', 'manager', 'finance'), getTransactions)
  .post(authorize('admin', 'manager', 'finance'), validate(financeSchemas.createTransaction), createTransaction);

router.get('/summary', authorize('admin', 'manager', 'finance'), getFinanceSummary);

export default router;
