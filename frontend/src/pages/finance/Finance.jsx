import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowUpRight, ArrowDownLeft, Download, Loader2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
const mockRevenueData = [];
import { api } from '../../utils/api';

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;
const fmtK = (n) => n >= 1_000_000 ? `₹${(n/1_000_000).toFixed(2)}M` : n >= 1_000 ? `₹${(n/1_000).toFixed(0)}K` : `₹${n}`;

export default function Finance() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netProfit: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [form, setForm] = useState({
    type: 'Income',
    amount: '',
    category: '',
    description: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
  });

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      const txnsRes = await api.finance.getTransactions();
      const summaryRes = await api.finance.getSummary();
      if (txnsRes.success) setTransactions(txnsRes.data);
      if (summaryRes.success) setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load financial records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinanceData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.category || !form.description) {
      alert('Please fill in amount, category, and description.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.finance.createTransaction({
        ...form,
        amount: Number(form.amount),
      });
      if (res.success) {
        setTransactions([res.data, ...transactions]);
        // Update summary locally
        const newIncome = form.type === 'Income' ? summary.totalIncome + Number(form.amount) : summary.totalIncome;
        const newExpenses = form.type === 'Expense' ? summary.totalExpenses + Number(form.amount) : summary.totalExpenses;
        setSummary({
          totalIncome: newIncome,
          totalExpenses: newExpenses,
          netProfit: newIncome - newExpenses
        });
        setShowModal(false);
        setForm({
          type: 'Income',
          amount: '',
          category: '',
          description: '',
          reference: '',
          date: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to record transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === 'All' ? transactions : transactions.filter(t => t.type === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading financial records...</span>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Finance Overview</h1>
          <p className="page-subtitle">Monitor cashflows, transactions and financial health.</p>
        </div>
        <button className="btn btn-primary" id="finance-add-transaction-btn" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Record Transaction
        </button>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 20, color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.05)' }}>
          {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {[
          { label: 'Total Revenue',  value: summary.totalIncome,  color: 'var(--accent-emerald)', icon: ArrowUpRight },
          { label: 'Total Expenses', value: summary.totalExpenses, color: 'var(--accent-rose)',    icon: ArrowDownLeft },
          { label: 'Net Profit',     value: summary.netProfit,     color: 'var(--accent-primary)', icon: ArrowUpRight },
        ].map((m, i) => (
          <motion.div key={i} className="glass-card glass-card-hover" style={{ padding: 24 }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{m.label}</span>
              <m.icon size={18} color={m.color} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: m.color }}>
              {fmtK(m.value)}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div className="glass-card lg:col-span-2 mt-6" style={{ padding: 24, marginBottom: 24 }}>
        <h2 className="section-title">Monthly Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={mockRevenueData}>
            <defs>
              <linearGradient id="finRevGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1e6}M`} />
            <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13 }} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" fill="url(#finRevGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Transactions Table */}
      <div className="glass-card">
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Recent Transactions</h2>
          <div className="flex gap-2">
            {['All', 'Income', 'Expense'].map(f => (
              <button key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                id={`finance-filter-${f.toLowerCase()}-btn`}
                onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
            <button className="btn btn-secondary btn-sm"><Download size={14} /> Export</button>
          </div>
        </div>
        
        {filtered.length === 0 && (
          <div className="text-center" style={{ padding: '36px 24px', color: 'var(--text-secondary)' }}>
            No transactions found.
          </div>
        )}

        {filtered.length > 0 && (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Description</th><th>Type</th><th>Category</th><th>Reference</th><th>Amount</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t._id}>
                    <td>{t.description}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {t.type === 'Income'
                          ? <ArrowUpRight size={14} color="var(--accent-emerald)" />
                          : <ArrowDownLeft size={14} color="var(--accent-rose)" />}
                        {t.type}
                      </div>
                    </td>
                    <td>{t.category}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>{t.reference || '—'}</td>
                    <td style={{ fontWeight: 700, color: t.type === 'Income' ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                      {t.type === 'Income' ? '+' : '-'}{fmt(t.amount)}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="modal-header">
              <h3 className="modal-title">Record Transaction</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: 16 }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select className="form-select" name="type" value={form.type} onChange={handleChange}>
                      <option>Income</option>
                      <option>Expense</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (₹)</label>
                    <input className="form-input" type="number" name="amount" value={form.amount} onChange={handleChange} required placeholder="0.00" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input className="form-input" name="category" value={form.category} onChange={handleChange} required placeholder="e.g. Sales Revenue, Salaries, Utilities..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" name="description" value={form.description} onChange={handleChange} required placeholder="Brief description..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Reference ID</label>
                    <input className="form-input" name="reference" value={form.reference} onChange={handleChange} placeholder="e.g. Invoice / Order ID" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input className="form-input" type="date" name="date" value={form.date} onChange={handleChange} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" disabled={submitting} className="btn btn-primary" id="finance-submit-transaction-btn">
                    {submitting ? 'Recording...' : 'Save Transaction'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
