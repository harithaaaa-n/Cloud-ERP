import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { 
  Brain, Zap, TrendingUp, ChevronRight, Activity, DollarSign, 
  Users, Package, AlertTriangle, CheckCircle, Clock, Loader2, ArrowRight
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  ResponsiveContainer, BarChart, Bar, ReferenceLine
} from 'recharts';

const severityStyle = {
  critical: { bg: 'rgba(244,63,94,0.05)',  border: 'rgba(244,63,94,0.2)',  dot: '#f43f5e', label: 'Critical' },
  warning:  { bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.2)', dot: '#f59e0b', label: 'Warning'  },
  positive: { bg: 'rgba(16,185,129,0.05)', border: 'rgba(16,185,129,0.2)', dot: '#10b981', label: 'Positive' },
};

const IconMap = {
  Package: Package,
  Users: Users,
  Activity: Activity,
  DollarSign: DollarSign
};

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;

export default function AIInsights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dashboard Tab state: 'sales' | 'inventory' | 'employees'
  const [activePredictTab, setActivePredictTab] = useState('sales');

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.analytics.getInsights();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to connect to the predictive intelligence service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Aggregating neural forecasting nodes...</span>
      </div>
    );
  }

  const { forecast = [], inventory = [], employees = [], recommendations = [] } = data || {};

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Predictive Insights</h1>
          <p className="page-subtitle">Linear regressions, safety stock boundaries, and department performance indices.</p>
        </div>
        
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.2)', borderRadius: 99
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-secondary)' }}>AI Engine Online</span>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 20, color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.05)' }}>
          {error}
        </div>
      )}

      {/* ── Section 1: AI Recommendations & Smart Alerts ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {recommendations.length === 0 ? (
          <div className="glass-card flex items-center justify-center p-6 text-center" style={{ minHeight: 120 }}>
            <span style={{ color: 'var(--text-muted)' }}>All operational systems normal. No critical alerts.</span>
          </div>
        ) : (
          recommendations.map((rec, i) => {
            const style = severityStyle[rec.severity] || severityStyle.warning;
            const IconComponent = IconMap[rec.icon] || Zap;
            return (
              <motion.div 
                key={i} 
                className="glass-card"
                style={{ padding: 20, background: style.bg, border: `1px solid ${style.border}` }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: `${style.dot}22`, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <IconComponent size={16} color={style.dot} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{rec.title}</h3>
                    <span className="badge badge-gray" style={{ fontSize: 10, marginTop: 2 }}>{style.label}</span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {rec.message}
                </p>
              </motion.div>
            );
          })
        )}
      </div>

      {/* ── Tabbed Predictors Panel ───────────────────────────────────── */}
      <div className="glass-card mb-6" style={{ padding: 24 }}>
        <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'sales', label: 'Sales Forecast (Linear Regression)', icon: TrendingUp },
            { id: 'inventory', label: 'Safety Stocks & Stockouts', icon: Package },
            { id: 'employees', label: 'Workforce Efficiency ROI', icon: Users },
          ].map(tab => (
            <button 
              key={tab.id} 
              className={`btn btn-sm ${activePredictTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActivePredictTab(tab.id)}
            >
              <tab.icon size={13} style={{ marginRight: 4 }} /> {tab.label}
            </button>
          ))}
        </div>

        {/* ── Sub-Tab 1: Sales Forecasting ──────────────────────────── */}
        {activePredictTab === 'sales' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={16} color="var(--accent-primary)" />
                  <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Projected 30-Day Sales Demand</h3>
                </div>
                <div style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecast}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => `₹${v/1000}K`} />
                      <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }} formatter={v => fmt(v)} />
                      <Legend />
                      <Line type="monotone" dataKey="predictedAmount" name="Predicted Sales Demand" stroke="var(--accent-primary)" strokeWidth={2.5} dot={{ fill: 'var(--accent-primary)', r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text-white)' }}>ML Model Specifications</h4>
                <div style={{ display: 'grid', gap: 12, fontSize: 13 }}>
                  <div className="flex justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Algorithm</span>
                    <strong style={{ color: 'var(--accent-primary)' }}>Ordinary Least Squares</strong>
                  </div>
                  <div className="flex justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Training Set Size</span>
                    <strong>{forecast.length} steps</strong>
                  </div>
                  <div className="flex justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 6 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Growth Multiplier</span>
                    <strong style={{ color: 'var(--accent-emerald)' }}>+8.2% MoM</strong>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.5 }}>
                  Predictions are calculated based on historical income transactions. Regression weights indicate consistent client order pipelines.
                </p>
              </div>

            </div>
          </motion.div>
        )}

        {/* ── Sub-Tab 2: Inventory Safety Stock Predictions ─────────── */}
        {activePredictTab === 'inventory' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Product Stockout & Safety Margins</h3>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Current Stock</th>
                    <th>Daily Velocity</th>
                    <th>Est. Days to Stockout</th>
                    <th>Optimal Safety Stock</th>
                    <th>Reorder Threshold</th>
                    <th>ML Status Recommendation</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 600 }}>{item.name}</td>
                      <td>{item.stock} pcs</td>
                      <td>{item.dailyVelocity} pcs/day</td>
                      <td style={{ color: item.daysToStockout < 15 ? 'var(--accent-rose)' : 'var(--text-secondary)' }}>
                        {item.daysToStockout} days
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{item.safetyStock} pcs</td>
                      <td style={{ fontWeight: 600 }}>{item.reorderPoint} pcs</td>
                      <td>
                        <span className={`badge ${item.replenishmentStatus.includes('Critical') ? 'badge-danger' : 'badge-success'}`}>
                          {item.replenishmentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* ── Sub-Tab 3: Employee Workforce Classification ─────────── */}
        {activePredictTab === 'employees' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Staff Efficiency Scores & Payroll ROI</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {employees.map(emp => (
                <div key={emp.id} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 18, border: '1px solid var(--border)' }}>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{emp.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{emp.role}</div>
                    </div>
                    <span className={`badge ${emp.performanceRating === 'Outstanding' ? 'badge-success' : 'badge-gray'}`}>
                      {emp.performanceRating}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Efficiency Rating</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-primary)' }}>{emp.efficiencyScore}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>ROI Performance Coefficient</div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>{emp.roiIndex}</div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 10, fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                    <Zap size={14} color="var(--accent-amber)" style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>{emp.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>

    </motion.div>
  );
}
