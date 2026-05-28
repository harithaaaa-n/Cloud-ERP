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
router.get('/analytics', authorize('admin', 'manager', 'supply'), getSupplierAnalytics);
router.get('/notifications', authorize('admin', 'manager', 'supply'), getNotifications);
router.put('/notifications/:id/read', authorize('admin', 'manager', 'supply'), markNotificationRead);

// ── Contact / Vendor Registry ──
router.route('/contacts')
  .get(authorize('admin', 'manager', 'supply'), getContacts)
  .post(authorize('admin', 'manager', 'supply'), createContact);

router.route('/contacts/:id')
  .put(authorize('admin', 'manager', 'supply'), updateContact)
  .delete(authorize('admin', 'manager', 'supply'), deleteContact);

// ── Procurement & Sales Orders ──
router.route('/orders')
  .get(authorize('admin', 'manager', 'supply'), getOrders)
  .post(authorize('admin', 'manager', 'supply'), createOrder);

router.post('/orders/:id/status', authorize('admin', 'manager', 'supply'), updateOrderStatus);

export default router;
