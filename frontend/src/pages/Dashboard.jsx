import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Calendar, Briefcase, ChevronRight,
  Package, ShoppingCart, AlertTriangle, Brain, Zap, Activity, Truck, Loader2, UserCheck, Shield
} from 'lucide-react';
const IconMap = { Activity, DollarSign, Users, Truck };
const mockRevenueData = [];
const categoryPieData = [];
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const fmtK = (n) => n >= 1_000_000 ? `₹${(n/1_000_000).toFixed(2)}M` : n >= 1_000 ? `₹${(n/1_000).toFixed(0)}K` : `₹${n}`;

const cardAnim = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

const StatCard = ({ label, value, change, positive, icon: Icon, color, delay }) => (
  <motion.div
    className={`stat-card ${color} glass-card-hover`}
    variants={cardAnim}
    transition={{ delay }}
  >
    <div className="flex items-center justify-between mb-4">
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `rgba(${color === 'indigo' ? '99,102,241' : color === 'cyan' ? '34,211,238' : color === 'emerald' ? '16,185,129' : color === 'amber' ? '245,158,11' : '244,63,94'}, 0.15)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={20} color={`var(--accent-${color})`} />
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-sm ${positive ? 'text-emerald-400' : 'text-rose-400'}`}
          style={{ color: positive ? 'var(--accent-emerald)' : 'var(--accent-rose)', fontSize: 13, fontWeight: 600 }}>
          {positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          {change}%
        </div>
      )}
    </div>
    <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>
      {typeof value === 'number' ? fmtK(value) : value}
    </div>
    <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{label}</div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card" style={{ padding: '12px 16px', fontSize: 13 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: {typeof p.value === 'number' ? fmtK(p.value) : p.value}
        </div>
      ))}
    </div>
  );
};

