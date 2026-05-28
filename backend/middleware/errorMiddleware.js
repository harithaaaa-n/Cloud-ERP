import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';

// ─── Central Error Handler ────────────────────────────────────────────────────
// Must be registered LAST in Express middleware chain with 4 args (err,req,res,next)
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // ── 1. Normalise all non-ApiError exceptions into ApiError ────────────────
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message    = error.message    || 'Internal Server Error';

    // Mongoose: invalid ObjectId format (e.g. /api/users/bad-id)
    if (error.name === 'CastError') {
      statusCode = 400;
      message    = `Invalid resource identifier format: ${error.value}`;
    }

    // MongoDB: duplicate unique-index violation
    if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      message    = `A record with that ${field} already exists.`;
    }

    // Mongoose: schema validation failures
    if (error.name === 'ValidationError') {
      statusCode = 400;
      const messages = Object.values(error.errors).map(e => e.message);
      message    = messages.join('. ');
    }

    // JWT: tampered or malformed token
    if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message    = 'Invalid authentication token. Please log in again.';
    }

    // JWT: valid but expired token
    if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message    = 'Authentication session has expired. Please log in again.';
    }

    // Mark as non-operational (unexpected system crash)
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
    error.isOperational = false;
  }

  // ── 2. Logging ────────────────────────────────────────────────────────────
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isOperational = error.isOperational !== false;

  if (!isOperational) {
    // Non-operational = unexpected crash — high-severity log
    logger.error(`💥 UNHANDLED SYSTEM ERROR [${error.statusCode}]: ${err.message}`, {
      stack:  err.stack,
      url:    req.originalUrl,
      method: req.method,
      ip:     req.ip,
    });
  } else if (error.statusCode >= 500) {
    logger.error(`🔴 Server Error [${error.statusCode}] ${req.method} ${req.originalUrl}: ${error.message}`);
  } else {
    logger.warn(`⚠️  Client Error [${error.statusCode}] ${req.method} ${req.originalUrl}: ${error.message}`);
  }

  // ── 3. Build Safe Response ────────────────────────────────────────────────
  const response = {
    success:    false,
    statusCode: error.statusCode,
    message:    error.message,
  };

  // Include validation error details when present
  if (error.errors && error.errors.length > 0) {
    response.errors = error.errors;
  }

  // Only expose stack trace in development — NEVER in production
  if (isDevelopment) {
    response.stack = error.stack;
  }

  // For unexpected server errors in production — scrub internal details
  if (!isDevelopment && error.statusCode === 500 && !isOperational) {
    response.message = 'An unexpected server error occurred. Our team has been notified.';
    delete response.errors;
  }

  res.status(error.statusCode).json(response);
};

// ─── 404 Not Found Handler ───────────────────────────────────────────────────
// Catches any request that didn't match a registered route
export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};
