import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ComposedChart, Line
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Users, Package, 
  ShoppingCart, Calendar, RefreshCw, Layers, FileSpreadsheet, Loader2 
} from 'lucide-react';
import { api } from '../../utils/api';

const PIECOLORS = ['#6366f1', '#22d3ee', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#4b5563'];

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;
const fmtK = (n) => n >= 1_000_000 ? `₹${(n / 1_000_000).toFixed(2)}M` : n >= 1_000 ? `₹${(n / 1_000).toFixed(0)}K` : `₹${n}`;

const cardAnim = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dynamic filter states
  const [dateRange, setDateRange] = useState('6months'); // '30days', '6months', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchAdvancedAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      
      let startStr = startDate;
      let endStr = endDate;

      if (dateRange === '30days') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        startStr = d.toISOString().split('T')[0];
        endStr = new Date().toISOString().split('T')[0];
      } else if (dateRange === '6months') {
        const d = new Date();
        d.setMonth(d.getMonth() - 6);
        startStr = d.toISOString().split('T')[0];
        endStr = new Date().toISOString().split('T')[0];
      }

      const res = await api.analytics.getAdvanced({ startDate: startStr, endDate: endStr });
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch advanced ERP metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvancedAnalytics();
  }, [dateRange, startDate, endDate]);

  const handleExportCSV = () => {
    if (!data) return;
    
    // Build a text block summarizing KPIs
    const rows = [
      ['Metric', 'Value'],
      ['Total SCM Revenue', data.kpis.revenue],
      ['Total SCM Expenses', data.kpis.expenses],
      ['Net Profit', data.kpis.profit],
      ['Average Order Value', data.kpis.averageOrderValue],
      ['Total Orders Count', data.kpis.totalOrders],
      ['Total Products SKU', data.kpis.totalProducts],
      ['Active Employees', data.kpis.employeeCount],
      ['Low Stock Alert Count', data.kpis.lowStockCount]
    ];

    let csvContent = "data:text/csv;charset=utf-8," 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ERP_Analytics_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Aggregating system-wide ledger & catalog charts...</span>
      </div>
    );
  }

  const kpis = data?.kpis || {};

  return (
    <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.05 } } }}>
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Advanced ERP Analytics</h1>
          <p className="page-subtitle">Real-time ledger trends, inventory valuations, department cost allocations, and sales composing.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" id="reports-export-csv" onClick={handleExportCSV}>
            <FileSpreadsheet size={14} style={{ marginRight: 4 }} /> Export Summary CSV
          </button>
          <button className="btn btn-primary btn-sm" onClick={fetchAdvancedAnalytics}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 20, color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.05)' }}>
          {error}
        </div>
      )}

      {/* ── Filters Panel ────────────────────────────────────────── */}
      <div className="glass-card" style={{ padding: 16, marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="flex items-center gap-2">
          <Calendar size={15} color="var(--text-muted)" />
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Date Range:</span>
        </div>
        <div className="flex gap-2">
          {[
            { value: '30days', label: 'Last 30 Days' },
            { value: '6months', label: 'Last 6 Months' },
            { value: 'custom', label: 'Custom Range' },
          ].map(opt => (
            <button 
              key={opt.value} 
              className={`btn btn-sm ${dateRange === opt.value ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDateRange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        
        {dateRange === 'custom' && (
          <div className="flex gap-2 items-center" style={{ marginLeft: 8 }}>
            <input 
              type="date" 
              className="form-input" 
              style={{ padding: '4px 8px', fontSize: 12, width: 130 }} 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
            />
            <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>to</span>
            <input 
              type="date" 
              className="form-input" 
              style={{ padding: '4px 8px', fontSize: 12, width: 130 }} 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
            />
          </div>
        )}
      </div>

      {/* ── KPI Cards Grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          { label: 'SCM Revenue', value: kpis.revenue, color: 'var(--accent-emerald)', icon: DollarSign },
          { label: 'SCM Expenses', value: kpis.expenses, color: 'var(--accent-rose)', icon: TrendingDown },
          { label: 'Net Profit Margin', value: kpis.profit, color: 'var(--accent-primary)', icon: TrendingUp },
          { label: 'Avg Order Value', value: kpis.averageOrderValue, color: 'var(--accent-cyan)', icon: ShoppingCart },
        ].map((k, i) => (
          <motion.div key={i} className="glass-card glass-card-hover" style={{ padding: 22 }}
            variants={cardAnim}>
            <div className="flex justify-between items-center mb-3">
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{k.label}</span>
              <k.icon size={16} color={k.color} />
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: k.color }}>
              {fmtK(k.value)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Secondary KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        {[
          { label: 'Active Workforce Headcount', value: `${kpis.employeeCount} Employees`, sub: 'Operational staff count', color: 'var(--accent-indigo)' },
          { label: 'Low Stock SKU Warning', value: `${kpis.lowStockCount} Products`, sub: 'Needs immediate replenishment', color: 'var(--accent-amber)' },
          { label: 'Aggregate Products Catalog', value: `${kpis.totalProducts} SKUs`, sub: 'Total active offerings', color: 'var(--accent-purple)' },
        ].map((k, i) => (
          <motion.div key={i} className="glass-card" style={{ padding: 20 }} variants={cardAnim}>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{k.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Advanced Charts Grid ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Chart 1: Revenue vs Expense Area Chart */}
        <motion.div className="glass-card" style={{ padding: 24 }} variants={cardAnim}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="section-title" style={{ margin: 0 }}>Monthly Cashflow Trend</h3>
            <span className="badge badge-success">Income vs Expense</span>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthlyTrends}>
                <defs>
                  <linearGradient id="analRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="analExpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1e3}K`} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} formatter={v => fmt(v)} />
                <Legend />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" fill="url(#analRevGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="expenses" name="Expense" stroke="#f43f5e" fill="url(#analExpGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 2: Sales vs Purchase Orders Composed Chart */}
        <motion.div className="glass-card" style={{ padding: 24 }} variants={cardAnim}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="section-title" style={{ margin: 0 }}>Sales vs Purchase Order Trends</h3>
            <span className="badge badge-purple">Volumes & Counts</span>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data?.orderTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1e3}K`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} />
                <Legend />
                <Bar yAxisId="left" dataKey="salesAmount" name="Sales Volume (₹)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="purchaseAmount" name="Purchase Volume (₹)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="salesCount" name="Sales Count" stroke="#22d3ee" strokeWidth={2.5} dot={{ fill: '#22d3ee', r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="purchaseCount" name="Purchase Count" stroke="#8b5cf6" strokeWidth={2.5} dot={{ fill: '#8b5cf6', r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 3: Department Payroll allocation */}
        <motion.div className="glass-card lg:col-span-2" style={{ padding: 24 }} variants={cardAnim}>
          <h3 className="section-title">Workforce & Payroll Allocation by Department</h3>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.departmentMetrics} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="department" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1e3}K`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} />
                <Legend />
                <Bar yAxisId="left" dataKey="salaryCost" name="Monthly Payroll (₹)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="employees" name="Employees Count" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 4: Inventory Category Valuation Pie */}
        <motion.div className="glass-card" style={{ padding: 24 }} variants={cardAnim}>
          <h3 className="section-title">Stock Valuation by Category</h3>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={data?.inventoryBreakdown} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={75} 
                  paddingAngle={3} 
                  dataKey="retailValue"
                  nameKey="category"
                  label={({ category }) => category.slice(0, 10)}
                  labelLine={false}
                >
                  {data?.inventoryBreakdown?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIECOLORS[index % PIECOLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => fmt(value)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', marginTop: 12 }}>
            {data?.inventoryBreakdown?.map((entry, index) => (
              <div key={entry.category} className="flex items-center gap-2" style={{ fontSize: 11 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: PIECOLORS[index % PIECOLORS.length] }} />
                <span style={{ color: 'var(--text-secondary)' }}>
                  {entry.category}: <strong>{fmtK(entry.retailValue)}</strong>
                </span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

    </motion.div>
  );
}
