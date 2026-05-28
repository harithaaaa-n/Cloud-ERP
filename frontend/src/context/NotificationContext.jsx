import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { api } from '../utils/api';
import { getAccessToken } from '../utils/apiClient';
import { useAuth } from './AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]); // List of active real-time toast alerts
  const { user } = useAuth();

  // Fetch initial notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.notifications.getNotifications();
      if (res && res.success) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.warn('Failed to load notifications history:', err);
    }
  }, []);

  // Mark single notification as read
  const markAsRead = async (id) => {
    try {
      const res = await api.notifications.markRead(id);
      if (res && res.success) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, read: true } : n))
        );
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const res = await api.notifications.markAllRead();
      if (res && res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  };

  // Clear/delete a single notification
  const clearNotification = async (id) => {
    try {
      const res = await api.notifications.deleteNotification(id);
      if (res && res.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Trigger local real-time toast
  const triggerToast = useCallback((notif) => {
    const id = Date.now() + Math.random().toString();
    setToasts(prev => [...prev, { ...notif, id }]);
    
    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  // Connect Socket.io client
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    fetchNotifications();

    // In dev: empty string → Vite proxy. In prod: deployed backend URL (wss:// auto-resolved)
    const socketUrlRaw = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '';
    const socketUrl = socketUrlRaw.endsWith('/api') ? socketUrlRaw.slice(0, -4) : socketUrlRaw;
    const token = getAccessToken();

    const socket = io(socketUrl, {
      auth:       { token },
      query:      { token },
      transports: ['websocket'],  // Skip HTTP long-polling — required on Render
      reconnectionAttempts: 5,
      reconnectionDelay:    2000,
    });

    socket.on('connect', () => {
      // Intentionally silent in production
    });

    socket.on('connect_error', (err) => {
      console.warn('⚡ Socket.io connection error:', err.message);
    });

    socket.on('notification', (newNotif) => {
      // Add to front of notifications list
      setNotifications(prev => [newNotif, ...prev]);

      // Trigger interactive visual toast banner
      triggerToast(newNotif);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, fetchNotifications, triggerToast]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearNotification, toasts }}>
      {children}
      
      {/* ── Floating Toast Manager Panel ────────────────────────────── */}
      <div style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 350, width: '100%'
      }}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', animation: 'pulse 1.5s infinite' }} />
                <strong style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-white)' }}>
                  {toast.title}
                </strong>
                <span className="badge badge-purple" style={{ fontSize: 9, marginLeft: 'auto' }}>
                  {toast.type || 'Alert'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                {toast.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
}
