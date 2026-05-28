import { useState, useEffect } from 'react';
import { Bell, Search, Settings, Sun, Moon, Menu, LogOut, User, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Header({ collapsed, setMobileOpen }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifs, setShowNotifs]     = useState(false);
  const [theme, setTheme]               = useState(() => localStorage.getItem('theme') || 'light');

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Derive display name and avatar initial from auth context
  const displayName = user?.name || 'User';
  const avatarChar  = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#header-settings-btn') && !e.target.closest('#settings-menu')) setShowSettings(false);
      if (!e.target.closest('#header-notifications-btn') && !e.target.closest('#notifs-menu')) setShowNotifs(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <header className={`header ${collapsed ? 'collapsed' : ''}`}>
      <button className="icon-btn mobile-menu-btn" onClick={() => setMobileOpen(true)}>
        <Menu size={20} />
      </button>

      <div className="header-search">
        <Search size={16} color="var(--text-muted)" />
        <input placeholder="Search employees, orders..." />
      </div>

      <div className="header-actions">
        <div style={{ position: 'relative' }}>
          <button className="icon-btn" id="header-notifications-btn" title="Notifications" onClick={() => { setShowNotifs(!showNotifs); setShowSettings(false); }}>
            <Bell size={17} />
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </button>
          
          <AnimatePresence>
            {showNotifs && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.15 }}
                id="notifs-menu"
                style={{ 
                  position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 320, padding: 16, zIndex: 100, 
                  background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={() => markAllAsRead()} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gap: 8, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif._id} 
                        onClick={() => !notif.read && markAsRead(notif._id)}
                        style={{ 
                          padding: 10, 
                          background: notif.read ? 'var(--bg-elevated)' : 'rgba(99,102,241,0.06)', 
                          borderRadius: 8, 
                          fontSize: 12, 
                          border: notif.read ? '1px solid var(--border)' : '1px solid rgba(99,102,241,0.2)',
                          cursor: notif.read ? 'default' : 'pointer',
                          transition: 'opacity 0.2s',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <span style={{ 
                            fontWeight: 700, 
                            color: notif.type === 'Low Stock' ? 'var(--accent-rose)' : 
                                   notif.type === 'Payroll' ? 'var(--accent-emerald)' : 'var(--accent-primary)' 
                          }}>
                            {notif.title}
                          </span>
                          {!notif.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{notif.message}</div>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                  <Link to="/notifications" onClick={() => setShowNotifs(false)} style={{ color: 'var(--accent-primary)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                    View all notifications
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ position: 'relative' }}>
          <button className="icon-btn" id="header-settings-btn" title="Settings" onClick={() => { setShowSettings(!showSettings); setShowNotifs(false); }}>
            <Settings size={17} />
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.15 }}
                id="settings-menu"
                style={{ 
                  position: 'absolute', right: 0, top: '100%', marginTop: 8, width: 220, padding: 16, zIndex: 100, 
                  background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                }}>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0 12px' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {theme === 'dark' ? <Moon size={14} color="var(--accent-primary)"/> : <Sun size={14} color="var(--accent-amber)"/>}
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                  
                  {/* Modern Toggle Switch */}
                  <div onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                       style={{ 
                         width: 44, height: 24, borderRadius: 12, background: theme === 'dark' ? 'var(--accent-primary)' : 'var(--bg-elevated)', 
                         border: '1px solid var(--border)', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' 
                       }}>
                    <motion.div
                      animate={{ x: theme === 'dark' ? 20 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      style={{ 
                        width: 18, height: 18, borderRadius: '50%', background: 'white', 
                        position: 'absolute', top: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                      }}
                    />
                  </div>
                </div>
                
                <div className="divider" style={{ margin: '8px 0 12px' }} />
                
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', marginBottom: 8 }}>
                  <User size={15} style={{ marginRight: 8 }} /> <span style={{ fontSize: 13, fontWeight: 600 }}>My Account</span>
                </button>
                <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--accent-rose)' }} onClick={handleLogout}>
                  <LogOut size={15} style={{ marginRight: 8 }} /> <span style={{ fontSize: 13, fontWeight: 600 }}>Log Out</span>
                </button>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} className="hide-mobile" />

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} className="hide-mobile">
          <div className="user-avatar" id="header-user-avatar">{avatarChar}</div>
          <div style={{ lineHeight: 1.3 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{displayName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role || 'Employee'}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
