import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { setAccessToken, registerLogoutCallback } from '../utils/apiClient';
import apiClient from '../utils/apiClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Logout Handler ─────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Logout request failed or server unreachable', err);
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('clouderp_user_logged_in');
    }
  }, []);

  // ── Login Handler ──────────────────────────────────────────────
  const login = useCallback((userData, jwtAccessToken) => {
    setUser(userData);
    setAccessToken(jwtAccessToken);
    localStorage.setItem('clouderp_user_logged_in', 'true');
  }, []);

  // ── Session Initialization ─────────────────────────────────────
  useEffect(() => {
    // Register interceptor fallback to reset state on expired session
    registerLogoutCallback(() => {
      setUser(null);
      localStorage.removeItem('clouderp_user_logged_in');
    });

    const initSession = async () => {
      const wasLoggedIn = localStorage.getItem('clouderp_user_logged_in');
      if (wasLoggedIn) {
        try {
          // Attempt a silent token refresh
          const res = await apiClient.post('/api/auth/refresh', {}, { withCredentials: true });
          if (res.data.success && res.data.accessToken) {
            setAccessToken(res.data.accessToken);
            setUser(res.data.user);
          }
        } catch (err) {
          console.log('Silent token refresh failed or cookie expired.');
          localStorage.removeItem('clouderp_user_logged_in');
        }
      }
      setLoading(false);
    };

    initSession();
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
