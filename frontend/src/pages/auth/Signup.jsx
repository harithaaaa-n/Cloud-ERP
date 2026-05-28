import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Eye, EyeOff, Brain,
  AlertCircle, CheckCircle2, Loader2, ArrowRight,
} from 'lucide-react';
import { api } from '../../utils/api';

/* ─── Page Background ───────────────────────────────────────────── */
function Background() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        background: 'linear-gradient(135deg, #f0f4ff 0%, #e8edff 50%, #f3e8ff 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.25,
          backgroundImage: 'radial-gradient(circle, #a5b4fc 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -128,
          right: -128,
          width: 384,
          height: 384,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(165,180,252,0.5), transparent)',
          filter: 'blur(60px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -128,
          left: -128,
          width: 384,
          height: 384,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(196,181,253,0.5), transparent)',
          filter: 'blur(60px)',
        }}
      />
    </div>
  );
}

/* ─── Form Input ────────────────────────────────────────────────── */
function FormInput({ id, type, label, value, onChange, Icon, error, rightSlot }) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? '#f87171'
    : focused
    ? '#6366f1'
    : '#d1d5db';

  const bgColor = error ? '#fff5f5' : focused ? '#fff' : '#f9fafb';
  const ringStyle = error
    ? { boxShadow: '0 0 0 3px rgba(248,113,113,0.15)' }
    : focused
    ? { boxShadow: '0 0 0 3px rgba(99,102,241,0.12)' }
    : {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#374151',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {/* Left icon */}
        <div
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: focused ? '#6366f1' : '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            transition: 'color 0.2s',
          }}
        >
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
            width: '100%',
            boxSizing: 'border-box',
            paddingLeft: 42,
            paddingRight: rightSlot ? 44 : 14,
            paddingTop: 11,
            paddingBottom: 11,
            fontSize: 14,
            borderRadius: 10,
            border: `1.5px solid ${borderColor}`,
            background: bgColor,
            color: '#111827',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            fontFamily: 'Inter, sans-serif',
            ...ringStyle,
            appearance: 'none',
            WebkitAppearance: 'none',
          }}
        />

        {rightSlot && (
          <div
            style={{
              position: 'absolute',
              right: 13,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {rightSlot}
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 12,
              fontWeight: 500,
              color: '#ef4444',
              margin: 0,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <AlertCircle size={12} style={{ flexShrink: 0 }} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Password Strength Meter ───────────────────────────────────── */
function PasswordStrength({ password }) {
  if (!password) return null;
  const checks = [
    { label: 'Min 6 chars',  pass: password.length >= 6 },
    { label: 'Number',       pass: /\d/.test(password) },
    { label: 'Uppercase',    pass: /[A-Z]/.test(password) },
    { label: 'Special char', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score     = checks.filter((c) => c.pass).length;
  const barColors = ['#e5e7eb', '#f87171', '#fbbf24', '#facc15', '#10b981'];
  const labels    = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const textColors = ['#9ca3af', '#ef4444', '#f59e0b', '#ca8a04', '#059669'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}
    >
      {/* Bars */}
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 9999,
              background: i <= score ? barColors[score] : '#e5e7eb',
              transition: 'background 0.3s',
            }}
          />
        ))}
      </div>
      {/* Label + check icons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: textColors[score] || '#9ca3af',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {labels[score] || 'Enter password'}
        </span>
        <div style={{ display: 'flex', gap: 5 }}>
          {checks.map((c) => (
            <span
              key={c.label}
              title={c.label}
              style={{ color: c.pass ? '#10b981' : '#d1d5db', transition: 'color 0.2s' }}
            >
              <CheckCircle2 size={12} />
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Success Screen ────────────────────────────────────────────── */
function SuccessScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Background />
      <motion.div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 18 }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(16,185,129,0.35)',
          }}
        >
          <CheckCircle2 size={40} color="white" strokeWidth={2} />
        </div>
        <div>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#111827',
              fontFamily: 'Poppins, sans-serif',
              margin: 0,
            }}
          >
            Account Created!
          </h2>
          <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
            Verification code generated in logs...
          </p>
        </div>
        <div style={{ display: 'flex', gap: 7 }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Signup Page ───────────────────────────────────────────────── */
export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm]         = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors]     = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess]   = useState(false);

  const handleChange = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
    if (apiError) setApiError('');
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())                           errs.name            = 'Full name is required.';
    else if (form.name.trim().length < 2)            errs.name            = 'Name must be at least 2 characters.';
    if (!form.email.trim())                          errs.email           = 'Email address is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email))      errs.email           = 'Please enter a valid email.';
    if (!form.password)                              errs.password        = 'Password is required.';
    else if (form.password.length < 6)               errs.password        = 'Password must be at least 6 characters.';
    if (!form.confirmPassword)                       errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);

    setLoading(true);
    setApiError('');
    try {
      await api.auth.register({
        name:     form.name.trim(),
        email:    form.email.trim().toLowerCase(),
        password: form.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2200);
    } catch (err) {
      setApiError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) return <SuccessScreen />;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        boxSizing: 'border-box',
      }}
    >
      <Background />

      <motion.div
        style={{ width: '100%', maxWidth: 480 }}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── Card ─────────────────────────────────────────────── */}
        <div
          style={{
            width: '100%',
            background: '#fff',
            borderRadius: 20,
            boxShadow: '0 8px 40px rgba(99,102,241,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            border: '1px solid rgba(99,102,241,0.1)',
            overflow: 'hidden',
          }}
        >
          {/* Accent bar */}
          <div
            style={{
              height: 4,
              width: '100%',
              background: 'linear-gradient(90deg, #34d399, #6366f1, #8b5cf6)',
            }}
          />

          {/* Card body */}
          <div style={{ padding: '36px 36px 28px', boxSizing: 'border-box' }}>

            {/* ── Logo block — centered ──────────────────────────── */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 14,
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                }}
              >
                <Brain size={26} color="white" strokeWidth={1.8} />
              </div>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: '#0f172a',
                  fontFamily: 'Poppins, sans-serif',
                  margin: 0,
                  letterSpacing: '-0.3px',
                }}
              >
                Cloud<span style={{ color: '#6366f1' }}>ERP</span>
              </h1>
              <p
                style={{
                  fontSize: 12,
                  color: '#9ca3af',
                  marginTop: 4,
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '0.5px',
                }}
              >
                Smart Business Management Platform
              </p>
            </div>

            {/* ── Section heading — left aligned ────────────────── */}
            <div style={{ marginBottom: 20 }}>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#1e293b',
                  fontFamily: 'Poppins, sans-serif',
                  margin: 0,
                }}
              >
                Create your account ✨
              </h2>
              <p
                style={{
                  fontSize: 13,
                  color: '#94a3b8',
                  marginTop: 4,
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                Join CloudERP and streamline your business
              </p>
            </div>

            {/* ── API Error Banner ───────────────────────────────── */}
            <AnimatePresence>
              {apiError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden', marginBottom: 16 }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 10,
                      background: '#fff5f5',
                      border: '1px solid #fecaca',
                      fontSize: 13,
                      color: '#dc2626',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                    {apiError}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Form ──────────────────────────────────────────── */}
            <form onSubmit={handleSubmit} noValidate>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Full name */}
                <FormInput
                  id="signup-name"
                  type="text"
                  label="Full name"
                  value={form.name}
                  onChange={handleChange('name')}
                  Icon={User}
                  error={errors.name}
                />

                {/* Email */}
                <FormInput
                  id="signup-email"
                  type="email"
                  label="Email address"
                  value={form.email}
                  onChange={handleChange('email')}
                  Icon={Mail}
                  error={errors.email}
                />

                {/* Password + strength */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <FormInput
                    id="signup-password"
                    type={showPass ? 'text' : 'password'}
                    label="Password"
                    value={form.password}
                    onChange={handleChange('password')}
                    Icon={Lock}
                    error={errors.password}
                    rightSlot={
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPass(!showPass)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#9ca3af',
                          display: 'flex',
                          alignItems: 'center',
                          padding: 0,
                        }}
                      >
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                  <AnimatePresence>
                    {form.password && <PasswordStrength password={form.password} />}
                  </AnimatePresence>
                </div>

                {/* Confirm password */}
                <FormInput
                  id="signup-confirm"
                  type={showConf ? 'text' : 'password'}
                  label="Confirm password"
                  value={form.confirmPassword}
                  onChange={handleChange('confirmPassword')}
                  Icon={Lock}
                  error={errors.confirmPassword}
                  rightSlot={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConf(!showConf)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0,
                      }}
                    >
                      {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />

                {/* Terms */}
                <p
                  style={{
                    fontSize: 12,
                    color: '#94a3b8',
                    fontFamily: 'Inter, sans-serif',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  By creating an account you agree to our{' '}
                  <span
                    style={{ color: '#6366f1', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span
                    style={{ color: '#6366f1', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Privacy Policy
                  </span>
                  .
                </p>

                {/* Submit */}
                <motion.button
                  type="submit"
                  id="signup-submit-btn"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  style={{
                    width: '100%',
                    padding: '13px 0',
                    borderRadius: 10,
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    background: loading
                      ? 'linear-gradient(135deg, #a5b4fc, #c4b5fd)'
                      : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    color: '#fff',
                    fontSize: 14,
                    fontWeight: 600,
                    fontFamily: 'Poppins, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    boxShadow: loading ? 'none' : '0 4px 16px rgba(99,102,241,0.4)',
                    transition: 'box-shadow 0.2s, background 0.2s',
                    opacity: loading ? 0.8 : 1,
                  }}
                >
                  {loading
                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Creating account…</>
                    : <><span>Create my account</span><ArrowRight size={16} /></>
                  }
                </motion.button>

              </div>
            </form>
          </div>

          {/* ── Footer strip ─────────────────────────────────────── */}
          <div
            style={{
              padding: '14px 36px',
              background: '#f8fafc',
              borderTop: '1px solid #f1f5f9',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: '#64748b',
                fontFamily: 'Inter, sans-serif',
                margin: 0,
              }}
            >
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: '#6366f1',
                  fontWeight: 600,
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Page footer */}
        <p
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: '#94a3b8',
            marginTop: 18,
            fontFamily: 'Inter, sans-serif',
          }}
        >
          © 2026 CloudERP · Enterprise Resource Planning · All rights reserved
        </p>
      </motion.div>

      {/* Spinner keyframe */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
