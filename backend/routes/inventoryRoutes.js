import express from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getInventoryAnalytics,
  getInventoryLogs
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { inventorySchemas } from '../middleware/validationSchemas.js';

const router = express.Router();

// Enable JWT protection for all inventory routes
router.use(protect);

// ── Analytics & Logs (Registered before :id to prevent parameter conflicts) ──
router.get('/analytics', authorize('admin', 'manager'), getInventoryAnalytics);
router.get('/logs', authorize('admin', 'manager'), getInventoryLogs);

// ── Catalog Operations ──
router.route('/')
  .get(authorize('admin', 'manager'), getProducts)
  .post(authorize('admin', 'manager'), validate(inventorySchemas.createProduct), createProduct);

router.route('/:id')
  .put(authorize('admin', 'manager'), validate(inventorySchemas.updateProduct), updateProduct)
  .delete(authorize('admin', 'manager'), deleteProduct);

// ── Stock Adjustments ──
router.post('/:id/adjust', authorize('admin', 'manager'), adjustStock);

export default router;
