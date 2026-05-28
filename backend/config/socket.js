import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import logger from './logger.js';

let io;
const userSockets = new Map(); // userId (string) → Set<socketId>

// ── Helper: extract allowed origins from env ──────────────────────
const getAllowedOrigins = () => {
  if (process.env.SOCKET_CORS_ORIGINS) {
    return process.env.SOCKET_CORS_ORIGINS.split(',').map(o => o.trim());
  }
  return ['http://localhost:3000', 'http://localhost:5173'];
};

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: getAllowedOrigins(),
      credentials: true,
      methods: ['GET', 'POST'],
    },
    // Prevent memory leaks — disconnect inactive clients
    pingTimeout:  20000,
    pingInterval: 25000,
  });

  // ── JWT Authentication Middleware for Socket.io ───────────────────
  // Runs before the 'connection' event — rejects unauthenticated sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) {
      logger.warn(`🔌 Socket rejected (no token): ${socket.id}`);
      return next(new Error('Authentication required. Provide a valid JWT.'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      logger.warn(`🔌 Socket rejected (invalid token): ${socket.id} — ${err.message}`);
      next(new Error('Invalid or expired authentication token.'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;

    // Register socket in the user→sockets map
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    logger.info(`🔌 Socket connected: User ${userId} (${socket.id})`);

    // Join a personal room so we can target the user directly
    socket.join(`user:${userId}`);

    socket.on('disconnect', (reason) => {
      const sockets = userSockets.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) userSockets.delete(userId);
      }
      logger.info(`🔌 Socket disconnected: ${socket.id} (${reason})`);
    });

    // Prevent client-side event flooding
    socket.onAny((event) => {
      // Only allow whitelisted client→server events
      const allowed = new Set(['ping', 'join-room']);
      if (!allowed.has(event)) {
        logger.warn(`⚠️ Unexpected socket event "${event}" from User ${userId}`);
      }
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) throw new Error('Socket.io not initialized yet.');
  return io;
};

// ── Emit to a specific user (all their active connections) ────────
export const emitToUser = (userId, event, data) => {
  if (!io || !userId) return false;
  const uid = userId.toString();
  if (!userSockets.has(uid)) return false;

  userSockets.get(uid).forEach(socketId => {
    io.to(socketId).emit(event, data);
  });
  return true;
};

// ── Broadcast to all connected sockets ───────────────────────────
export const broadcast = (event, data) => {
  if (!io) return false;
  io.emit(event, data);
  return true;
};
