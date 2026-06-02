import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, Activity, DollarSign, Users, Package, Shield, Zap, BarChart3, Globe, Check, Truck, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* ── Shared animation preset ─────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.5, delay },
});

/* ── Container widths ─────────────────────────────────────────────── */
const container = { maxWidth: 1140, margin: '0 auto', padding: '0 24px', width: '100%' };

export default function LandingPage() {
  const { user } = useAuth();
  
  // Theme state synced with localStorage, defaulting to 'light'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)', fontFamily: "'Poppins', sans-serif", transition: 'background 0.3s ease' }}>

      {/* ═══════════════════ HEADER ═══════════════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(16px)', transition: 'background 0.3s ease, border-color 0.3s ease'
      }}>
        <div style={{ ...container, display: 'flex', alignItems: 'center', justifyBetween: 'space-between', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 18px rgba(99,102,241,0.3)',
            }}>
              <Brain size={18} color="white" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>CloudERP</span>
          </Link>

          {/* Nav links — hidden on mobile */}
          <nav className="hide-mobile" style={{ display: 'flex', gap: 32 }}>
            {['Features', 'Highlights', 'Stats'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} style={{
                fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)',
                textDecoration: 'none', transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >{item}</a>
            ))}
          </nav>

          {/* Auth buttons & Theme toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Theme Toggle Button */}
            <button 
              onClick={toggleTheme}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 6, borderRadius: 8, color: 'var(--text-secondary)',
                transition: 'background 0.2s, color 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--bg-elevated)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'none';
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

            {user ? (
              <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login" style={{
                  fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)',
                  textDecoration: 'none', transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                >Log In</Link>
                <Link to="/signup" className="btn btn-primary" style={{ padding: '8px 20px' }}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════ MAIN CONTENT ═════════════════════════════ */}
      <main style={{ flex: 1 }}>

        {/* ─── Hero ──────────────────────────────────────────────────── */}
        <section style={{ padding: '80px 24px 64px', textAlign: 'center' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            {/* Badge */}
            <motion.div {...fadeUp(0)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 99,
              background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)',
              fontSize: 12, fontWeight: 600, marginBottom: 24,
            }}>
              <Zap size={13} /> CloudERP v2.0 — Now Live
            </motion.div>

            {/* Headline */}
            <motion.h1 {...fadeUp(0.08)} style={{
              fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 800,
              color: 'var(--text-primary)', lineHeight: 1.15,
              letterSpacing: '-0.03em', marginBottom: 20,
            }}>
              Enterprise Management,{' '}
              <span className="gradient-text">Redefined for the Cloud.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p {...fadeUp(0.16)} style={{
              fontSize: 'clamp(15px, 1.6vw, 18px)', color: 'var(--text-secondary)',
              lineHeight: 1.7, maxWidth: 580, margin: '0 auto 36px',
            }}>
              Streamline finances, HR, inventory, and supply chain — all in one unified, AI‑powered platform.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div {...fadeUp(0.24)} style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to={user ? '/dashboard' : '/signup'} className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 15 }}>
                Start Free Trial <ArrowRight size={16} style={{ marginLeft: 6 }} />
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: 15 }}>
                View Live Demo
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ─── Features ─────────────────────────────────────────────── */}
        <section id="features" style={{ padding: '80px 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', transition: 'background 0.3s ease, border-color 0.3s ease' }}>
          <div style={container}>
            {/* Section heading */}
            <motion.div {...fadeUp(0)} style={{ textAlign: 'center', marginBottom: 56 }}>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                Everything you need to scale
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
                Powerful modules designed to work together seamlessly, eliminating data silos and boosting productivity.
              </p>
            </motion.div>

            {/* Feature grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 20,
            }}>
              <FeatureCard delay={0.00} icon={DollarSign} title="Finance & Accounting"     desc="Automated ledgers, real-time balance sheets, and AI-driven payroll processing." color="var(--accent-emerald)" />
              <FeatureCard delay={0.06} icon={Users}      title="Human Resources"          desc="Employee profiles, leave management, attendance tracking, and performance." color="#60a5fa" />
              <FeatureCard delay={0.12} icon={Package}    title="Inventory & Stock"         desc="Smart SKU tracking, automated low-stock alerts, and multi-warehouse support." color="var(--accent-amber)" />
              <FeatureCard delay={0.18} icon={Activity}   title="Predictive AI Analytics"   desc="Forecast revenue trends and spot supply chain bottlenecks before they happen." color="var(--accent-primary)" />
              <FeatureCard delay={0.24} icon={Shield}     title="Enterprise Security"       desc="Role-based access control, JWT sessions, and advanced data encryption." color="var(--accent-rose)" />
              <FeatureCard delay={0.30} icon={Truck}      title="Supply Chain Management"   desc="End-to-end supplier tracking, PO automation, and delivery status monitoring." color="var(--accent-cyan)" />
            </div>
          </div>
        </section>

        {/* ─── Highlights ───────────────────────────────────────────── */}
        <section id="highlights" style={{ padding: '88px 0' }}>
          <div style={{ ...container, display: 'grid', gridTemplateColumns: '1fr', gap: 56, alignItems: 'center' }}
            className="landing-highlights-grid">
            {/* Left — copy */}
            <motion.div {...fadeUp(0)}>
              <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, lineHeight: 1.25 }}>
                Built for speed,<br /> designed for clarity
              </h2>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 28, maxWidth: 500 }}>
                CloudERP replaces bloated legacy systems with a lightning-fast React interface and a robust Node.js backend. Zero-latency inventory updates and real-time financial reporting.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <HighlightItem text="Real-time Socket.io notifications" />
                <HighlightItem text="99.9% uptime SLA guarantee" />
                <HighlightItem text="Automated daily database backups" />
                <HighlightItem text="MongoDB Atlas with connection pooling" />
              </ul>
            </motion.div>

            {/* Right — dashboard preview card */}
            <motion.div {...fadeUp(0.15)} style={{ position: 'relative' }}>
              {/* Glow */}
              <div style={{
                position: 'absolute', inset: -20,
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(34,211,238,0.08))',
                borderRadius: 28, filter: 'blur(40px)', zIndex: 0,
              }} />

              <div className="glass-card" style={{
                position: 'relative', zIndex: 1, padding: 28, borderRadius: 20,
                background: 'var(--bg-surface)', borderColor: 'var(--border)', transition: 'background 0.3s ease, border-color 0.3s ease'
              }}>
                {/* Mini stat row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
                  <MiniStat label="Revenue" value="₹12.4M" color="var(--accent-emerald)" />
                  <MiniStat label="Employees" value="148" color="var(--accent-primary)" />
                  <MiniStat label="Orders" value="2,340" color="var(--accent-amber)" />
                </div>

                {/* Fake chart bars */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 50].map((h, i) => (
                    <div key={i} style={{
                      flex: 1, height: `${h}%`, borderRadius: 4,
                      background: i >= 9 ? 'var(--accent-primary)' : 'var(--border)',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Jan</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Dec</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Stats strip ──────────────────────────────────────────── */}
        <section id="stats" style={{
          padding: '56px 0',
          background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
          transition: 'background 0.3s ease, border-color 0.3s ease'
        }}>
          <div style={{ ...container, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 24, textAlign: 'center' }}>
            <StatItem value="10K+" label="Transactions processed" icon={BarChart3} />
            <StatItem value="99.9%" label="Uptime guarantee" icon={Globe} />
            <StatItem value="6" label="Core ERP modules" icon={Package} />
            <StatItem value="< 200ms" label="API response time" icon={Zap} />
          </div>
        </section>

      </main>

      {/* ═══════════════════ FOOTER ═══════════════════════════════════ */}
      <footer style={{
        background: 'var(--bg-surface)', borderTop: '1px solid var(--border)',
        padding: '56px 0 32px', transition: 'background 0.3s ease, border-color 0.3s ease'
      }}>
        <div style={{ ...container }}>
          {/* Top row */}
          <div className="landing-footer-grid" style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
            gap: 40, marginBottom: 40,
          }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Brain size={15} color="white" />
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>CloudERP</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 320, lineHeight: 1.7 }}>
                The modern operating system for your entire business. Simple, powerful, and secure.
              </p>
            </div>

            {/* Product links */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <FooterLink label="Features" to="/#features" />
                <FooterLink label="Pricing" to="/" />
                <FooterLink label="Security" to="/" />
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <FooterLink label="About Us" to="/" />
                <FooterLink label="Careers" to="/" />
                <FooterLink label="Contact" to="/" />
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{
            borderTop: '1px solid var(--border)', paddingTop: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 12,
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2026 CloudERP Systems Inc. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link to="/" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
              <Link to="/" style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Responsive overrides via embedded style tag ─────────── */}
      <style>{`
        @media (min-width: 900px) {
          .landing-highlights-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 700px) {
          .landing-footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════════════════════════ */

function FeatureCard({ icon: Icon, title, desc, color, delay = 0 }) {
  return (
    <motion.div {...fadeUp(delay)}
      className="glass-card glass-card-hover"
      style={{ padding: 28, borderRadius: 16, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)', borderColor: 'var(--border)', transition: 'background 0.3s ease, border-color 0.3s ease' }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 12,
        background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 18,
      }}>
        <Icon size={22} color={color} />
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, flex: 1 }}>{desc}</p>
    </motion.div>
  );
}

function HighlightItem({ text }) {
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-secondary)', fontSize: 14 }}>
      <div style={{
        width: 22, height: 22, borderRadius: 99,
        background: 'rgba(16,185,129,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Check size={13} color="var(--accent-emerald)" strokeWidth={3} />
      </div>
      {text}
    </li>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)', borderRadius: 12, padding: '14px 16px',
      border: '1px solid var(--border)', transition: 'background 0.3s ease, border-color 0.3s ease'
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function StatItem({ value, label, icon: Icon }) {
  return (
    <motion.div {...fadeUp(0.05)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: 'rgba(99,102,241,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} color="var(--accent-primary)" />
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</div>
    </motion.div>
  );
}

function FooterLink({ label, to }) {
  return (
    <li>
      <Link to={to} style={{
        fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none',
        transition: 'color 0.2s',
      }}
        onMouseEnter={e => e.target.style.color = 'var(--accent-primary)'}
        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
      >{label}</Link>
    </li>
  );
}
