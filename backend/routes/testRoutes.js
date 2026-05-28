import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Protected Test Route ──────────────────────────────────────────
// @route   GET /api/test
// @desc    Verify JWT auth is working — returns token owner info
// @access  Protected (any role)
router.get('/', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: '🎉 Protected route accessed successfully!',
    authenticatedUser: {
      id:    req.user._id,
      name:  req.user.name,
      email: req.user.email,
      role:  req.user.role,
    },
    serverTime: new Date().toISOString(),
  });
});

// ── Admin-only Test Route ─────────────────────────────────────────
// @route   GET /api/test/admin
// @desc    Only accessible by admins
// @access  Protected (admin only)
router.get('/admin', protect, authorize('admin'), (req, res) => {
  res.status(200).json({
    success: true,
    message: '🔐 Admin-only route accessed successfully!',
    user: req.user.name,
  });
});

export default router;
