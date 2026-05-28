import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resetToken, setResetToken] = useState(''); // Retained for sandbox/dev convenience

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.auth.forgotPassword(email);
      if (res.success) {
        setSuccess(true);
        if (res.resetToken) {
          setResetToken(res.resetToken);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to process forgot password request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f3e8ff 100%)', padding: 16
    }}>
      <motion.div className="glass-card" style={{ width: '100%', maxWidth: 450, padding: 36 }}
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Reset Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Enter your email address and we will generate a recovery link.</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div style={{
              display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.3)', color: 'var(--accent-rose)', fontSize: 13, marginBottom: 16
            }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%', background: 'rgba(16,185,129,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <CheckCircle2 size={24} color="var(--accent-emerald)" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Check server terminal!</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>
              The password reset token link has been logged to the backend console.
            </p>
            {resetToken && (
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8, marginBottom: 20 }}>
                <Link to={`/reset-password?token=${resetToken}`} style={{ color: 'var(--accent-primary)', fontSize: 12, fontWeight: 600 }}>
                  Click to simulate reset link locally
                </Link>
              </div>
            )}
            <Link to="/login" className="btn btn-secondary w-full" style={{ display: 'inline-flex', justifyContent: 'center' }}>
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input className="form-input" style={{ paddingLeft: 36 }} type="email" placeholder="e.g. name@company.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
              {loading ? (
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <>Send Instructions <ArrowRight size={15} /></>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Link to="/login" style={{ fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                Back to Login
              </Link>
            </div>
          </form>
        )}
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
