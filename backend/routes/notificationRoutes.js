import express from 'express';
import { getNotifications, markRead, markAllRead, createAnnouncement, deleteNotification } from '../controllers/notificationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllRead);
router.put('/:id/read', protect, markRead);
router.delete('/:id', protect, deleteNotification);
router.post('/announcement', protect, authorize('admin'), createAnnouncement);

export default router;
