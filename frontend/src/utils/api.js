import apiClient, { setAccessToken } from './apiClient';

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
      try {
        const res = await apiClient.post('/api/auth/logout');
        setAccessToken(null);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getMe: async () => {
      try {
        const res = await apiClient.get('/api/auth/me');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    forgotPassword: async (email) => {
      try {
        const res = await apiClient.post('/api/auth/forgot-password', { email });
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    resetPassword: async (token, password) => {
      try {
        const res = await apiClient.post('/api/auth/reset-password', { token, password });
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    verifyEmail: async (token) => {
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
      try {
        const res = await apiClient.get('/api/hr/employees', { params });
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getEmployeeById: async (id) => {
      try {
        const res = await apiClient.get(`/api/hr/employees/${id}`);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    createEmployee: async (employeeData) => {
      try {
        const res = await apiClient.post('/api/hr/employees', employeeData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    updateEmployee: async (id, employeeData) => {
      try {
        const res = await apiClient.put(`/api/hr/employees/${id}`, employeeData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    deleteEmployee: async (id) => {
      try {
        const res = await apiClient.delete(`/api/hr/employees/${id}`);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    recordAttendance: async (id, attendanceData) => {
      try {
        const res = await apiClient.post(`/api/hr/employees/${id}/attendance`, attendanceData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    applyLeave: async (id, leaveData) => {
      try {
        const res = await apiClient.post(`/api/hr/employees/${id}/leaves`, leaveData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    updateLeaveStatus: async (leaveId, statusUpdate) => {
      try {
        const res = await apiClient.patch(`/api/hr/leaves/${leaveId}`, statusUpdate);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    generateSalary: async (id, salaryData) => {
      try {
        const res = await apiClient.post(`/api/hr/employees/${id}/salaries`, salaryData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    paySalary: async (salaryId) => {
      try {
        const res = await apiClient.patch(`/api/hr/salaries/${salaryId}`);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getAllPayslips: async () => {
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
      try {
        const res = await apiClient.get('/api/inventory', { params });
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    createProduct: async (productData) => {
      try {
        const res = await apiClient.post('/api/inventory', productData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    updateProduct: async (id, productData) => {
      try {
        const res = await apiClient.put(`/api/inventory/${id}`, productData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    deleteProduct: async (id) => {
      try {
        const res = await apiClient.delete(`/api/inventory/${id}`);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    adjustStock: async (id, adjustmentData) => {
      try {
        const res = await apiClient.post(`/api/inventory/${id}/adjust`, adjustmentData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getAnalytics: async () => {
      try {
        const res = await apiClient.get('/api/inventory/analytics');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getLogs: async () => {
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
      try {
        const res = await apiClient.get('/api/supply/contacts', { params });
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    createContact: async (contactData) => {
      try {
        const res = await apiClient.post('/api/supply/contacts', contactData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    updateContact: async (id, contactData) => {
      try {
        const res = await apiClient.put(`/api/supply/contacts/${id}`, contactData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    deleteContact: async (id) => {
      try {
        const res = await apiClient.delete(`/api/supply/contacts/${id}`);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getOrders: async (params) => {
      try {
        const res = await apiClient.get('/api/supply/orders', { params });
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    createOrder: async (orderData) => {
      try {
        const res = await apiClient.post('/api/supply/orders', orderData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    updateOrderStatus: async (id, statusData) => {
      try {
        const res = await apiClient.post(`/api/supply/orders/${id}/status`, statusData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getSupplierAnalytics: async () => {
      try {
        const res = await apiClient.get('/api/supply/analytics');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getNotifications: async () => {
      try {
        const res = await apiClient.get('/api/supply/notifications');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    markNotificationRead: async (id) => {
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
      try {
        const res = await apiClient.get('/api/finance/transactions');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    createTransaction: async (txnData) => {
      try {
        const res = await apiClient.post('/api/finance/transactions', txnData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getSummary: async () => {
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
      try {
        const res = await apiClient.get('/api/analytics/dashboard');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getInsights: async () => {
      try {
        const res = await apiClient.get('/api/analytics/insights');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    getAdvanced: async (params) => {
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
      try {
        const res = await apiClient.get('/api/notifications');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    markRead: async (id) => {
      try {
        const res = await apiClient.put(`/api/notifications/${id}/read`);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    markAllRead: async () => {
      try {
        const res = await apiClient.put('/api/notifications/read-all');
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    createAnnouncement: async (annData) => {
      try {
        const res = await apiClient.post('/api/notifications/announcement', annData);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
    deleteNotification: async (id) => {
      try {
        const res = await apiClient.delete(`/api/notifications/${id}`);
        return handleResponse(res);
      } catch (err) {
        handleError(err);
      }
    },
  },
};