const severityStyle = {
  critical: { bg: 'rgba(244,63,94,0.1)',  border: 'rgba(244,63,94,0.3)',  dot: 'var(--accent-rose)' },
  warning:  { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', dot: 'var(--accent-amber)' },
  positive: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', dot: 'var(--accent-emerald)' },
};

// HR specific department distribution simulation
const hrDeptData = [
  { name: 'Engineering', value: 45, color: 'var(--accent-indigo)' },
  { name: 'Marketing', value: 20, color: 'var(--accent-cyan)' },
  { name: 'Operations', value: 25, color: 'var(--accent-emerald)' },
  { name: 'HR', value: 10, color: 'var(--accent-amber)' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userRole = user?.role || 'employee';
  const isManagerOrAdmin = ['admin', 'manager'].includes(userRole);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Only load general dashboard analytics if user is manager, admin, or hr
        if (['admin', 'manager', 'hr'].includes(userRole)) {
          const statsRes = await api.analytics.getDashboard();
          if (statsRes.success) setStats(statsRes.data);
        }

        // Only load AI Insights if admin or manager
        if (isManagerOrAdmin) {
          const insightsRes = await api.analytics.getInsights();
          if (insightsRes && insightsRes.success) setInsights(insightsRes.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError('Failed to fetch dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [userRole, isManagerOrAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading business analytics...</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const salesOrders = stats?.sales?.totalOrders || 0;
  const totalRevenue = stats?.finance?.revenue || 0;
  const totalExpenses = stats?.finance?.expenses || 0;
  const netProfit = stats?.finance?.profit || 0;
  const totalEmployees = stats?.hr?.totalEmployees || 0;
  const totalProducts = stats?.inventory?.totalProducts || 0;

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Good morning, <span>{user?.name?.split(' ')[0] || 'User'}</span>
          </h1>
          <p className="page-subtitle">
            {userRole === 'admin' && 'Enterprise Administration Dashboard Mode'}
            {userRole === 'manager' && 'Operations & Financial Management Console'}
            {userRole === 'hr' && 'Workforce Directory & Payroll Administrator Portal'}
            {userRole === 'employee' && 'Employee Self-Service & Directory Portal'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="badge badge-purple" style={{ fontSize: 11, padding: '6px 12px', gap: 6, display: 'flex', alignItems: 'center' }}>
            <Shield size={12} /> {userRole.toUpperCase()}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-white)' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 20, border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.05)', color: 'var(--accent-rose)' }}>
          {error}
        </div>
      )}

      {/* ── ROLE-BASED DASHBOARDS ────────────────────────────────────── */}

      {/* 1. ADMIN & MANAGER DASHBOARD */}
      {isManagerOrAdmin && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Total Revenue"     value={totalRevenue}   change={12.4}  positive icon={DollarSign} color="indigo"  delay={0.0} />
            <StatCard label="Total Expenses"    value={totalExpenses}  change={3.2}   positive={false} icon={TrendingDown} color="rose" delay={0.07} />
            <StatCard label="Active Employees"  value={totalEmployees} change={4.9}   positive icon={Users}     color="cyan"    delay={0.14} />
            <StatCard label="Inventory Items"   value={totalProducts}  change={2.1}   positive icon={Package}   color="emerald" delay={0.21} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
            {/* Revenue vs Expenses */}
            <motion.div className="glass-card p-6 lg:col-span-2" variants={cardAnim} transition={{ delay: 0.28 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title" style={{ margin: 0 }}>Revenue vs Expenses</h2>
                <span className="badge badge-success">Last 6 months</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={mockRevenueData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02}/>
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1e6}M`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#6366f1" fill="url(#revGrad)" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" fill="url(#expGrad)" strokeWidth={2} dot={{ fill: '#f43f5e', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Expense Breakdown Pie */}
            <motion.div className="glass-card p-6" variants={cardAnim} transition={{ delay: 0.35 }}>
              <h2 className="section-title">Expense Breakdown</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {categoryPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 8 }}>
                {categoryPieData.map((c) => (
                  <div key={c.name} className="flex items-center gap-2" style={{ fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: c.color }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{c.name} <strong style={{ color: 'var(--text-primary)' }}>{c.value}%</strong></span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* AI Insights */}
          {insights.length > 0 && (
            <motion.div className="glass-card" style={{ marginTop: 24, padding: 24 }} variants={cardAnim} transition={{ delay: 0.42 }}>
              <div className="flex items-center gap-3 mb-4">
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={18} color="white" />
                </div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>AI Business Insights</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Powered by predictive analytics</p>
                </div>
                <span className="badge badge-info" style={{ marginLeft: 'auto' }}>
                  <Zap size={10} /> Live
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {insights.map((insight, i) => {
                  const s = severityStyle[insight.severity] || severityStyle.warning;
                  const InsightIcon = IconMap[insight.icon] || Activity;
                  return (
                    <motion.div
                      key={i}
                      style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: 16 }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{ fontSize: 18 }}><InsightIcon size={18} color="var(--accent-primary)" /></span>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{insight.title}</span>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, marginLeft: 'auto', animation: 'aiPulse 2s ease-in-out infinite' }} />
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{insight.message}</p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Quick KPIs row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            {[
              { label: 'Net Profit', value: fmtK(netProfit), sub: `+22.1% MoM`, color: 'var(--accent-emerald)' },
              { label: 'Total Orders', value: salesOrders, sub: 'Fulfillment ledger', color: 'var(--accent-amber)' },
              { label: 'Total Products Catalog', value: totalProducts, sub: 'Active inventory SKUs', color: 'var(--accent-rose)' },
            ].map((kpi, i) => (
              <motion.div key={i} className="glass-card glass-card-hover" style={{ padding: 24 }} variants={cardAnim} transition={{ delay: 0.49 + i * 0.07 }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{kpi.label}</div>
                <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: kpi.color }}>{kpi.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{kpi.sub}</div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* 2. HR DASHBOARD */}
      {userRole === 'hr' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Total Staff Directory" value={totalEmployees} icon={Users} color="cyan" delay={0.0} />
            <StatCard label="Active Status Logs"    value="98.5%"        icon={UserCheck} color="emerald" delay={0.07} />
            <StatCard label="Leave Processing"      value="2 Pending"    icon={Calendar} color="amber" delay={0.14} />
            <StatCard label="Payroll Cycles"        value="Monthly"      icon={Briefcase} color="indigo" delay={0.21} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
            <motion.div className="glass-card p-6 lg:col-span-2" variants={cardAnim} transition={{ delay: 0.28 }}>
              <h2 className="section-title">Workforce Department Allocation</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={hrDeptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
                  <Bar dataKey="value" name="Headcount" fill="var(--accent-primary)" radius={[8, 8, 0, 0]}>
                    {hrDeptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div className="glass-card p-6 flex flex-col justify-between" variants={cardAnim} transition={{ delay: 0.35 }}>
              <div>
                <h2 className="section-title" style={{ marginBottom: 12 }}>HR Administration Shortcuts</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                  Expedite standard staffing protocols and issue employee pay stubs directly using standard controls.
                </p>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <Link to="/hr" className="btn btn-primary" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                  <span>Manage Employees</span> <ChevronRight size={16} />
                </Link>
                <Link to="/finance/payroll" className="btn btn-secondary" style={{ justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <span>Issue Payslips</span> <ChevronRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* 3. EMPLOYEE PORTAL */}
      {userRole === 'employee' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div className="glass-card p-6 md:col-span-2" variants={cardAnim} transition={{ delay: 0.1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Your Employee Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>NAME</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.name}</span>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>EMAIL</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.email}</span>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>SECURITY GROUP</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-primary)', textTransform: 'capitalize' }}>{user?.role}</span>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>STATUS</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-emerald)' }}>Active Session</span>
              </div>
            </div>
          </motion.div>

          <motion.div className="glass-card p-6 flex flex-col justify-between" variants={cardAnim} transition={{ delay: 0.2 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Self-Service Shortcuts</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                File leave requests, check logs, and inspect payslip listings securely.
              </p>
            </div>
            
            <div style={{ display: 'grid', gap: 10 }}>
              <Link to="/hr/profiles" className="btn btn-primary" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                <span>My Profile Directory</span> <ChevronRight size={16} />
              </Link>
              <Link to="/hr" className="btn btn-secondary" style={{ justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <span>Leave & Attendance</span> <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* 4. FINANCE PORTAL */}
      {userRole === 'finance' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div className="glass-card p-6 md:col-span-2" variants={cardAnim} transition={{ delay: 0.1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Finance Officer Profile</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>NAME</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.name}</span>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>EMAIL</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.email}</span>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>ROLE DEPT</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-indigo)', textTransform: 'capitalize' }}>{user?.role}</span>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>STATUS</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-emerald)' }}>Active Session</span>
              </div>
            </div>
          </motion.div>

          <motion.div className="glass-card p-6 flex flex-col justify-between" variants={cardAnim} transition={{ delay: 0.2 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Finance Shortcuts</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                Manage company ledger transactions, configure payroll, and audit account balances.
              </p>
            </div>
            
            <div style={{ display: 'grid', gap: 10 }}>
              <Link to="/finance" className="btn btn-primary" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                <span>Finance Overview</span> <ChevronRight size={16} />
              </Link>
              <Link to="/finance/accounts" className="btn btn-secondary" style={{ justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <span>Ledger Accounts</span> <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* 5. INVENTORY PORTAL */}
      {userRole === 'inventory' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div className="glass-card p-6 md:col-span-2" variants={cardAnim} transition={{ delay: 0.1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Inventory Specialist Profile</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>NAME</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.name}</span>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>EMAIL</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.email}</span>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>ROLE DEPT</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-emerald)', textTransform: 'capitalize' }}>{user?.role}</span>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>STATUS</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-emerald)' }}>Active Session</span>
              </div>
            </div>
          </motion.div>

          <motion.div className="glass-card p-6 flex flex-col justify-between" variants={cardAnim} transition={{ delay: 0.2 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Inventory Shortcuts</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                Audit warehouse stocks, log item adjustments, and update low-level warning thresholds.
              </p>
            </div>
            
            <div style={{ display: 'grid', gap: 10 }}>
              <Link to="/inventory" className="btn btn-primary" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                <span>Stock Catalog</span> <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* 6. SUPPLY CHAIN PORTAL */}
      {userRole === 'supply' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div className="glass-card p-6 md:col-span-2" variants={cardAnim} transition={{ delay: 0.1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Supply Chain Officer Profile</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>NAME</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.name}</span>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>EMAIL</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{user?.email}</span>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>ROLE DEPT</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-amber)', textTransform: 'capitalize' }}>{user?.role}</span>
              </div>
              <div style={{ padding: 16, background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>STATUS</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-emerald)' }}>Active Session</span>
              </div>
            </div>
          </motion.div>

          <motion.div className="glass-card p-6 flex flex-col justify-between" variants={cardAnim} transition={{ delay: 0.2 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Supply Chain Shortcuts</h2>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                Oversee supplier networks, track pending shipping coordinates, and generate purchase orders.
              </p>
            </div>
            
            <div style={{ display: 'grid', gap: 10 }}>
              <Link to="/supply" className="btn btn-primary" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                <span>Supplier Overview</span> <ChevronRight size={16} />
              </Link>
              <Link to="/supply/orders" className="btn btn-secondary" style={{ justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <span>Purchase Orders</span> <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
