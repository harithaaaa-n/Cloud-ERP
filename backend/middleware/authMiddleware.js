import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../config/logger.js';

// ── Protect Route Middleware ───────────────────────────────────────
// Verifies JWT from Authorization header: "Bearer <token>"
// Now uses asyncHandler so JWT errors flow through central errorMiddleware
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Extract token from Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Access denied. Authentication token is required.');
  }

  // 2. Verify token signature and expiry — throws JsonWebTokenError/TokenExpiredError
  //    which are caught and normalised by the central errorHandler
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3. Confirm user still exists in DB and has not been deleted since token issued
  const user = await User.findById(decoded.id).select('-password -refreshToken -resetPasswordToken -emailVerificationToken');

  if (!user) {
    throw new ApiError(401, 'Authentication failed. User account no longer exists.');
  }

  // 4. Confirm account is active (not suspended)
  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated. Please contact your system administrator.');
  }

  req.user = user;
  next();
});

// ── Role-Based Access Control Middleware ─────────────────────────
// Usage: router.get('/sensitive', protect, authorize('admin', 'manager'), handler)
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Guard against missing user (protect() should always run first)
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required before role check.'));
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`🚫 Unauthorized role access: User ${req.user._id} (${req.user.role}) attempted access to [${roles.join('|')}] route`);
      return next(new ApiError(403, `Access forbidden. This action requires one of the following roles: ${roles.join(', ')}.`));
    }

    next();
  };
};
