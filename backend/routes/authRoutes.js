import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authSchemas } from '../middleware/validationSchemas.js';

const router = express.Router();

// ── Rate Limiting for Security ────────────────────────────────────
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 25, // limit each IP to 25 attempts
  message: {
    success: false,
    message: 'Too many attempts from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Public Routes ─────────────────────────────────────────────────
router.post('/register',        authRateLimiter, validate(authSchemas.register), registerUser);
router.post('/login',           authRateLimiter, validate(authSchemas.login), loginUser);
router.post('/logout',          logoutUser);
router.post('/refresh',         refreshAccessToken);
router.post('/forgot-password', authRateLimiter, validate(authSchemas.forgotPassword), forgotPassword);
router.post('/reset-password',  authRateLimiter, validate(authSchemas.resetPassword), resetPassword);
router.post('/verify-email',    authRateLimiter, validate(authSchemas.verifyEmail), verifyEmail);

// ── Protected Routes ──────────────────────────────────────────────
router.get('/me', protect, getMe);

export default router;
