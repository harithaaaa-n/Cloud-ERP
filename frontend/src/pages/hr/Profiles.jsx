import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import {
  Mail, Calendar, Briefcase, TrendingUp, Award, Clock, MapPin, Phone,
  CheckCircle2, AlertCircle, Loader2, UserPlus, CreditCard, ClipboardList, ShieldAlert
} from 'lucide-react';

const avatarColors = [
  'linear-gradient(135deg,#6366f1,#8b5cf6)',
  'linear-gradient(135deg,#22d3ee,#6366f1)',
  'linear-gradient(135deg,#10b981,#22d3ee)',
  'linear-gradient(135deg,#f59e0b,#f43f5e)',
  'linear-gradient(135deg,#8b5cf6,#f43f5e)',
];

export default function Profiles() {
  const { user: currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeId = searchParams.get('id');

  const [employees, setEmployees] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'attendance', 'leaves', 'payroll'

  // Form states for Sub-actions
  const [attendanceForm, setAttendanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    checkIn: '09:00',
    checkOut: '18:00',
  });
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Annual',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });
  const [payrollForm, setPayrollForm] = useState({
    month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    basicSalary: '',
    allowances: '0',
    deductions: '0',
    status: 'Pending',
  });

  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  const isAdminOrHR = currentUser && ['admin', 'hr'].includes(currentUser.role);
  const isAdminOrManager = currentUser && ['admin', 'manager'].includes(currentUser.role);

  // Fetch employees list for the sidebar
  const fetchEmployeesList = async () => {
    try {
      setLoadingList(true);
      const res = await api.hr.getEmployees({ page: 1, limit: 100 });
      if (res.success) {
        setEmployees(res.data);
        // If no ID is specified in URL, set the first employee
        if (!employeeId && res.data.length > 0) {
          setSearchParams({ id: res.data[0]._id });
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch employee directories.');
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch full details of the active employee profile
  const fetchActiveProfile = async (id) => {
    if (!id) return;
    try {
      setLoadingProfile(true);
      const res = await api.hr.getEmployeeById(id);
      if (res.success) {
        setActiveProfile(res.data);
        // Pre-fill payroll base salary if defined
        setPayrollForm(p => ({ ...p, basicSalary: res.data.employee.salary.toString() }));
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load profile record.', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchEmployeesList();
  }, []);

  useEffect(() => {
    if (employeeId) {
      fetchActiveProfile(employeeId);
    }
  }, [employeeId]);

  // ── Actions ────────────────────────────────────────────────────────
  const handleRecordAttendance = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.hr.recordAttendance(employeeId, attendanceForm);
      if (res.success) {
        showToast('Daily attendance sheet recorded.');
        fetchActiveProfile(employeeId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit attendance.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) {
      showToast('Please provide a reason for the leave.', 'error');
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.hr.applyLeave(employeeId, leaveForm);
      if (res.success) {
        showToast('Leave request submitted successfully.');
        setLeaveForm(p => ({ ...p, reason: '' }));
        fetchActiveProfile(employeeId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit leave request.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateLeaveStatus = async (leaveId, status) => {
    try {
      setActionLoading(true);
      const res = await api.hr.updateLeaveStatus(leaveId, { status });
      if (res.success) {
        showToast(`Leave request ${status.toLowerCase()} successfully.`);
        fetchActiveProfile(employeeId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update leave status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateSalary = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.hr.generateSalary(employeeId, {
        ...payrollForm,
        basicSalary: Number(payrollForm.basicSalary),
        allowances: Number(payrollForm.allowances),
        deductions: Number(payrollForm.deductions)
      });
      if (res.success) {
        showToast('Monthly payslip generated successfully.');
        fetchActiveProfile(employeeId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate salary payslip.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePaySalary = async (salaryId) => {
    try {
      setActionLoading(true);
      const res = await api.hr.paySalary(salaryId);
      if (res.success) {
        showToast('Payslip marked as paid.');
        fetchActiveProfile(employeeId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to update payment status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'EE';
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

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
          <h1 className="page-title">Personnel Records</h1>
          <p className="page-subtitle">Detailed employee profiles, career trackers, daily attendance sheets, leaves, and payroll records.</p>
        </div>
      </div>

      {error && (
        <div className="glass-card" style={{ padding: 16, marginBottom: 20, color: 'var(--accent-rose)', border: '1px solid rgba(244,63,94,0.3)', background: 'rgba(244,63,94,0.05)' }}>
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Sidebar directory */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Sidebar list of employees */}
            <motion.div className="glass-card" style={{ padding: 20 }}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="section-title">Directory Directory</div>
              
              {loadingList ? (
                <div className="flex items-center justify-center" style={{ padding: '24px 0' }}>
                  <Loader2 size={24} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
              ) : employees.length === 0 ? (
                <div style={{ padding: '12px 0', fontSize: 13, color: 'var(--text-muted)' }}>No employees registered.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '420px', overflowY: 'auto', paddingRight: 4 }}>
                  {employees.map((e, i) => (
                    <div 
                      key={e._id} 
                      className={`nav-item ${employeeId === e._id ? 'active' : ''}`} 
                      style={{ padding: '8px 10px', borderRadius: 8, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}
                      onClick={() => setSearchParams({ id: e._id })}
                    >
                      {e.profileImage ? (
                        <img src={e.profileImage} alt={e.name} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                          background: avatarColors[i % avatarColors.length],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 700, color: 'white'
                        }}>{getInitials(e.name)}</div>
                      )}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{e.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{e.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Status overview */}
            {activeProfile?.employee && (
              <motion.div className="glass-card" style={{ padding: 20 }}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                <div className="section-title">Status Dashboard</div>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div className="flex justify-between items-center text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                    <span className={`badge ${activeProfile.employee.status === 'Active' ? 'badge-success' : activeProfile.employee.status === 'On Leave' ? 'badge-amber' : 'badge-danger'}`}>{activeProfile.employee.status}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Monthly Salary:</span>
                    <span style={{ fontWeight: 600 }}>₹{activeProfile.employee.salary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span style={{ color: 'var(--text-muted)' }}>Designation:</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{activeProfile.employee.role}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Profile Detail Hub */}
        <div className="flex-1">
          {loadingProfile ? (
            <div className="glass-card flex items-center justify-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
              <Loader2 size={36} color="var(--accent-primary)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Fetching profile metrics...</span>
            </div>
          ) : !activeProfile ? (
            <div className="glass-card text-center" style={{ padding: '64px 24px' }}>
              <ShieldAlert size={36} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No employee selected or records empty.</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              
              {/* Profile Main Header Card */}
              <motion.div className="glass-card" style={{ padding: 28 }}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  {activeProfile.employee.profileImage ? (
                    <img src={activeProfile.employee.profileImage} alt={activeProfile.employee.name} style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 0 20px rgba(99,102,241,0.2)' }} />
                  ) : (
                    <div style={{
                      width: 84, height: 84, borderRadius: '50%',
                      background: avatarColors[0],
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, fontWeight: 700, color: 'white',
                      boxShadow: '0 0 20px rgba(99,102,241,0.2)'
                    }}>{getInitials(activeProfile.employee.name)}</div>
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'flex-start', marginBottom: 4 }}>
                      <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{activeProfile.employee.name}</h2>
                      <span className={`badge ${activeProfile.employee.status === 'Active' ? 'badge-success' : activeProfile.employee.status === 'On Leave' ? 'badge-amber' : 'badge-danger'}`}>{activeProfile.employee.status}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '0 0 12px 0' }}>{activeProfile.employee.role} · <strong style={{ color: 'var(--text-muted)' }}>{activeProfile.employee.department} Department</strong></p>
                    
                    <div className="flex flex-wrap gap-4 text-xs text-muted" style={{ justifyContent: 'flex-start' }}>
                      <span className="flex items-center gap-1"><Mail size={12} /> {activeProfile.employee.email}</span>
                      {activeProfile.employee.phone && <span className="flex items-center gap-1"><Phone size={12} /> {activeProfile.employee.phone}</span>}
                      <span className="flex items-center gap-1"><Calendar size={12} /> Joined {new Date(activeProfile.employee.joinDate).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {activeProfile.employee.bio && (
                  <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 4 }}>About / Bio</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{activeProfile.employee.bio}</p>
                  </div>
                )}

                {activeProfile.employee.skills && activeProfile.employee.skills.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>Skills & Specializations</div>
                    <div className="flex flex-wrap gap-2">
                      {activeProfile.employee.skills.map(s => (
                        <span key={s} className="badge badge-gray" style={{ fontSize: 11, padding: '4px 10px' }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Navigation Tabs */}
              <div className="flex gap-2 border-b" style={{ borderBottomColor: 'var(--border)' }}>
                {[
                  { id: 'overview', label: 'Summary' },
                  { id: 'attendance', label: 'Attendance Tracker' },
                  { id: 'leaves', label: 'Leave Register' },
                  { id: 'payroll', label: 'Payroll & Payslips' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="btn btn-sm"
                    style={{
                      border: 'none', background: 'none', borderRadius: 0, padding: '10px 16px', fontSize: 14, fontWeight: 600,
                      color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab: Overview / Info */}
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Address / Contact Info */}
                  <div className="glass-card" style={{ padding: 24 }}>
                    <h3 className="section-title" style={{ fontSize: 16 }}><MapPin size={16} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-top' }} /> Contact Details</h3>
                    <div style={{ display: 'grid', gap: 12, fontSize: 13 }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Permanent Address</div>
                        <div style={{ fontWeight: 500, marginTop: 2 }}>{activeProfile.employee.address || 'Address information not provided.'}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Corporate Email</div>
                        <div style={{ fontWeight: 500, marginTop: 2 }}>{activeProfile.employee.email}</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Mobile Phone</div>
                        <div style={{ fontWeight: 500, marginTop: 2 }}>{activeProfile.employee.phone || 'No phone registered.'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Documents & Badges */}
                  <div className="glass-card" style={{ padding: 24 }}>
                    <h3 className="section-title" style={{ fontSize: 16 }}><Award size={16} style={{ marginRight: 6, display: 'inline', verticalAlign: 'text-top' }} /> Professional File Attachments</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                      {['Offer_Letter.pdf', 'NDA_Agreement.pdf', 'ID_Card_Pass.pdf'].map(doc => (
                        <div key={doc} style={{
                          padding: '8px 12px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8,
                          fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
                        }}>
                          <span>📄</span> <span style={{ fontWeight: 500 }}>{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab: Attendance tracker */}
              {activeTab === 'attendance' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row gap-6">
                  
                  {/* Daily Logging Form */}
                  <div className="glass-card" style={{ padding: 24, flex: '0 0 280px' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Log Daily Attendance</h3>
                    <form onSubmit={handleRecordAttendance}>
                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>Calendar Date</label>
                        <input className="form-input" type="date" value={attendanceForm.date} onChange={e => setAttendanceForm({ ...attendanceForm, date: e.target.value })} required />
                      </div>
                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>Status</label>
                        <select className="form-select" value={attendanceForm.status} onChange={e => setAttendanceForm({ ...attendanceForm, status: e.target.value })}>
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                          <option value="Late">Late</option>
                          <option value="On Leave">On Leave</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>Check-In Time</label>
                        <input className="form-input" type="time" value={attendanceForm.checkIn} onChange={e => setAttendanceForm({ ...attendanceForm, checkIn: e.target.value })} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 20 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>Check-Out Time</label>
                        <input className="form-input" type="time" value={attendanceForm.checkOut} onChange={e => setAttendanceForm({ ...attendanceForm, checkOut: e.target.value })} />
                      </div>
                      <button type="submit" disabled={actionLoading} className="btn btn-primary w-full">
                        {actionLoading ? 'Saving...' : 'Record Attendance'}
                      </button>
                    </form>
                  </div>

                  {/* Attendance Log Table */}
                  <div className="glass-card flex-1" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Attendance History</h3>
                    {!activeProfile.attendance || activeProfile.attendance.length === 0 ? (
                      <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No attendance entries logged for this employee.</div>
                    ) : (
                      <div className="table-wrapper" style={{ maxHeight: 300, overflowY: 'auto' }}>
                        <table>
                          <thead>
                            <tr><th>Date</th><th>Status</th><th>Check-In</th><th>Check-Out</th><th>Hours</th></tr>
                          </thead>
                          <tbody>
                            {activeProfile.attendance.map(a => (
                              <tr key={a._id}>
                                <td style={{ fontSize: 13 }}>{new Date(a.date).toLocaleDateString('en-IN')}</td>
                                <td>
                                  <span className={`badge ${a.status === 'Present' ? 'badge-success' : a.status === 'Late' ? 'badge-amber' : 'badge-danger'}`}>{a.status}</span>
                                </td>
                                <td style={{ fontSize: 13 }}>{a.checkIn || '--'}</td>
                                <td style={{ fontSize: 13 }}>{a.checkOut || '--'}</td>
                                <td style={{ fontWeight: 600, fontSize: 13 }}>{a.hoursWorked}h</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Tab: Leave Register */}
              {activeTab === 'leaves' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row gap-6">
                  
                  {/* Apply for Leave Form */}
                  <div className="glass-card" style={{ padding: 24, flex: '0 0 280px' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Apply for Leave</h3>
                    <form onSubmit={handleApplyLeave}>
                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>Leave Type</label>
                        <select className="form-select" value={leaveForm.leaveType} onChange={e => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}>
                          <option value="Annual">Annual Leave</option>
                          <option value="Sick">Sick Leave</option>
                          <option value="Casual">Casual Leave</option>
                          <option value="Maternity">Maternity Leave</option>
                          <option value="Paternity">Paternity Leave</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>Start Date</label>
                        <input className="form-input" type="date" value={leaveForm.startDate} onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })} required />
                      </div>
                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>End Date</label>
                        <input className="form-input" type="date" value={leaveForm.endDate} onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })} required />
                      </div>
                      <div className="form-group" style={{ marginBottom: 20 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>Reason</label>
                        <textarea className="form-input" rows={3} value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} required placeholder="Details on why leave is requested..." />
                      </div>
                      <button type="submit" disabled={actionLoading} className="btn btn-primary w-full">
                        {actionLoading ? 'Submitting...' : 'Apply Leave'}
                      </button>
                    </form>
                  </div>

                  {/* Leaves List + Approvals */}
                  <div className="glass-card flex-1" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Leave Requests Register</h3>
                    {!activeProfile.leaves || activeProfile.leaves.length === 0 ? (
                      <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No leave applications logged.</div>
                    ) : (
                      <div className="table-wrapper">
                        <table>
                          <thead>
                            <tr><th>Type</th><th>Start Date</th><th>End Date</th><th>Reason</th><th>Status</th>{isAdminOrHR && <th>Approvals</th>}</tr>
                          </thead>
                          <tbody>
                            {activeProfile.leaves.map(l => (
                              <tr key={l._id}>
                                <td style={{ fontWeight: 600, fontSize: 13 }}>{l.leaveType}</td>
                                <td style={{ fontSize: 12 }}>{new Date(l.startDate).toLocaleDateString('en-IN')}</td>
                                <td style={{ fontSize: 12 }}>{new Date(l.endDate).toLocaleDateString('en-IN')}</td>
                                <td style={{ fontSize: 12, maxwidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.reason}>{l.reason}</td>
                                <td>
                                  <span className={`badge ${l.status === 'Approved' ? 'badge-success' : l.status === 'Pending' ? 'badge-amber' : 'badge-danger'}`}>{l.status}</span>
                                </td>
                                {isAdminOrHR && (
                                  <td>
                                    {l.status === 'Pending' ? (
                                      <div className="flex gap-1">
                                        <button className="btn btn-sm btn-secondary" style={{ padding: '2px 6px', color: 'var(--accent-emerald)', fontSize: 10 }} onClick={() => handleUpdateLeaveStatus(l._id, 'Approved')}>Approve</button>
                                        <button className="btn btn-sm btn-secondary" style={{ padding: '2px 6px', color: 'var(--accent-rose)', fontSize: 10 }} onClick={() => handleUpdateLeaveStatus(l._id, 'Rejected')}>Reject</button>
                                      </div>
                                    ) : (
                                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Logged</span>
                                    )}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Tab: Payroll History & Payslips */}
              {activeTab === 'payroll' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row gap-6">
                  
                  {/* Issue Payslip Form */}
                  <div className="glass-card" style={{ padding: 24, flex: '0 0 280px' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Generate Payslip</h3>
                    <form onSubmit={handleGenerateSalary}>
                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>Billing Month</label>
                        <input className="form-input" value={payrollForm.month} onChange={e => setPayrollForm({ ...payrollForm, month: e.target.value })} required placeholder="e.g. May 2026" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>Basic Salary (₹)</label>
                        <input className="form-input" type="number" value={payrollForm.basicSalary} onChange={e => setPayrollForm({ ...payrollForm, basicSalary: e.target.value })} required />
                      </div>
                      <div className="form-group" style={{ marginBottom: 12 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>Allowances (₹)</label>
                        <input className="form-input" type="number" value={payrollForm.allowances} onChange={e => setPayrollForm({ ...payrollForm, allowances: e.target.value })} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 20 }}>
                        <label className="form-label" style={{ fontSize: 11 }}>Deductions (₹)</label>
                        <input className="form-input" type="number" value={payrollForm.deductions} onChange={e => setPayrollForm({ ...payrollForm, deductions: e.target.value })} />
                      </div>
                      <button type="submit" disabled={actionLoading} className="btn btn-primary w-full">
                        {actionLoading ? 'Issuing...' : 'Generate Payslip'}
                      </button>
                    </form>
                  </div>

                  {/* Payroll Payslips History */}
                  <div className="glass-card flex-1" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Payslip Dispersal History</h3>
                    {!activeProfile.salaries || activeProfile.salaries.length === 0 ? (
                      <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No payroll records found.</div>
                    ) : (
                      <div className="table-wrapper">
                        <table>
                          <thead>
                            <tr><th>Month</th><th>Base Pay</th><th>Allowances</th><th>Deductions</th><th>Net Pay</th><th>Status</th>{isAdminOrManager && <th>Action</th>}</tr>
                          </thead>
                          <tbody>
                            {activeProfile.salaries.map(s => (
                              <tr key={s._id}>
                                <td style={{ fontWeight: 600, fontSize: 13 }}>{s.month}</td>
                                <td style={{ fontSize: 12 }}>₹{s.basicSalary.toLocaleString('en-IN')}</td>
                                <td style={{ fontSize: 12, color: 'var(--accent-emerald)' }}>+₹{s.allowances.toLocaleString('en-IN')}</td>
                                <td style={{ fontSize: 12, color: 'var(--accent-rose)' }}>-₹{s.deductions.toLocaleString('en-IN')}</td>
                                <td style={{ fontWeight: 700, fontSize: 13 }}>₹{s.netSalary.toLocaleString('en-IN')}</td>
                                <td>
                                  <span className={`badge ${s.status === 'Paid' ? 'badge-success' : 'badge-danger'}`}>{s.status}</span>
                                </td>
                                {isAdminOrManager && (
                                  <td>
                                    {s.status === 'Pending' ? (
                                      <button className="btn btn-sm btn-secondary" style={{ padding: '2px 8px', fontSize: 10, color: 'var(--accent-emerald)' }} onClick={() => handlePaySalary(s._id)}>Pay</button>
                                    ) : (
                                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.paymentDate ? new Date(s.paymentDate).toLocaleDateString('en-IN') : 'Paid'}</span>
                                    )}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
