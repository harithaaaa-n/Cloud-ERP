import Notification from '../models/Notification.js';
import { emitToUser, broadcast } from '../config/socket.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../config/logger.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    $or: [
      { user: req.user.id },
      { user: null }
    ]
  }).sort({ createdAt: -1 }).limit(100);

  res.status(200).json({ success: true, data: notifications });
});

export const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, $or: [{ user: req.user.id }, { user: null }] },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  res.status(200).json({ success: true, data: notification });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { read: true }
  );

  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});

export const createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Please provide title and message' });
  }

  const notif = await Notification.create({
    title,
    message,
    type: 'Announcement',
    user: null
  });

  broadcast('notification', notif);
  res.status(201).json({ success: true, data: notif });
});

// Helper utility: create and dispatch notifications from within other controllers
export const createAndSendNotification = async (userId, title, message, type) => {
  try {
    const notif = await Notification.create({ user: userId, title, message, type });
    emitToUser(userId.toString(), 'notification', notif);
    return notif;
  } catch (err) {
    logger.error(`Failed to create/send notification for user ${userId}: ${err.message}`);
  }
};

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    $or: [{ user: req.user.id }, { user: null }]
  });

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  res.status(200).json({ success: true, message: 'Notification removed' });
});
