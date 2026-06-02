import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Brain, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';

/* ─── Page Background ───────────────────────────────────────────── */
function Background() {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:-1, background:'linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #f3e8ff 100%)' }}>
      <div style={{
        position:'absolute', inset:0, opacity:0.25,
        backgroundImage:'radial-gradient(circle, #818cf8 1px, transparent 1px)',
        backgroundSize:'28px 28px',
      }} />
      <div style={{ position:'absolute', top:'-8rem', right:'-8rem', width:'24rem', height:'24rem', borderRadius:'50%', background:'rgba(199,210,254,0.5)', filter:'blur(60px)' }} />
      <div style={{ position:'absolute', bottom:'-8rem', left:'-8rem', width:'24rem', height:'24rem', borderRadius:'50%', background:'rgba(216,180,254,0.4)', filter:'blur(60px)' }} />
    </div>
  );
}

/* ─── Single Input Field ───────────────────────────────────────── */
function InputField({ id, type, label, value, onChange, Icon, error, rightSlot }) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
      <label htmlFor={id} style={{ fontSize:'13px', fontWeight:600, color:'#374151' }}>
        {label}
      </label>

      <div style={{ position:'relative' }}>
        {/* Icon */}
        <div style={{
          position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)',
          pointerEvents:'none', color: focused ? '#6366f1' : '#9ca3af',
          transition:'color 0.2s', display:'flex', alignItems:'center',
        }}>
          <Icon size={16} />
        </div>

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={`Enter your ${label.toLowerCase()}`}
          style={{
            width:'100%',
            paddingLeft:'42px',
            paddingRight: rightSlot ? '44px' : '14px',
            paddingTop:'11px',
            paddingBottom:'11px',
            fontSize:'14px',
            borderRadius:'10px',
            outline:'none',
            border: error
              ? '1.5px solid #fca5a5'
              : focused
              ? '1.5px solid #6366f1'
              : '1.5px solid #d1d5db',
            background: error ? '#fff7f7' : focused ? '#fff' : '#f9fafb',
            color:'#111827',
            boxShadow: focused && !error ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
            transition:'all 0.2s',
          }}
        />

        {rightSlot && (
          <div style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)' }}>
            {rightSlot}
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity:0, height:0 }}
            animate={{ opacity:1, height:'auto' }}
            exit={{ opacity:0, height:0 }}
            style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', color:'#ef4444', fontWeight:500, margin:0 }}
          >
            <AlertCircle size={12} style={{ flexShrink:0 }} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Login Page ────────────────────────────────────────────────── */
