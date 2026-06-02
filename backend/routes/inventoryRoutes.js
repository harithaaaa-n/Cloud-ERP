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
router.get('/analytics', authorize('admin', 'manager', 'inventory'), getInventoryAnalytics);
router.get('/logs', authorize('admin', 'manager', 'inventory'), getInventoryLogs);

// ── Catalog Operations ──
router.route('/')
  .get(authorize('admin', 'manager', 'inventory', 'supply', 'finance'), getProducts)
  .post(authorize('admin', 'manager', 'inventory'), validate(inventorySchemas.createProduct), createProduct);

router.route('/:id')
  .put(authorize('admin', 'manager', 'inventory'), validate(inventorySchemas.updateProduct), updateProduct)
  .delete(authorize('admin', 'manager', 'inventory'), deleteProduct);

// ── Stock Adjustments ──
router.post('/:id/adjust', authorize('admin', 'manager', 'inventory'), adjustStock);

export default router;
