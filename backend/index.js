import dotenv from 'dotenv';
// ── Load Environment Variables FIRST ─────────────────────────────
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';

// ── Route Imports ─────────────────────────────────────────────────
import authRoutes         from './routes/authRoutes.js';
import testRoutes         from './routes/testRoutes.js';
import inventoryRoutes    from './routes/inventoryRoutes.js';
import supplyRoutes       from './routes/supplyRoutes.js';
import financeRoutes      from './routes/financeRoutes.js';
import hrRoutes           from './routes/hrRoutes.js';
import analyticsRoutes    from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import logger, { morganMiddleware } from './config/logger.js';

// ── Connect to MongoDB Atlas ──────────────────────────────────────
connectDB();

// ── Initialize Express App ────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

// ── Trust proxy (required when behind Nginx / Render load balancer) ──
// Allows express-rate-limit to read real client IP from X-Forwarded-For
app.set('trust proxy', 1);

// ── CORS Configuration ────────────────────────────────────────────
// Reads allowed origins from env so the same build works locally and in prod
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests (no Origin header) and whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    logger.warn(`🚫 CORS blocked request from origin: ${origin}`);
    callback(new Error(`CORS policy does not allow origin: ${origin}`));
  },
  credentials: true,
  methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400, // Pre-flight cache for 24 h — reduces OPTIONS spam
}));

// ── Helmet Security Headers ────────────────────────────────────────
// Applied AFTER CORS so CORS headers are not overwritten
app.use(helmet({
  // Prevent MIME-type sniffing
  noSniff: true,
  // Strict frame embedding control (clickjacking protection)
  frameguard: { action: 'deny' },
  // Enable browser-side XSS filter (legacy browsers)
  xssFilter: true,
  // Remove X-Powered-By: Express fingerprint
  hidePoweredBy: true,
  // Only allow HTTPS connections (production only)
  hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
  // Referrer policy — don't leak full URL to third parties
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// Separate CSP configuration for clarity
app.use(helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    'default-src':     ["'self'"],
    'script-src':      ["'self'"],                  // No unsafe-eval or unsafe-inline in prod
    'style-src':       ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    'font-src':        ["'self'", 'https://fonts.gstatic.com'],
    'connect-src':     [
      "'self'",
      process.env.FRONTEND_URL  || 'http://localhost:5173',
      process.env.ML_SERVICE_URL || 'http://localhost:8000',
      'ws://localhost:5000',
      'wss://localhost:5000',
    ],
    'img-src':         ["'self'", 'data:', 'blob:'],
    'frame-ancestors': ["'none'"],     // Redundant with frameguard but defence-in-depth
    'base-uri':        ["'self'"],
    'form-action':     ["'self'"],
  },
}));

// ── HTTP Parameter Pollution Prevention ───────────────────────────
// Prevents ?sort=asc&sort=desc style attacks
app.use(hpp());

// ── NoSQL Injection Prevention ────────────────────────────────────
// Strips MongoDB operator keys ($where, $gt, etc.) from request data
app.use(mongoSanitize({
  replaceWith: '_',           // Replace $ with _ so errors surface clearly
  onSanitize: ({ req, key }) => {
    logger.warn(`⚠️ NoSQL injection attempt sanitized — key: ${key} from IP: ${req.ip}`);
  },
}));

// ── Global API Rate Limiting ──────────────────────────────────────
const apiRateLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,  // 15-minute window
  max:             300,              // 300 req / window per IP
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Rate limit exceeded. Please try again later.' },
  // Skip rate-limiting for localhost in development
  skip: (req) => !isProd && req.ip === '::1',
});
app.use('/api', apiRateLimiter);

// ── HTTP Request Logging (Morgan → Winston) ───────────────────────
app.use(morganMiddleware);

// ── Body Parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));           // Reject oversized JSON payloads
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// ── API Routes ────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/test',          testRoutes);
app.use('/api/inventory',     inventoryRoutes);
app.use('/api/supply',        supplyRoutes);
app.use('/api/finance',       financeRoutes);
app.use('/api/hr',            hrRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// ── Health Check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success:     true,
    message:     '✅ CloudERP API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp:   new Date().toISOString(),
  });
});

// ── 404 & Global Error Handlers ───────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Unhandled Rejection / Uncaught Exception Safety Nets ──────────
process.on('unhandledRejection', (reason) => {
  logger.error(`🔴 Unhandled Promise Rejection: ${reason}`);
  // Graceful shutdown — let PM2/Docker restart the process
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`💥 Uncaught Exception: ${err.message}`, { stack: err.stack });
  server.close(() => process.exit(1));
});

// ── Start Server ──────────────────────────────────────────────────
initSocket(server);

server.listen(PORT, () => {
  logger.info(`🚀 CloudERP server running on port ${PORT}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📡 API Base: http://localhost:${PORT}/api`);
});
