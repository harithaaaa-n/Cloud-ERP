import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, AlertCircle, Download, Loader2 } from 'lucide-react';
import { api } from '../../utils/api';

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;

export default function Payroll() {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const loadPayrollRecords = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.hr.getAllPayslips();
      if (res.success) {
        setSalaries(res.data);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to retrieve corporate payroll registers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayrollRecords();
  }, []);

  const handlePayNow = async (salaryId) => {
    try {
      setActionLoading(true);
      const res = await api.hr.paySalary(salaryId);
      if (res.success) {
        showToast('Payroll transaction processed successfully.');
        loadPayrollRecords();
      }
    } catch (err) {
      showToast(err.message || 'Failed to process payment.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Compute stats
  const totalBasic = salaries.reduce((sum, item) => sum + item.basicSalary, 0);
  const totalNet = salaries.reduce((sum, item) => sum + (item.status === 'Paid' ? item.netSalary : 0), 0);
  const pendingCount = salaries.filter(item => item.status === 'Pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading payroll system...</span>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative' }}>
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast.show && (
          <motion.div 
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            style={{
              position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 1100,
              padding: '12px 24px', borderRadius: '12px', color: 'white', fontWeight: 600,
              boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              background: toast.type === 'success' ? 'var(--accent-emerald)' : 'var(--accent-rose)'
            }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll Management</h1>
          <p className="page-subtitle">Process corporate salaries, allowances, and tax withholding sheets.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" id="payroll-export-btn" onClick={() => showToast('CSV Export initiated.')}>
            <Download size={15}/> Export
          </button>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 20, color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.05)' }}>
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {[
          { label: 'Total Base Payroll', value: fmt(totalBasic), color: 'var(--accent-primary)' },
          { label: 'Total Net Disbursed', value: fmt(totalNet), color: 'var(--accent-emerald)' },
          { label: 'Pending Payouts', value: `${pendingCount} employees`, color: 'var(--accent-amber)' },
        ].map((s, i) => (
          <div key={i} className="glass-card glass-card-hover" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'Outfit, sans-serif', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Payroll Table */}
      <div className="glass-card mt-6">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Payslip Registry Record</h2>
        </div>
        
        {salaries.length === 0 ? (
          <div className="text-center" style={{ padding: '36px 24px', color: 'var(--text-secondary)' }}>
            No payslip history found. Please generate payslips via Employee profiles first.
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr>
                  <th>Employee</th><th>Month</th><th>Base Salary</th><th>Allowances</th>
                  <th>Deductions</th><th>Net Pay</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.employee?.name || 'Unknown Employee'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.employee?.role || '—'} · {s.employee?.department || '—'}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{s.month}</td>
                    <td>{fmt(s.basicSalary)}</td>
                    <td style={{ color: 'var(--accent-emerald)' }}>+{fmt(s.allowances)}</td>
                    <td style={{ color: 'var(--accent-rose)' }}>-{fmt(s.deductions)}</td>
                    <td style={{ fontWeight: 700 }}>{fmt(s.netSalary)}</td>
                    <td>
                      <span className={`badge ${s.status === 'Paid' ? 'badge-success' : 'badge-danger'}`}>{s.status}</span>
                    </td>
                    <td>
                      {s.status === 'Pending' ? (
                        <button className="btn btn-sm btn-primary" disabled={actionLoading} onClick={() => handlePayNow(s._id)}>Pay Now</button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 11 }}>
                          <span>Paid on {s.paymentDate ? new Date(s.paymentDate).toLocaleDateString('en-IN') : '--'}</span>
                          <button className="icon-btn btn-sm" style={{ border: 'none', background: 'none' }} onClick={() => showToast('Payslip download started.')} title="Download Slip">
                            <Download size={13} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
