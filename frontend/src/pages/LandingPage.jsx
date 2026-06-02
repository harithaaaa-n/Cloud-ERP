import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, ArrowRight, Activity, DollarSign, Users, Package, 
  Shield, Zap, BarChart3, Globe, Check, Truck, Sun, Moon, 
  Star, Menu, X, ArrowUpRight, TrendingUp, Sparkles, LogIn, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Animation Presets ───────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay },
});

const container = { maxWidth: 1200, margin: '0 auto', padding: '0 24px', width: '100%' };

export default function LandingPage() {
  const { user } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreview, setActivePreview] = useState('finance');

  // Theme synchronization
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'var(--bg-base)', 
      fontFamily: "'Poppins', sans-serif", 
      transition: 'background 0.3s ease',
      overflowX: 'hidden'
    }}>

      {/* ═══════════════════ HEADER / NAVBAR ═══════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(16px)', transition: 'background 0.3s ease, border-color 0.3s ease'
      }}>
        <div style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-violet))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(99,102,241,0.25)',
            }}>
              <Brain size={20} color="white" />
            </div>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              Cloud<span style={{ color: 'var(--accent-primary)' }}>ERP</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hide-mobile" style={{ display: 'flex', gap: 36 }}>
            {['Features', 'Dashboard preview', 'Stats', 'Reviews'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(' ', '-')}`} style={{
                fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)',
                textDecoration: 'none', transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.target.style.color = 'var(--accent-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >{item}</a>
            ))}
          </nav>

          {/* Right Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, borderRadius: 10, color: 'var(--text-secondary)',
                transition: 'background 0.2s, border-color 0.2s, color 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-bright)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon size={18} color="var(--text-secondary)" />
              ) : (
                <Sun size={18} color="var(--accent-amber)" />
              )}
            </button>

            {/* Auth Buttons / CTA */}
            <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {user ? (
                <Link to="/dashboard" className="btn btn-primary" style={{ borderRadius: 10, padding: '10px 20px', fontWeight: 600 }}>
                  Go to Dashboard <ArrowRight size={15} />
                </Link>
              ) : (
                <Link to="/login" className="btn btn-primary" style={{ borderRadius: 10, padding: '10px 22px', fontWeight: 600 }}>
                  Log In
                </Link>
              )}
            </div>

            {/* Hamburger for mobile */}
            <button 
              className="show-mobile-btn" 
              onClick={() => setMobileMenuOpen(prev => !prev)}
              style={{
                background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer',
                display: 'none', alignItems: 'center', justifyContent: 'center',
                width: 38, height: 38, borderRadius: 10, color: 'var(--text-primary)'
              }}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed', top: 72, left: 0, right: 0, zIndex: 99,
              background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
              padding: '24px 24px 32px', display: 'flex', flexDirection: 'column', gap: 20,
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
            }}
          >
            {['Features', 'Dashboard preview', 'Stats', 'Reviews'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)',
                  textDecoration: 'none'
                }}
              >{item}</a>
            ))}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {user ? (
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ justifyContent: 'center', borderRadius: 10 }}>
                  Go to Dashboard <ArrowRight size={15} />
                </Link>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary" style={{ justifyContent: 'center', borderRadius: 10 }}>
                  Log In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════ HERO SECTION ═══════════════════════════════ */}
      <section style={{ 
        position: 'relative', 
        padding: '72px 0 96px', 
        background: 'radial-gradient(ellipse 60% 50% at 50% -10%, rgba(99,102,241,0.1), transparent)' 
      }}>
        <div style={{ ...container, display: 'grid', gridTemplateColumns: '1fr', gap: 56, alignItems: 'center' }} className="hero-split-grid">
          {/* Hero Left Content */}
          <motion.div {...fadeUp(0)}>
            {/* Version Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 99,
              background: 'rgba(99,102,241,0.08)', color: 'var(--accent-primary)',
              fontSize: 12, fontWeight: 600, marginBottom: 20,
              border: '1px solid rgba(99,102,241,0.15)'
            }}>
              <Sparkles size={13} style={{ color: 'var(--accent-cyan)' }} /> CloudERP Enterprise Platform v2.0
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(32px, 4.5vw, 56px)', fontWeight: 800,
              color: 'var(--text-primary)', lineHeight: 1.15,
              letterSpacing: '-0.03em', marginBottom: 20,
            }}>
              Enterprise Operations,<br />
              <span style={{ 
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-violet) 50%, var(--accent-cyan) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 800
              }}>Redefined for the Cloud.</span>
            </h1>

            {/* Subtext */}
            <p style={{
              fontSize: 'clamp(15px, 1.2vw, 18px)', color: 'var(--text-secondary)',
              lineHeight: 1.7, marginBottom: 36, maxWidth: 560
            }}>
              Eliminate data silos with a unified workspace. Connect your Ledger accounts, automate HR payroll approvals, track warehouses in real-time, and run predictive forecasting with AI analytics.
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {user ? (
                <Link to="/dashboard" className="btn btn-primary" style={{ padding: '14px 30px', fontSize: 15, borderRadius: 10, fontWeight: 600 }}>
                  Go to Dashboard <ArrowRight size={16} />
                </Link>
              ) : (
                <Link to="/login" className="btn btn-primary" style={{ padding: '14px 30px', fontSize: 15, borderRadius: 10, fontWeight: 600 }}>
                  Log In to Access Workspace <ArrowRight size={16} />
                </Link>
              )}
            </div>

            {/* Features small bullet line */}
            <div style={{ display: 'flex', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
              {['No Credit Card', 'Instantly Seeded', 'GDPR Compliant'].map((text, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>
                  <Check size={14} color="var(--accent-emerald)" strokeWidth={3} />
                  {text}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero Right Interactive Widget */}
          <motion.div {...fadeUp(0.15)} style={{ position: 'relative' }}>
            <div className="hero-glow-back" style={{
              position: 'absolute', inset: -10,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(34,211,238,0.1))',
              borderRadius: 24, filter: 'blur(30px)', zIndex: 0,
            }} />

            {/* The Dashboard Frame */}
            <div className="glass-card" style={{
              position: 'relative', zIndex: 1, borderRadius: 20,
              background: 'var(--bg-surface)', border: '1px solid var(--border)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)', overflow: 'hidden'
            }}>
              {/* Frame Header */}
              <div style={{
                background: 'var(--bg-elevated)', padding: '14px 20px',
                borderBottom: '1px solid var(--border)', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
                </div>
                <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>clouderp.net/dashboard</div>
                <div style={{ width: 28 }} />
              </div>

              {/* Tab Selector */}
              <div style={{ display: 'flex', background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}>
                {[
                  { id: 'finance', label: 'Financial Core', icon: DollarSign },
                  { id: 'hr', label: 'Workforce Hub', icon: Users },
                  { id: 'logistics', label: 'Stock & Logistics', icon: Package }
                ].map(t => {
                  const isActive = activePreview === t.id;
                  const TabIcon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActivePreview(t.id)}
                      style={{
                        flex: 1, padding: '12px 14px', border: 'none', background: isActive ? 'var(--bg-surface)' : 'none',
                        color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', gap: 6,
                        borderBottom: isActive ? '2px solid var(--accent-primary)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <TabIcon size={14} />
                      <span className="hide-mobile-tab-text">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Preview Container */}
              <div style={{ padding: 24, minHeight: 220, display: 'flex', flexDirection: 'column', gap: 20 }}>
                {activePreview === 'finance' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Net Cash Flow</span>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-emerald)', marginTop: 4 }}>+₹4,812,940</div>
                      </div>
                      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: 14 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Pending Payouts</span>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-amber)', marginTop: 4 }}>₹842,500</div>
                      </div>
                    </div>
                    {/* Fake visual bar chart */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)' }}>Quarterly Revenue Growth</span>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70, borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
                        {[30, 45, 60, 50, 75, 95, 80, 100].map((val, idx) => (
                          <div key={idx} style={{
                            flex: 1, height: `${val}%`, borderRadius: '4px 4px 0 0',
                            background: idx === 7 ? 'linear-gradient(to top, var(--accent-primary), var(--accent-cyan))' : 'var(--border-bright)'
                          }} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activePreview === 'hr' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Active Team List</span>
                      <span style={{ color: 'var(--accent-primary)' }}>3 Members Present</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { name: 'Arjun Mehta', role: 'Software Engineer', status: 'Present', color: 'badge-success' },
                        { name: 'Priya Sharma', role: 'HR Lead', status: 'Approved Leave', color: 'badge-amber' },
                        { name: 'Vikram Manager', role: 'Operations head', status: 'Present', color: 'badge-success' }
                      ].map((emp, i) => (
                        <div key={i} style={{ 
                          background: 'var(--bg-elevated)', border: '1px solid var(--border)', 
                          borderRadius: 10, padding: '10px 14px', display: 'flex', 
                          alignItems: 'center', justifyContent: 'space-between', fontSize: 12
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ 
                              width: 24, height: 24, borderRadius: '50%', background: 'var(--border-bright)', 
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 10 
                            }}>{emp.name[0]}</div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{emp.name}</div>
                              <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{emp.role}</div>
                            </div>
                          </div>
                          <span style={{ 
                            padding: '3px 8px', borderRadius: 99, fontSize: 10, fontWeight: 600,
                            background: emp.status === 'Present' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                            color: emp.status === 'Present' ? 'var(--accent-emerald)' : 'var(--accent-amber)'
                          }}>{emp.status}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activePreview === 'logistics' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Low-Stock Monitor</span>
                      <span style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>⚠️ Critical Alerts</span>
                    </div>
                    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
                        <span>PRODUCT SKU</span>
                        <span>QTY LEFT</span>
                        <span>STATUS</span>
                      </div>
                      <div style={{ borderBottom: '1px solid var(--border)', margin: '8px 0' }} />
                      {[
                        { sku: 'SKU-842: Silicon Chips', qty: '14 units', status: 'Restocking', color: 'var(--accent-rose)' },
                        { sku: 'SKU-105: Core Connectors', qty: '48 units', status: 'Healthy', color: 'var(--accent-emerald)' }
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600 }}>{item.sku}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{item.qty}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, color: item.color }}>{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════ TRUST LOGO SCROLLER ═══════════════════════ */}
      <section style={{ 
        padding: '36px 0', 
        borderTop: '1px solid var(--border)', 
        borderBottom: '1px solid var(--border)', 
        background: 'var(--bg-surface)' 
      }}>
        <div style={{ ...container, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            Trusted by fast-growing startups and global systems
          </span>
          <div style={{ 
            display: 'flex', justifyContent: 'space-around', width: '100%', 
            flexWrap: 'wrap', gap: 24, opacity: 0.65 
          }} className="logo-strip">
            {['VERTEX', 'Horizon LLC', 'STELLAR CO.', 'Zenith ERP', 'Pulse Inc.'].map((logo, i) => (
              <span key={i} style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ FEATURES GRID ════════════════════════════ */}
      <section id="features" style={{ padding: '96px 0' }}>
        <div style={container}>
          {/* Header */}
          <motion.div {...fadeUp(0)} style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Core Modules</span>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, color: 'var(--text-primary)', marginTop: 8, marginBottom: 16 }}>
              A Unified Operating System for Growth
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
              Ditch the friction of multiple platforms. Manage capital flows, employee lifecycles, global shipping routes, and warehouse stock from a single source of truth.
            </p>
          </motion.div>

          {/* Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}>
            <FeatureCard delay={0.00} icon={DollarSign} title="Finance & Ledger Core" desc="Double-entry automated ledger logs, localized GST/VAT checks, dynamic cash flow tracking, and automated balance sheets." color="var(--accent-emerald)" />
            <FeatureCard delay={0.06} icon={Users} title="Human Capital Hub" desc="Employee records, automated check-in and check-out logs, request management, leave approval, and smart payslip generation." color="#60a5fa" />
            <FeatureCard delay={0.12} icon={Package} title="Dynamic Warehouse Stock" desc="Multi-warehouse monitoring, automated low-stock triggers, supplier catalog lookup, and rapid barcoding integration." color="var(--accent-amber)" />
            <FeatureCard delay={0.18} icon={TrendingUp} title="Predictive ML Forecasting" desc="Predict invoice clearance dates, analyze inventory depletion rates, and identify supply bottlenecks using AI analytics." color="var(--accent-primary)" />
            <FeatureCard delay={0.24} icon={Shield} title="Granular RBAC Security" desc="Enforced endpoint protection, field-level data privacy exclusions, and ownership validation for employee records." color="var(--accent-rose)" />
            <FeatureCard delay={0.30} icon={Truck} title="SCM & Purchase Orders" desc="Procurement workflows, purchase requisition tracking, supplier dispatch tracking, and digital shipment confirmations." color="var(--accent-cyan)" />
          </div>
        </div>
      </section>

      {/* ═══════════════════ INTERACTIVE PRODUCT PREVIEW ════════════════ */}
      <section id="dashboard-preview" style={{ 
        padding: '96px 0', 
        background: 'var(--bg-surface)', 
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)' 
      }}>
        <div style={container}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 56, alignItems: 'center' }} className="preview-split-grid">
            
            {/* Left copy */}
            <motion.div {...fadeUp(0)}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Performance First</span>
              <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, color: 'var(--text-primary)', marginTop: 8, marginBottom: 20, lineHeight: 1.25 }}>
                Designed for swift workflows and ultimate data clarity
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 32 }}>
                CloudERP provides high-performance rendering. View active attendance dashboards, process bulk accounts, and review vendor shipments instantly with zero lag.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {[
                  'Automated database daily backup & state persistence',
                  'Instant React updates driven by socket events',
                  'Enterprise-grade security using JWT token rotation',
                  'Mobile-first responsive design on all layouts'
                ].map((txt, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: 'rgba(16,185,129,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <Check size={14} color="var(--accent-emerald)" strokeWidth={3} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{txt}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right mock component */}
            <motion.div {...fadeUp(0.12)} style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: -20,
                background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(99,102,241,0.08))',
                borderRadius: 24, filter: 'blur(30px)', zIndex: 0
              }} />

              {/* High fidelity stats mock card */}
              <div className="glass-card" style={{
                position: 'relative', zIndex: 1, padding: 32, borderRadius: 20,
                background: 'var(--bg-card)', border: '1px solid var(--border)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>Performance Dashboard</h3>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Real-time business status tracking</span>
                  </div>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                    background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)' 
                  }}>Live Feed</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
                  <div style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)', borderRadius: 12, padding: 16 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>System Load</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>99.8%</div>
                      <span style={{ fontSize: 10, color: 'var(--accent-emerald)', fontWeight: 600 }}>Optimal</span>
                    </div>
                  </div>
                  <div style={{ border: '1px solid var(--border)', background: 'var(--bg-elevated)', borderRadius: 12, padding: 16 }}>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Response Time</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <div style={{ fontSize: 24, fontWeight: 800 }}>120ms</div>
                      <span style={{ fontSize: 10, color: 'var(--accent-cyan)', fontWeight: 600 }}>Fast</span>
                    </div>
                  </div>
                </div>

                {/* Progress bar charts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { name: 'Finance Reconciliation', progress: 85, color: 'var(--accent-emerald)' },
                    { name: 'HR Payroll Automated', progress: 95, color: 'var(--accent-primary)' },
                    { name: 'SCM Requisitions Processed', progress: 70, color: 'var(--accent-amber)' }
                  ].map((bar, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{bar.name}</span>
                        <span style={{ fontWeight: 600 }}>{bar.progress}%</span>
                      </div>
                      <div style={{ width: '100%', height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${bar.progress}%`, height: '100%', background: bar.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ═══════════════════ STATS HIGHLIGHTS STRIP ══════════════════ */}
      <section id="stats" style={{ padding: '80px 0' }}>
        <div style={container}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
            gap: 24, 
            textAlign: 'center' 
          }}>
            <StatItem value="₹24.8M+" label="Transaction Volume Tracked" icon={BarChart3} />
            <StatItem value="99.99%" label="Uptime Service Level SLA" icon={Globe} />
            <StatItem value="< 150ms" label="API Endpoint Response Time" icon={Zap} />
            <StatItem value="14,000+" label="Active Enterprise Sessions" icon={Users} />
          </div>
        </div>
      </section>

      {/* ═══════════════════ CLIENT TESTIMONIALS ══════════════════════ */}
      <section id="reviews" style={{ 
        padding: '96px 0',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={container}>
          <motion.div {...fadeUp(0)} style={{ textAlign: 'center', marginBottom: 64 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>User Reviews</span>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 800, color: 'var(--text-primary)', marginTop: 8, marginBottom: 16 }}>
              Decisive Success Across Industries
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto' }}>
              Hear from administrative directors and finance controllers who have transformed their operations with CloudERP.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {[
              {
                text: "CloudERP transformed how we track our warehouse logistics. The ML service warns us of potential stock depletion weeks in advance.",
                author: "Nisha Patel",
                title: "Logistics Director, Apex Materials",
                stars: 5
              },
              {
                text: "Updating to v2.0 was a game-changer. The strict RBAC role guard controls ensure employee salaries are kept strictly confidential.",
                author: "Anand Sen",
                title: "VP of HR, Horizon FinTech",
                stars: 5
              },
              {
                text: "We integrated our accounts and payroll logs inside the Finance tab. The speed of generating dispersals is down to seconds.",
                author: "Sarah Jenkins",
                title: "Chief Accountant, Vertex Commerce",
                stars: 5
              }
            ].map((rev, index) => (
              <motion.div 
                key={index}
                {...fadeUp(index * 0.05)}
                className="glass-card"
                style={{ padding: 32, borderRadius: 16, display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                <div style={{ display: 'flex', gap: 4 }}>
                  {[...Array(rev.stars)].map((_, i) => (
                    <Star key={i} size={15} fill="var(--accent-amber)" color="var(--accent-amber)" />
                  ))}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1, italic: true }}>
                  "{rev.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <div style={{ 
                    width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: 'white'
                  }}>{rev.author[0]}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{rev.author}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{rev.title}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CALL TO ACTION ═══════════════════════════ */}
      <section style={{ padding: '112px 0', position: 'relative' }}>
        <div style={{ ...container, zIndex: 1, position: 'relative' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--bg-surface) 0%, rgba(99,102,241,0.08) 100%)',
            border: '1px solid var(--border)',
            borderRadius: 24, padding: '64px 32px', textAlign: 'center',
            boxShadow: 'var(--shadow-card)',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
              width: 300, height: 300, background: 'var(--accent-primary)',
              filter: 'blur(100px)', opacity: 0.12, zIndex: 0, borderRadius: '50%'
            }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 20, letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Scale Your Enterprise Operations Today
              </h2>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 36 }}>
                Empower your workforce with dynamic task access, secure ledger reports, and AI analytics. No complex configurations needed.
              </p>
              
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                {user ? (
                  <Link to="/dashboard" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 15, borderRadius: 10, fontWeight: 600 }}>
                    Go to Dashboard <ArrowRight size={16} />
                  </Link>
                ) : (
                  <Link to="/login" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 15, borderRadius: 10, fontWeight: 600 }}>
                    Log In to Access Workspace <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ FOOTER ═══════════════════════════════════ */}
      <footer style={{
        background: 'var(--bg-surface)', borderTop: '1px solid var(--border)',
        padding: '72px 0 36px', transition: 'background 0.3s ease, border-color 0.3s ease'
      }}>
        <div style={{ ...container }}>
          <div className="landing-footer-grid" style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: 48, marginBottom: 48,
          }}>
            {/* Brand column */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-violet))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Brain size={16} color="white" />
                </div>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>CloudERP</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 300, lineHeight: 1.7, marginBottom: 20 }}>
                Next-generation operating system for enterprise payroll, supply networks, and warehouse stock analytics.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <FooterLink label="Core Features" to="/#features" />
                <FooterLink label="Interactive Demo" to="/#dashboard-preview" />
                <FooterLink label="Product Metrics" to="/#stats" />
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Enterprise Solutions</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <FooterLink label="RBAC Security Guidelines" to="/login" />
                <FooterLink label="Predictive ML Service" to="/signup" />
                <FooterLink label="Developer API Hub" to="/login" />
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <FooterLink label="About System" to="/" />
                <FooterLink label="Careers Access" to="/" />
                <FooterLink label="Legal Policy" to="/" />
              </ul>
            </div>
          </div>

          {/* Bottom copyright line */}
          <div style={{
            borderTop: '1px solid var(--border)', paddingTop: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16,
          }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>© 2026 CloudERP Systems Inc. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 24 }}>
              <Link to="/" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link to="/" style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Embedded Responsive CSS overrides ────────────────────── */}
      <style>{`
        @media (max-width: 991px) {
          .hero-split-grid {
            grid-template-columns: 1fr !important;
            text-align: center !important;
          }
          .hero-split-grid div {
            margin-left: auto !important;
            margin-right: auto !important;
          }
          .hero-split-grid div div {
            justify-content: center !important;
          }
          .preview-split-grid {
            grid-template-columns: 1fr !important;
          }
          .landing-footer-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 32px !important;
          }
        }
        @media (max-width: 768px) {
          .hide-mobile {
            display: none !important;
          }
          .show-mobile-btn {
            display: flex !important;
          }
          .hide-mobile-tab-text {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          .landing-footer-grid {
            grid-template-columns: 1fr !important;
          }
          .logo-strip {
            gap: 16px !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   LOCAL SUB-COMPONENTS
   ════════════════════════════════════════════════════════════════════ */

function FeatureCard({ icon: Icon, title, desc, color, delay = 0 }) {
  return (
    <motion.div {...fadeUp(delay)}
      className="glass-card glass-card-hover"
      style={{ 
        padding: 32, 
        borderRadius: 18, 
        display: 'flex', 
        flexDirection: 'column', 
        background: 'var(--bg-surface)', 
        borderColor: 'var(--border)', 
        transition: 'background 0.3s ease, border-color 0.3s ease',
        cursor: 'default'
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
      }}>
        <Icon size={24} color={color} />
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1 }}>{desc}</p>
    </motion.div>
  );
}

function StatItem({ value, label, icon: Icon }) {
  return (
    <motion.div {...fadeUp(0.02)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(99,102,241,0.15)', marginBottom: 6
      }}>
        <Icon size={22} color="var(--accent-primary)" />
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</div>
    </motion.div>
  );
}

function FooterLink({ label, to }) {
  return (
    <li>
      <Link to={to} style={{
        fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none',
        transition: 'color 0.2s',
      }}
        onMouseEnter={e => e.target.style.color = 'var(--accent-primary)'}
        onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
      >{label}</Link>
    </li>
  );
}
