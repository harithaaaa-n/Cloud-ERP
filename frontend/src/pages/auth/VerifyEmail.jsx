import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { api } from '../../utils/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const performVerification = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing verification token in URL.');
        return;
      }

      try {
        const res = await api.auth.verifyEmail(token);
        if (res.success) {
          setStatus('success');
          setMessage(res.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(res.message || 'Verification failed.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Invalid or expired verification token.');
      }
    };

    performVerification();
  }, [token]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f3e8ff 100%)', padding: 16
    }}>
      <motion.div className="glass-card text-center" style={{ maxWidth: 450, padding: '40px 32px' }}
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        
        {status === 'verifying' && (
          <div>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'rgba(99,102,241,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
            }}>
              <Loader2 size={32} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Verifying Email Address</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Please wait while we confirm your credentials...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'rgba(16,185,129,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
            }}>
              <CheckCircle2 size={32} color="var(--accent-emerald)" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--accent-emerald)' }}>Email Verified!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>{message}</p>
            <Link to="/login" className="btn btn-primary" style={{ display: 'inline-flex' }}>
              Proceed to Sign In
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: 'rgba(244,63,94,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
            }}>
              <XCircle size={32} color="var(--accent-rose)" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: 'var(--accent-rose)' }}>Verification Failed</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>{message}</p>
            <Link to="/login" className="btn btn-secondary" style={{ display: 'inline-flex' }}>
              Return to Login
            </Link>
          </div>
        )}
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
