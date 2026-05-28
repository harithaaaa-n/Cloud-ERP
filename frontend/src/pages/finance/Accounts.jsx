import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { api } from '../../utils/api';

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`;

export default function Accounts() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Opening balance mock + computed shifts
  const [cashBalance, setCashBalance] = useState(0);
  const [receivableBalance] = useState(0);
  const [payableBalance] = useState(0);

  const fetchLedgerData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.finance.getTransactions();
      if (res.success) {
        setTransactions(res.data);
        
        // Dynamically shift cash balance based on actual database transactions
        let profitShift = 0;
        res.data.forEach(t => {
          if (t.type === 'Income') profitShift += t.amount;
          else profitShift -= t.amount;
        });
        setCashBalance(8420000 + profitShift);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to retrieve general ledger records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, []);

  const accountGroups = [
    { name: 'Cash & Bank Balance', balance: cashBalance, type: 'Asset', trend: '+2.4%' },
    { name: 'Accounts Receivable', balance: receivableBalance, type: 'Asset', trend: '+5.3%' },
    { name: 'Accounts Payable', balance: payableBalance, type: 'Liability', trend: '-1.2%' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading financial accounts...</span>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts Overview</h1>
          <p className="page-subtitle">Monitor and review company general ledger balances and financial trends.</p>
        </div>
        <button className="btn btn-primary" id="accounts-add-btn" onClick={() => setShowModal(true)}>
          <Plus size={15} /> New Account
        </button>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 20, color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.05)' }}>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {accountGroups.map((a, i) => (
          <motion.div key={i} className="glass-card glass-card-hover" style={{ padding: 24 }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{a.name}</span>
              <span className={`badge ${a.type === 'Asset' ? 'badge-success' : 'badge-danger'}`}>{a.type}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
              {fmt(a.balance)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Trend: {a.trend} this month</div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card mt-6">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h2 className="section-title" style={{ margin: 0 }}>General Ledger Entries</h2>
        </div>
        
        {transactions.length === 0 ? (
          <div className="text-center" style={{ padding: '36px 24px', color: 'var(--text-secondary)' }}>
            No ledger entries found.
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr><th>Date</th><th>Description</th><th>Category</th><th>Debit (Expense)</th><th>Credit (Income)</th><th>Status</th></tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t._id}>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(t.date).toLocaleDateString('en-IN')}</td>
                    <td>{t.description}</td>
                    <td>{t.category}</td>
                    <td style={{ color: 'var(--accent-rose)', fontWeight: 600 }}>
                      {t.type === 'Expense' ? fmt(t.amount) : '—'}
                    </td>
                    <td style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>
                      {t.type === 'Income' ? fmt(t.amount) : '—'}
                    </td>
                    <td>
                      <span className="badge badge-success">Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="modal-header">
              <h3 className="modal-title">New Asset Account</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="form-group"><label className="form-label">Account Name</label><input className="form-input" placeholder="e.g. Petty Cash" /></div>
              <div className="form-group"><label className="form-label">Type</label><select className="form-select"><option>Asset</option><option>Liability</option><option>Equity</option></select></div>
              <div className="form-group"><label className="form-label">Opening Balance (₹)</label><input className="form-input" type="number" placeholder="0.00" /></div>
              <div className="flex gap-3" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" id="accounts-submit-btn" onClick={() => setShowModal(false)}>Create Account</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
