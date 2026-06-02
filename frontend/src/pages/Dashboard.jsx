import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Users, Calendar, Briefcase, ChevronRight,
  Package, ShoppingCart, AlertTriangle, Brain, Zap, Activity, Truck, Loader2, UserCheck, Shield,
  CreditCard, FileText, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const IconMap = { Activity, DollarSign, Users, Truck };
const PIECOLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#4b5563'];

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;
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
          {p.name}: {typeof p.value === 'number' ? fmt(p.value) : p.value}
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

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [advancedData, setAdvancedData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userRole = user?.role || 'employee';
  const isManagerOrAdmin = ['admin', 'manager'].includes(userRole);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // 1. Fetch dashboard summaries for administrative roles
        if (['admin', 'manager', 'hr', 'finance', 'inventory', 'supply'].includes(userRole)) {
          const statsRes = await api.analytics.getDashboard();
          if (statsRes.success) setStats(statsRes.data);

          const advRes = await api.analytics.getAdvanced();
          if (advRes.success) setAdvancedData(advRes.data);
        }

        // 2. Fetch AI Insights for managers and admins
        if (isManagerOrAdmin) {
          const insightsRes = await api.analytics.getInsights();
          if (insightsRes && insightsRes.success) setInsights(insightsRes.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError('Failed to fetch dashboard intelligence. Please verify database connectivity.');
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
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Aggregating role-based dashboard intelligence...</span>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Statistics extraction
  const salesOrders = stats?.sales?.totalOrders || 0;
  const totalRevenue = stats?.finance?.revenue || 0;
  const totalExpenses = stats?.finance?.expenses || 0;
  const netProfit = stats?.finance?.profit || 0;
  const totalEmployees = stats?.hr?.totalEmployees || 0;
  const totalProducts = stats?.inventory?.totalProducts || 0;

  // Chart Mappings from Advanced Analytics
  const chartRevenueData = advancedData?.monthlyTrends || [];
  const chartCategoryPieData = advancedData?.inventoryBreakdown?.map((item, idx) => ({
    name: item.category,
    value: item.retailValue,
    color: PIECOLORS[idx % PIECOLORS.length]
  })) || [];
  const chartHRDeptData = advancedData?.departmentMetrics?.map((item, idx) => ({
    name: item.department,
    value: item.employees,
    color: PIECOLORS[idx % PIECOLORS.length]
  })) || [];

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
            {userRole === 'finance' && 'Corporate Cashflow & Accounts Ledger Portal'}
            {userRole === 'inventory' && 'Inventory Catalog & Stock Control Console'}
            {userRole === 'supply' && 'Supply Chain Management & Procurement Hub'}
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

      {/* 1. ADMIN DASHBOARD */}
      {userRole === 'admin' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Total Revenue"     value={totalRevenue}   change={12.4}  positive icon={DollarSign} color="indigo"  delay={0.0} />
            <StatCard label="Total Expenses"    value={totalExpenses}  change={3.2}   positive={false} icon={TrendingDown} color="rose" delay={0.07} />
            <StatCard label="Active Employees"  value={totalEmployees} change={4.9}   positive icon={Users}     color="cyan"    delay={0.14} />
            <StatCard label="Inventory Items"   value={totalProducts}  change={2.1}   positive icon={Package}   color="emerald" delay={0.21} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
            <motion.div className="glass-card p-6 lg:col-span-2" variants={cardAnim} transition={{ delay: 0.28 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title" style={{ margin: 0 }}>System Cashflow Trend</h2>
                <span className="badge badge-success">Revenue vs Expense</span>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartRevenueData}>
                  <defs>
                    <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02}/>
                    </linearGradient>
                    <linearGradient id="adminExpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1e3}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#6366f1" fill="url(#adminRevGrad)" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" fill="url(#adminExpGrad)" strokeWidth={2} dot={{ fill: '#f43f5e', r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div className="glass-card p-6" variants={cardAnim} transition={{ delay: 0.35 }}>
              <h2 className="section-title">Stock Valuation by Category</h2>
              {chartCategoryPieData.length === 0 ? (
                <div className="flex items-center justify-center" style={{ height: 200, color: 'var(--text-secondary)' }}>No inventory catalog data.</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie data={chartCategoryPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                        {chartCategoryPieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 8px', marginTop: 8, maxHeight: 60, overflowY: 'auto' }}>
                    {chartCategoryPieData.slice(0, 4).map((c) => (
                      <div key={c.name} className="flex items-center gap-1" style={{ fontSize: 10 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.color }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{c.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
            <motion.div className="glass-card p-6 lg:col-span-2" variants={cardAnim} transition={{ delay: 0.42 }}>
              <h2 className="section-title">Administrative Shortcuts</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                <Link to="/hr" className="glass-card p-4 text-center hover:bg-[rgba(255,255,255,0.02)] transition flex flex-col items-center">
                  <Users size={24} color="var(--accent-cyan)" style={{ marginBottom: 8 }} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Manage Staff</span>
                </Link>
                <Link to="/finance" className="glass-card p-4 text-center hover:bg-[rgba(255,255,255,0.02)] transition flex flex-col items-center">
                  <DollarSign size={24} color="var(--accent-indigo)" style={{ marginBottom: 8 }} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Accounting</span>
                </Link>
                <Link to="/inventory" className="glass-card p-4 text-center hover:bg-[rgba(255,255,255,0.02)] transition flex flex-col items-center">
                  <Package size={24} color="var(--accent-emerald)" style={{ marginBottom: 8 }} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>Stock</span>
                </Link>
                <Link to="/reports" className="glass-card p-4 text-center hover:bg-[rgba(255,255,255,0.02)] transition flex flex-col items-center">
                  <TrendingUp size={24} color="var(--accent-amber)" style={{ marginBottom: 8 }} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>ERP Reports</span>
                </Link>
              </div>
            </motion.div>
            
            <motion.div className="glass-card p-6" variants={cardAnim} transition={{ delay: 0.49 }}>
              <h2 className="section-title">Net Margins</h2>
              <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>Net Profit</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{fmtK(netProfit)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>SCM Order Volume</span>
                  <span style={{ fontWeight: 700 }}>{salesOrders} Orders</span>
                </div>
              </div>
            </motion.div>
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
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartHRDeptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }} />
                  <Bar dataKey="value" name="Headcount" fill="var(--accent-primary)" radius={[8, 8, 0, 0]}>
                    {chartHRDeptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div className="glass-card p-6 flex flex-col justify-between" variants={cardAnim} transition={{ delay: 0.35 }}>
              <div>
                <h2 className="section-title" style={{ marginBottom: 12 }}>HR Quick Operations</h2>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                  Expedite standard staffing protocols, issue salary pay slips, and verify leave balances.
                </p>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <Link to="/hr" className="btn btn-primary" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                  <span>Manage Employees</span> <ChevronRight size={16} />
                </Link>
                <Link to="/hr/profiles" className="btn btn-secondary" style={{ justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <span>Employee Profiles</span> <ChevronRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* 3. MANAGER DASHBOARD */}
      {userRole === 'manager' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Active Staff"        value={totalEmployees} icon={Users} color="cyan" delay={0.0} />
            <StatCard label="Department Profit"   value={netProfit}      icon={DollarSign} color="emerald" delay={0.07} />
            <StatCard label="Catalog Size"        value={totalProducts}   icon={Package} color="amber" delay={0.14} />
            <StatCard label="Sales Orders"        value={salesOrders}     icon={ShoppingCart} color="indigo" delay={0.21} />
          </div>

          {/* AI Insights & Approvals shortcuts */}
          {insights.length > 0 && (
            <motion.div className="glass-card" style={{ marginTop: 24, padding: 24 }} variants={cardAnim} transition={{ delay: 0.28 }}>
              <div className="flex items-center gap-3 mb-4">
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={18} color="white" />
                </div>
                <div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Manager Operations Console</h2>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Review AI predictions & workflow recommendations</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {insights.slice(0, 2).map((insight, i) => {
                  const s = severityStyle[insight.severity] || severityStyle.warning;
                  return (
                    <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: 16 }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{insight.title}</span>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, marginLeft: 'auto' }} />
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{insight.message}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            <motion.div className="glass-card p-6" variants={cardAnim} transition={{ delay: 0.35 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Leave & Team Tracking</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Inspect active team leave applications and attendance log indices.</p>
              <Link to="/hr/profiles" className="btn btn-primary w-full justify-between">
                <span>View Team Directory</span> <ChevronRight size={16} />
              </Link>
            </motion.div>
            <motion.div className="glass-card p-6" variants={cardAnim} transition={{ delay: 0.42 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Departmental Reports</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Review transactional trends, sales compositions, and catalog valuate indices.</p>
              <Link to="/reports" className="btn btn-secondary w-full justify-between">
                <span>Open Analytics Reports</span> <ChevronRight size={16} />
              </Link>
            </motion.div>
            <motion.div className="glass-card p-6" variants={cardAnim} transition={{ delay: 0.49 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>AI Forecast Insights</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 20 }}>Check safety stock configurations and employee efficiency forecast vectors.</p>
              <Link to="/ai" className="btn btn-secondary w-full justify-between" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                <span>Forecast Panel</span> <ChevronRight size={16} />
              </Link>
            </motion.div>
          </div>
        </>
      )}

      {/* 4. FINANCE DASHBOARD */}
      {userRole === 'finance' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Total Revenue"     value={totalRevenue}   icon={ArrowUpRight} color="emerald" delay={0.0} />
            <StatCard label="Total Expenses"    value={totalExpenses}  icon={ArrowDownLeft} color="rose" delay={0.07} />
            <StatCard label="Net Profit"        value={netProfit}      icon={DollarSign} color="indigo" delay={0.14} />
            <StatCard label="Sales Orders"      value={salesOrders}    icon={ShoppingCart} color="amber" delay={0.21} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
            <motion.div className="glass-card p-6 lg:col-span-2" variants={cardAnim} transition={{ delay: 0.28 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title" style={{ margin: 0 }}>General Ledger Cashflows</h2>
                <span className="badge badge-success">Income vs Expense</span>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fill="rgba(16,185,129,0.15)" strokeWidth={2} />
                  <Area type="monotone" dataKey="expenses" name="Expense" stroke="#f43f5e" fill="rgba(244,63,94,0.15)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div className="glass-card p-6 flex flex-col justify-between" variants={cardAnim} transition={{ delay: 0.35 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Finance Quick Tasks</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                  Record general ledger receipts, manage corporate bank accounts, run payroll, and verify balances.
                </p>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <Link to="/finance" className="btn btn-primary" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                  <span>Record Transaction</span> <ChevronRight size={16} />
                </Link>
                <Link to="/finance/payroll" className="btn btn-secondary" style={{ justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <span>Payroll & Payslips</span> <ChevronRight size={16} />
                </Link>
                <Link to="/reports" className="btn btn-secondary" style={{ justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <span>Accounts Analytics</span> <ChevronRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* 5. INVENTORY DASHBOARD */}
      {userRole === 'inventory' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="Total Catalog Products" value={totalProducts} icon={Package} color="emerald" delay={0.0} />
            <StatCard label="Low Stock Thresholds"   value="4 Alerts"       icon={AlertTriangle} color="amber" delay={0.07} />
            <StatCard label="SCM Active Orders"      value={salesOrders}    icon={ShoppingCart} color="indigo" delay={0.14} />
            <StatCard label="Stock Integrity"        value="Verified"       icon={UserCheck} color="cyan" delay={0.21} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
            <motion.div className="glass-card p-6 lg:col-span-2" variants={cardAnim} transition={{ delay: 0.28 }}>
              <h2 className="section-title">Stock Valuation by Category</h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartCategoryPieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Bar dataKey="value" name="Valuation (₹)" fill="var(--accent-emerald)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div className="glass-card p-6 flex flex-col justify-between" variants={cardAnim} transition={{ delay: 0.35 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Stockroom Actions</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                  Adjust product quantities, add new SKUs, register supplier data, and monitor low stock alerts.
                </p>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <Link to="/inventory" className="btn btn-primary" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                  <span>Update Stock levels</span> <ChevronRight size={16} />
                </Link>
                <Link to="/supply" className="btn btn-secondary" style={{ justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <span>Supplier Directory</span> <ChevronRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* 6. SUPPLY CHAIN DASHBOARD */}
      {userRole === 'supply' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard label="SCM Order Volume"  value={salesOrders}     icon={ShoppingCart} color="indigo" delay={0.0} />
            <StatCard label="Active Catalog"     value={totalProducts}   icon={Package} color="emerald" delay={0.07} />
            <StatCard label="Vendor Connections" value="12 Suppliers"    icon={Truck} color="cyan" delay={0.14} />
            <StatCard label="Transit Status"     value="Optimal"         icon={UserCheck} color="emerald" delay={0.21} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
            <motion.div className="glass-card p-6 lg:col-span-2" variants={cardAnim} transition={{ delay: 0.28 }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title" style={{ margin: 0 }}>Supply vs Sales Volumes</h2>
                <span className="badge badge-purple">Fulfillment Status</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, border: '1px dashed var(--border)', borderRadius: 12 }}>
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <Truck size={36} color="var(--accent-primary)" style={{ margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)' }}>Fulfillment pipelines are active and running.</p>
                </div>
              </div>
            </motion.div>

            <motion.div className="glass-card p-6 flex flex-col justify-between" variants={cardAnim} transition={{ delay: 0.35 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>SCM Quick Shortcuts</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 20 }}>
                  Fulfill pending orders, issue procurement requests, log sales ledgers, and manage vendors.
                </p>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <Link to="/supply/orders" className="btn btn-primary" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                  <span>Procurement Orders</span> <ChevronRight size={16} />
                </Link>
                <Link to="/supply" className="btn btn-secondary" style={{ justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <span>Manage Suppliers</span> <ChevronRight size={16} />
                </Link>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* 7. EMPLOYEE PORTAL */}
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
                File leave requests, check logs, and inspect payslips securely.
              </p>
            </div>
            
            <div style={{ display: 'grid', gap: 10 }}>
              <Link to="/hr/profiles" className="btn btn-primary" style={{ justifyContent: 'space-between', padding: '12px 16px' }}>
                <span>My Profile Directory</span> <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
