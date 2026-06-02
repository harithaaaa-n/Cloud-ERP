import apiClient, { setAccessToken } from './apiClient';
import { demoDB, initializeDemoDB } from './demoData';

// Automatically initialize the mock databases in localStorage
initializeDemoDB();

const isDemoMode = () => {
  return localStorage.getItem('clouderp_demo_mode') === 'true';
};

const handleResponse = (response) => {
  return response.data;
};

const handleError = (error) => {
  const message = error.response?.data?.message || error.message || 'Something went wrong';
  throw new Error(message);
};

export const api = {
  // ── Auth API ──────────────────────────────────────────────────────
  auth: {
    login: async (credentials) => {
      if (isDemoMode()) {
        const res = demoDB.login(credentials.email, credentials.password);
        localStorage.setItem('clouderp_demo_current_user', JSON.stringify(res.user));
        return res;
      }
      try {
        const res = await apiClient.post('/api/auth/login', credentials);
        if (res.data.success && res.data.accessToken) {
          setAccessToken(res.data.accessToken);
        }
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    register: async (userData) => {
      if (isDemoMode()) {
        const newUser = {
          id: `u-${Date.now()}`,
          name: userData.name,
          email: userData.email,
          role: userData.role || 'employee',
          isActive: true
        };
        localStorage.setItem('clouderp_demo_current_user', JSON.stringify(newUser));
        return {
          success: true,
          accessToken: 'demo-mock-register-token',
          user: newUser
        };
      }
      try {
        const res = await apiClient.post('/api/auth/register', userData);
        if (res.data.success && res.data.accessToken) {
          setAccessToken(res.data.accessToken);
        }
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    logout: async () => {
      if (isDemoMode()) {
        localStorage.removeItem('clouderp_demo_current_user');
        return { success: true };
      }
      try {
        const res = await apiClient.post('/api/auth/logout');
        setAccessToken(null);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getMe: async () => {
      if (isDemoMode()) {
        const usr = localStorage.getItem('clouderp_demo_current_user');
        if (!usr) throw new Error('Unauthenticated');
        return { success: true, user: JSON.parse(usr) };
      }
      try {
        const res = await apiClient.get('/api/auth/me');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    forgotPassword: async (email) => {
      if (isDemoMode()) {
        return { success: true, message: 'Demo mode: Reset link simulated and sent.' };
      }
      try {
        const res = await apiClient.post('/api/auth/forgot-password', { email });
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    resetPassword: async (token, password) => {
      if (isDemoMode()) {
        return { success: true, message: 'Demo mode: Password reset completed.' };
      }
      try {
        const res = await apiClient.post('/api/auth/reset-password', { token, password });
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    verifyEmail: async (token) => {
      if (isDemoMode()) {
        return { success: true, message: 'Demo mode: Email verification completed.' };
      }
      try {
        const res = await apiClient.post('/api/auth/verify-email', { token });
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
  },

  // ── HR / Employees API ────────────────────────────────────────────
  hr: {
    getEmployees: async (params) => {
      if (isDemoMode()) {
        const list = demoDB.getEmployees();
        let filtered = [...list];
        if (params?.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(e => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.department.toLowerCase().includes(q));
        }
        return { success: true, employees: filtered };
      }
      try {
        const res = await apiClient.get('/api/hr/employees', { params });
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getEmployeeById: async (id) => {
      if (isDemoMode()) {
        const list = demoDB.getEmployees();
        const emp = list.find(e => e._id === id);
        if (!emp) throw new Error('Employee not found');
        return { success: true, employee: emp };
      }
      try {
        const res = await apiClient.get(`/api/hr/employees/${id}`);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    createEmployee: async (employeeData) => {
      if (isDemoMode()) {
        const newEmp = demoDB.createEmployee(employeeData);
        return { success: true, employee: newEmp };
      }
      try {
        const res = await apiClient.post('/api/hr/employees', employeeData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    updateEmployee: async (id, employeeData) => {
      if (isDemoMode()) {
        const updated = demoDB.updateEmployee(id, employeeData);
        return { success: true, employee: updated };
      }
      try {
        const res = await apiClient.put(`/api/hr/employees/${id}`, employeeData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    deleteEmployee: async (id) => {
      if (isDemoMode()) {
        return demoDB.deleteEmployee(id);
      }
      try {
        const res = await apiClient.delete(`/api/hr/employees/${id}`);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    recordAttendance: async (id, attendanceData) => {
      if (isDemoMode()) {
        const updated = demoDB.recordAttendance(id, attendanceData.checkIn, attendanceData.checkOut);
        return { success: true, employee: updated };
      }
      try {
        const res = await apiClient.post(`/api/hr/employees/${id}/attendance`, attendanceData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    applyLeave: async (id, leaveData) => {
      if (isDemoMode()) {
        const newLeave = demoDB.applyLeave(id, leaveData.type, leaveData.startDate, leaveData.endDate, leaveData.reason);
        return { success: true, leave: newLeave };
      }
      try {
        const res = await apiClient.post(`/api/hr/employees/${id}/leaves`, leaveData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    updateLeaveStatus: async (leaveId, statusUpdate) => {
      if (isDemoMode()) {
        return demoDB.updateLeaveStatus(leaveId, statusUpdate.status);
      }
      try {
        const res = await apiClient.patch(`/api/hr/leaves/${leaveId}`, statusUpdate);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    generateSalary: async (id, salaryData) => {
      if (isDemoMode()) {
        const slip = demoDB.generateSalary(id, salaryData.month, salaryData.basicSalary, salaryData.allowances, salaryData.deductions);
        return { success: true, salary: slip };
      }
      try {
        const res = await apiClient.post(`/api/hr/employees/${id}/salaries`, salaryData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    paySalary: async (salaryId) => {
      if (isDemoMode()) {
        return demoDB.paySalary(salaryId);
      }
      try {
        const res = await apiClient.patch(`/api/hr/salaries/${salaryId}`);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getAllPayslips: async () => {
      if (isDemoMode()) {
        return { success: true, payslips: demoDB.getAllPayslips() };
      }
      try {
        const res = await apiClient.get('/api/hr/payroll');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
  },

  inventory: {
    getProducts: async (params) => {
      if (isDemoMode()) {
        const list = demoDB.getProducts();
        let filtered = [...list];
        if (params?.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
        }
        return { success: true, products: filtered };
      }
      try {
        const res = await apiClient.get('/api/inventory', { params });
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    createProduct: async (productData) => {
      if (isDemoMode()) {
        const newProd = demoDB.createProduct(productData);
        return { success: true, product: newProd };
      }
      try {
        const res = await apiClient.post('/api/inventory', productData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    updateProduct: async (id, productData) => {
      if (isDemoMode()) {
        const updated = demoDB.updateProduct(id, productData);
        return { success: true, product: updated };
      }
      try {
        const res = await apiClient.put(`/api/inventory/${id}`, productData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    deleteProduct: async (id) => {
      if (isDemoMode()) {
        return demoDB.deleteProduct(id);
      }
      try {
        const res = await apiClient.delete(`/api/inventory/${id}`);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    adjustStock: async (id, adjustmentData) => {
      if (isDemoMode()) {
        const updated = demoDB.adjustStock(id, adjustmentData.adjustment, adjustmentData.reason);
        return { success: true, product: updated };
      }
      try {
        const res = await apiClient.post(`/api/inventory/${id}/adjust`, adjustmentData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getAnalytics: async () => {
      if (isDemoMode()) {
        const data = demoDB.getAdvancedData();
        return { 
          success: true, 
          analytics: {
            totalStockValue: data.overview.inventoryValue,
            lowStockItemsCount: data.overview.lowStockItems,
            averageTurnoverDays: 14.5
          }
        };
      }
      try {
        const res = await apiClient.get('/api/inventory/analytics');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getLogs: async () => {
      if (isDemoMode()) {
        return { success: true, logs: demoDB.getInventoryLogs() };
      }
      try {
        const res = await apiClient.get('/api/inventory/logs');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
  },

  supply: {
    getContacts: async (params) => {
      if (isDemoMode()) {
        const list = demoDB.getContacts();
        let filtered = [...list];
        if (params?.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.contactPerson.toLowerCase().includes(q));
        }
        return { success: true, contacts: filtered };
      }
      try {
        const res = await apiClient.get('/api/supply/contacts', { params });
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    createContact: async (contactData) => {
      if (isDemoMode()) {
        const newCnt = demoDB.createContact(contactData);
        return { success: true, contact: newCnt };
      }
      try {
        const res = await apiClient.post('/api/supply/contacts', contactData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    updateContact: async (id, contactData) => {
      if (isDemoMode()) {
        const updated = demoDB.updateContact(id, contactData);
        return { success: true, contact: updated };
      }
      try {
        const res = await apiClient.put(`/api/supply/contacts/${id}`, contactData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    deleteContact: async (id) => {
      if (isDemoMode()) {
        return demoDB.deleteContact(id);
      }
      try {
        const res = await apiClient.delete(`/api/supply/contacts/${id}`);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getOrders: async (params) => {
      if (isDemoMode()) {
        const list = demoDB.getOrders();
        let filtered = [...list];
        if (params?.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(o => o.vendor.toLowerCase().includes(q) || o.orderNumber.toLowerCase().includes(q));
        }
        return { success: true, orders: filtered };
      }
      try {
        const res = await apiClient.get('/api/supply/orders', { params });
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    createOrder: async (orderData) => {
      if (isDemoMode()) {
        const newOrd = demoDB.createOrder(orderData);
        return { success: true, order: newOrd };
      }
      try {
        const res = await apiClient.post('/api/supply/orders', orderData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    updateOrderStatus: async (id, statusData) => {
      if (isDemoMode()) {
        const updated = demoDB.updateOrderStatus(id, statusData.status);
        return { success: true, order: updated };
      }
      try {
        const res = await apiClient.post(`/api/supply/orders/${id}/status`, statusData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getSupplierAnalytics: async () => {
      if (isDemoMode()) {
        return {
          success: true,
          analytics: {
            averageRating: 4.6,
            onTimeDeliveryRate: 93.8,
            totalOrdersCount: demoDB.getOrders().length
          }
        };
      }
      try {
        const res = await apiClient.get('/api/supply/analytics');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getNotifications: async () => {
      if (isDemoMode()) {
        const list = demoDB.getNotifications();
        return { success: true, notifications: list.filter(n => n.type === 'alert') };
      }
      try {
        const res = await apiClient.get('/api/supply/notifications');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    markNotificationRead: async (id) => {
      if (isDemoMode()) {
        return demoDB.markNotificationRead(id);
      }
      try {
        const res = await apiClient.put(`/api/supply/notifications/${id}/read`);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
  },

  // ── Finance API ───────────────────────────────────────────────────
  finance: {
    getTransactions: async () => {
      if (isDemoMode()) {
        return { success: true, transactions: demoDB.getTransactions() };
      }
      try {
        const res = await apiClient.get('/api/finance/transactions');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    createTransaction: async (txnData) => {
      if (isDemoMode()) {
        const newTx = demoDB.createTransaction(txnData);
        return { success: true, transaction: newTx };
      }
      try {
        const res = await apiClient.post('/api/finance/transactions', txnData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getSummary: async () => {
      if (isDemoMode()) {
        const data = demoDB.getAdvancedData();
        return {
          success: true,
          summary: {
            totalRevenue: data.overview.totalRevenue,
            totalExpense: data.overview.totalExpense,
            netProfit: data.overview.netProfit,
            profitMargin: data.overview.profitMargin
          }
        };
      }
      try {
        const res = await apiClient.get('/api/finance/summary');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
  },

  analytics: {
    getDashboard: async () => {
      if (isDemoMode()) {
        const data = demoDB.getAdvancedData();
        return {
          success: true,
          stats: {
            totalRevenue: data.overview.totalRevenue,
            totalExpense: data.overview.totalExpense,
            netProfit: data.overview.netProfit,
            employeeCount: data.overview.employeeCount,
            inventoryValue: data.overview.inventoryValue,
            lowStockItems: data.overview.lowStockItems
          }
        };
      }
      try {
        const res = await apiClient.get('/api/analytics/dashboard');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getInsights: async () => {
      if (isDemoMode()) {
        return { success: true, insights: demoDB.getInsights() };
      }
      try {
        const res = await apiClient.get('/api/analytics/insights');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getAdvanced: async (params) => {
      if (isDemoMode()) {
        const data = demoDB.getAdvancedData();
        return {
          success: true,
          ...data
        };
      }
      try {
        const res = await apiClient.get('/api/analytics/advanced', { params });
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
  },

  notifications: {
    getNotifications: async () => {
      if (isDemoMode()) {
        return { success: true, notifications: demoDB.getNotifications() };
      }
      try {
        const res = await apiClient.get('/api/notifications');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    markRead: async (id) => {
      if (isDemoMode()) {
        return demoDB.markNotificationRead(id);
      }
      try {
        const res = await apiClient.put(`/api/notifications/${id}/read`);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    markAllRead: async () => {
      if (isDemoMode()) {
        return demoDB.markAllNotificationsRead();
      }
      try {
        const res = await apiClient.put('/api/notifications/read-all');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    createAnnouncement: async (annData) => {
      if (isDemoMode()) {
        const list = demoDB.getNotifications();
        const newAnn = {
          _id: `n-${Date.now()}`,
          title: annData.title || 'System Announcement',
          message: annData.message,
          type: 'announcement',
          read: false,
          createdAt: new Date().toISOString()
        };
        list.push(newAnn);
        demoDB.saveNotifications(list);
        return { success: true, notification: newAnn };
      }
      try {
        const res = await apiClient.post('/api/notifications/announcement', annData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    deleteNotification: async (id) => {
      if (isDemoMode()) {
        return demoDB.deleteNotification(id);
      }
      try {
        const res = await apiClient.delete(`/api/notifications/${id}`);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
  },
};
