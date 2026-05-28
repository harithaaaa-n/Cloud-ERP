import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '80vh', padding: 20 }}>
      <motion.div 
        className="glass-card"
        style={{ 
          maxWidth: 480, width: '100%', padding: 40, textAlign: 'center', 
          border: '1px solid rgba(244,63,94,0.2)', background: 'rgba(244,63,94,0.02)' 
        }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div style={{
          width: 64, height: 64, borderRadius: '50%', background: 'rgba(244,63,94,0.1)',
          display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 24px',
          color: 'var(--accent-rose)'
        }}>
          <ShieldAlert size={36} />
        </div>
        
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Access Restricted</h1>
        
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 28 }}>
          You do not have the required administrative permissions to access this department node. If you believe this is in error, contact your administrator.
        </p>

        <button 
          onClick={() => navigate('/')} 
          className="btn btn-secondary" 
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <ArrowLeft size={16} style={{ marginRight: 8 }} /> Return to Dashboard
        </button>
      </motion.div>
    </div>
  );
}
