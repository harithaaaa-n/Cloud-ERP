import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--bg-base)'
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent-primary)',
          animation: 'spin 0.7s linear infinite'
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role verification (RBAC check)
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '80vh', padding: 24 }}>
        <div className="glass-card text-center" style={{ maxWidth: 460, padding: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'rgba(244,63,94,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <ShieldAlert size={32} color="var(--accent-rose)" />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Your account role (<strong>{user?.role}</strong>) does not have authorization to view this module. If this is in error, contact your administrator.
          </p>
          <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex' }}>
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
