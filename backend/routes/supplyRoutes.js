import express from 'express';
import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  getOrders,
  createOrder,
  updateOrderStatus,
  getSupplierAnalytics,
  getNotifications,
  markNotificationRead
} from '../controllers/supplyController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enable JWT protection for all supply chain routes
router.use(protect);

// ── Analytics & Notifications (Before parameter paths to avoid conflicts) ──
router.get('/analytics', authorize('admin', 'manager'), getSupplierAnalytics);
router.get('/notifications', authorize('admin', 'manager'), getNotifications);
router.put('/notifications/:id/read', authorize('admin', 'manager'), markNotificationRead);

// ── Contact / Vendor Registry ──
router.route('/contacts')
  .get(authorize('admin', 'manager'), getContacts)
  .post(authorize('admin', 'manager'), createContact);

router.route('/contacts/:id')
  .put(authorize('admin', 'manager'), updateContact)
  .delete(authorize('admin', 'manager'), deleteContact);

// ── Procurement & Sales Orders ──
router.route('/orders')
  .get(authorize('admin', 'manager'), getOrders)
  .post(authorize('admin', 'manager'), createOrder);

router.post('/orders/:id/status', authorize('admin', 'manager'), updateOrderStatus);

export default router;