export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [demoMode, setDemoMode] = useState(() => localStorage.getItem('clouderp_demo_mode') === 'true');
  const [form, setForm]         = useState({ email:'', password:'' });
  const [errors, setErrors]     = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');

  const toggleDemoMode = () => {
    const next = !demoMode;
    setDemoMode(next);
    localStorage.setItem('clouderp_demo_mode', next ? 'true' : 'false');
  };

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field])  setErrors((p) => ({ ...p, [field]:'' }));
    if (apiError)       setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim())                      errs.email    = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email))  errs.email    = 'Please enter a valid email.';
    if (!form.password)                          errs.password = 'Password is required.';
    else if (form.password.length < 6)           errs.password = 'Password must be at least 6 characters.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    setApiError('');
    try {
      const data = await api.auth.login({ email: form.email.trim(), password: form.password });
      login(data.user, data.accessToken);
      navigate(from, { replace:true });
    } catch (err) {
      setApiError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px 16px' }}>
      <Background />

      <motion.div
        style={{ width:'100%', maxWidth:'480px' }}
        initial={{ opacity:0, y:24 }}
        animate={{ opacity:1, y:0 }}
        transition={{ duration:0.45, ease:[0.22,1,0.36,1] }}
      >
        {/* ───────── Card ───────────────────────────────────────── */}
        <div style={{
          background:'#fff',
          borderRadius:'20px',
          boxShadow:'0 8px 40px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06)',
          border:'1px solid #e5e7eb',
          overflow:'hidden',
        }}>

          {/* ── Top accent bar ──────────────────────────────────── */}
          <div style={{ height:'4px', background:'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)' }} />

          {/* ── Demo Mode Notice ────────────────────────────────── */}
          <div 
            onClick={toggleDemoMode}
            style={{
              padding: '10px 16px',
              background: demoMode ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
              borderBottom: '1px solid ' + (demoMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'),
              textAlign: 'center',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              color: demoMode ? '#d97706' : '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background 0.2s'
            }}
          >
            <span style={{ 
              width: 8, height: 8, borderRadius: '50%', 
              background: demoMode ? '#d97706' : '#059669',
              display: 'inline-block' 
            }} />
            {demoMode 
              ? 'Demo Mode Active (Local Sandbox). Click to switch to Live API.' 
              : 'Live API Active. Click to switch to Demo Sandbox.'
            }
          </div>

          {/* ── Logo section — CENTERED ─────────────────────────── */}
          <div style={{ padding:'36px 40px 28px', textAlign:'center', borderBottom:'1px solid #f3f4f6' }}>
            {/* Icon */}
            <div style={{
              width:'60px', height:'60px', borderRadius:'16px',
              background:'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              margin:'0 auto 16px',
              boxShadow:'0 4px 16px rgba(99,102,241,0.3)',
            }}>
              <Brain size={28} color="#fff" strokeWidth={1.8} />
            </div>

            {/* Brand name */}
            <h1 style={{ fontFamily:'Poppins, sans-serif', fontSize:'26px', fontWeight:800, color:'#111827', margin:0, lineHeight:1.2 }}>
              Cloud<span style={{ color:'#6366f1' }}>ERP</span>
            </h1>

            {/* Subtitle */}
            <p style={{ color:'#9ca3af', fontSize:'13px', marginTop:'6px', marginBottom:0 }}>
              Smart Business Management Platform
            </p>
          </div>

          {/* ── Form section — LEFT ALIGNED ─────────────────────── */}
          <div style={{ padding:'32px 40px 28px' }}>

            {/* Section heading */}
            <div style={{ marginBottom:'28px' }}>
              <h2 style={{ fontFamily:'Poppins, sans-serif', fontSize:'20px', fontWeight:700, color:'#111827', margin:'0 0 6px 0' }}>
                Welcome back 👋
              </h2>
              <p style={{ color:'#6b7280', fontSize:'14px', margin:0 }}>
                Sign in to your workspace to continue
              </p>
            </div>

            {/* API Error */}
            <AnimatePresence>
              {apiError && (
                <motion.div
                  initial={{ opacity:0, height:0, marginBottom:0 }}
                  animate={{ opacity:1, height:'auto', marginBottom:20 }}
                  exit={{ opacity:0, height:0, marginBottom:0 }}
                  style={{
                    display:'flex', alignItems:'flex-start', gap:'10px',
                    padding:'12px 16px', borderRadius:'10px',
                    background:'#fef2f2', border:'1px solid #fecaca',
                    color:'#dc2626', fontSize:'13px',
                  }}
                >
                  <AlertCircle size={15} style={{ flexShrink:0, marginTop:'1px' }} />
                  {apiError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

                {/* Email */}
                <InputField
                  id="login-email"
                  type="email"
                  label="Email address"
                  value={form.email}
                  onChange={handleChange('email')}
                  Icon={Mail}
                  error={errors.email}
                />

                {/* Password */}
                <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                  <InputField
                    id="login-password"
                    type={showPass ? 'text' : 'password'}
                    label="Password"
                    value={form.password}
                    onChange={handleChange('password')}
                    Icon={Lock}
                    error={errors.password}
                    rightSlot={
                      <button type="button" tabIndex={-1} onClick={() => setShowPass(!showPass)}
                        style={{ background:'none', border:'none', cursor:'pointer', color:'#9ca3af', display:'flex', padding:0 }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                  {/* Forgot password */}
                  <div style={{ textAlign:'right' }}>
                    <Link to="/forgot-password" style={{ fontSize:'12px', color:'#6366f1', fontWeight:600, textDecoration:'none' }}
                      onMouseEnter={e => e.target.style.textDecoration='underline'}
                      onMouseLeave={e => e.target.style.textDecoration='none'}>
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  id="login-submit-btn"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  style={{
                    width:'100%', padding:'13px', borderRadius:'10px',
                    fontFamily:'Poppins, sans-serif', fontWeight:600, fontSize:'14px',
                    color:'#fff', border:'none', cursor: loading ? 'not-allowed' : 'pointer',
                    background:'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: loading ? 'none' : '0 4px 18px rgba(99,102,241,0.4)',
                    opacity: loading ? 0.7 : 1,
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                    transition:'box-shadow 0.2s, opacity 0.2s',
                  }}
                >
                  {loading
                    ? <><Loader2 size={16} style={{ animation:'spin 0.8s linear infinite' }} /> Signing in…</>
                    : <><span>Sign in to CloudERP</span><ArrowRight size={16} /></>
                  }
                </motion.button>
              </div>
            </form>

            {/* Quick Demo Logins */}
            <div style={{ marginTop: '24px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', textAlign: 'center' }}>
                Quick Sandbox Access
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {[
                  { role: 'Admin', email: 'admin@clouderp.com' },
                  { role: 'HR', email: 'hr@clouderp.com' },
                  { role: 'Finance', email: 'finance@clouderp.com' },
                  { role: 'Manager', email: 'manager@clouderp.com' },
                  { role: 'Employee', email: 'employee@clouderp.com' },
                  { role: 'Inventory', email: 'inventory@clouderp.com' },
                  { role: 'Supply Chain', email: 'supply@clouderp.com' }
                ].map(acc => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => {
                      setForm({ email: acc.email, password: 'CloudERP@123' });
                      if (!demoMode) {
                        setDemoMode(true);
                        localStorage.setItem('clouderp_demo_mode', 'true');
                      }
                      setErrors({});
                      setApiError('');
                    }}
                    style={{
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      background: '#f9fafb',
                      color: '#4b5563',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#6366f1';
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.borderColor = '#6366f1';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.color = '#4b5563';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    {acc.role}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ── Footer strip — CENTERED ──────────────────────────── */}
          <div style={{
            padding:'16px 40px', background:'#f9fafb',
            borderTop:'1px solid #f3f4f6', textAlign:'center',
          }}>
            <p style={{ margin:0, fontSize:'14px', color:'#6b7280' }}>
              Don&apos;t have an account?{' '}
              <Link to="/signup" style={{ color:'#6366f1', fontWeight:700, textDecoration:'none' }}
                onMouseEnter={e => e.target.style.textDecoration='underline'}
                onMouseLeave={e => e.target.style.textDecoration='none'}>
                Create free account
              </Link>
            </p>
          </div>
        </div>

        {/* Page footer */}
        <p style={{ textAlign:'center', fontSize:'12px', color:'#9ca3af', marginTop:'20px' }}>
          © 2026 CloudERP · All rights reserved
        </p>
      </motion.div>

      {/* Keyframe for spinner */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
