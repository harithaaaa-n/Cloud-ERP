import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import Layout from './components/Layout';

// ── Auth Pages ────────────────────────────────────────────────────
import Login  from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword  from './pages/auth/ResetPassword';
import VerifyEmail    from './pages/auth/VerifyEmail';
import Unauthorized   from './pages/Unauthorized';

// ── App Pages ─────────────────────────────────────────────────────
import Dashboard  from './pages/Dashboard';
import Finance    from './pages/finance/Finance';
import Accounts   from './pages/finance/Accounts';
import Payroll    from './pages/finance/Payroll';
import Employees  from './pages/hr/Employees';
import Profiles   from './pages/hr/Profiles';
import Inventory  from './pages/inventory/Inventory';
import SupplyChain from './pages/supply/SupplyChain';
import Orders     from './pages/supply/Orders';
import Reports    from './pages/reports/Reports';
import AIInsights from './pages/AIInsights';
import NotificationsPage from './pages/NotificationsPage';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>

          {/* ── Public Auth Routes ─────────────────────────────── */}
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email"    element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* ── Protected App Routes ──────────────────────────── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard */}
            <Route index element={<Dashboard />} />

            {/* Unauthorized fallback */}
            <Route path="unauthorized" element={<Unauthorized />} />

            {/* Notifications */}
            <Route path="notifications" element={<RoleGuard allowedRoles={['admin', 'hr', 'manager', 'employee']}><NotificationsPage /></RoleGuard>} />

            {/* Finance */}
            <Route path="finance"          element={<RoleGuard allowedRoles={['admin', 'manager']}><Finance /></RoleGuard>} />
            <Route path="finance/accounts" element={<RoleGuard allowedRoles={['admin', 'manager']}><Accounts /></RoleGuard>} />
            <Route path="finance/payroll"  element={<RoleGuard allowedRoles={['admin', 'hr']}><Payroll /></RoleGuard>} />

            {/* HR */}
            <Route path="hr"          element={<RoleGuard allowedRoles={['admin', 'hr']}><Employees /></RoleGuard>} />
            <Route path="hr/profiles" element={<RoleGuard allowedRoles={['admin', 'hr', 'manager', 'employee']}><Profiles /></RoleGuard>} />

            {/* Inventory */}
            <Route path="inventory" element={<RoleGuard allowedRoles={['admin', 'manager']}><Inventory /></RoleGuard>} />

            {/* Supply Chain */}
            <Route path="supply"        element={<RoleGuard allowedRoles={['admin', 'manager']}><SupplyChain /></RoleGuard>} />
            <Route path="supply/orders" element={<RoleGuard allowedRoles={['admin', 'manager']}><Orders /></RoleGuard>} />

            {/* Reports & AI */}
            <Route path="reports" element={<RoleGuard allowedRoles={['admin', 'manager']}><Reports /></RoleGuard>} />
            <Route path="ai"      element={<RoleGuard allowedRoles={['admin', 'manager']}><AIInsights /></RoleGuard>} />
          </Route>

          {/* ── Catch-all → redirect to dashboard ─────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  </AuthProvider>
  );
}

export default App;
