import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../context/NotificationContext';
import { 
  Bell, Check, Trash2, AlertTriangle, ShieldAlert, Award, Calendar, DollarSign, 
  SlidersHorizontal, CheckSquare, MessageSquare, Volume2
} from 'lucide-react';

const cardAnim = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 }
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read', 'Low Stock', 'Payroll', 'Announcement'

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'Low Stock':
        return <AlertTriangle size={18} color="var(--accent-rose)" />;
      case 'Payroll':
        return <DollarSign size={18} color="var(--accent-emerald)" />;
      case 'Announcement':
        return <Volume2 size={18} color="var(--accent-primary)" />;
      default:
        return <Bell size={18} color="var(--accent-cyan)" />;
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'Low Stock':
        return { bg: 'rgba(244,63,94,0.06)', border: 'rgba(244,63,94,0.2)', badge: 'badge-rose' };
      case 'Payroll':
        return { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.2)', badge: 'badge-success' };
      case 'Announcement':
        return { bg: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.2)', badge: 'badge-purple' };
      default:
        return { bg: 'rgba(34,211,238,0.06)', border: 'rgba(34,211,238,0.2)', badge: 'badge-info' };
    }
  };

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Alert & Notification Center</h1>
          <p className="page-subtitle">Track and review critical real-time triggers and logs.</p>
        </div>
        
        <div style={{ display: 'flex', gap: 10 }}>
          {unreadCount > 0 && (
            <button className="btn btn-secondary" onClick={() => markAllAsRead()} style={{ gap: 8 }}>
              <CheckSquare size={16} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Control Row */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <SlidersHorizontal size={16} color="var(--text-muted)" style={{ marginRight: 8 }} />
          {[
            { id: 'all', label: 'All Logs' },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'read', label: 'Archived' },
            { id: 'Low Stock', label: 'Low Stock' },
            { id: 'Payroll', label: 'Payroll' },
            { id: 'Announcement', label: 'Announcements' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: 'none',
                background: filter === btn.id ? 'var(--accent-primary)' : 'var(--bg-elevated)',
                color: filter === btn.id ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s',
                fontWeight: filter === btn.id ? 600 : 400
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notification List */}
      <div style={{ display: 'grid', gap: 12 }}>
        {filteredNotifs.length === 0 ? (
          <motion.div 
            className="glass-card" 
            style={{ padding: '60px 20px', textAlign: 'center' }}
            variants={cardAnim}
          >
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-elevated)',
              display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 16px',
              color: 'var(--text-muted)'
            }}>
              <Bell size={24} />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>No notifications found</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
              You are all caught up! No notifications fit the selected filters.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {filteredNotifs.map(notif => {
              const style = getTypeStyle(notif.type);
              return (
                <motion.div
                  key={notif._id}
                  className="glass-card"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    gap: 16,
                    background: notif.read ? 'var(--bg-surface)' : style.bg,
                    border: notif.read ? '1px solid var(--border)' : `1px solid ${style.border}`,
                    transition: 'all 0.2s'
                  }}
                  variants={cardAnim}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                >
                  <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10, background: 'var(--bg-elevated)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2
                    }}>
                      {getIcon(notif.type)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{notif.title}</span>
                        <span className={`badge ${style.badge}`} style={{ fontSize: 10, padding: '2px 8px' }}>
                          {notif.type}
                        </span>
                        {!notif.read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)' }} />}
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: '0 0 6px 0', lineHeight: 1.5 }}>
                        {notif.message}
                      </p>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    {!notif.read && (
                      <button 
                        onClick={() => markAsRead(notif._id)}
                        className="icon-btn" 
                        title="Mark as read"
                        style={{ color: 'var(--accent-emerald)' }}
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => clearNotification(notif._id)}
                      className="icon-btn" 
                      title="Clear log"
                      style={{ color: 'var(--accent-rose)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
