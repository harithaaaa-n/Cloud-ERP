import axios from 'axios';

let accessToken = null;
let logoutCallback = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

export const registerLogoutCallback = (cb) => {
  logoutCallback = cb;
};

// ── Production-safe base URL ──────────────────────────────────────────────────
// In development: empty string → Vite proxy forwards /api/* to http://localhost:5000
// In production: VITE_API_URL must be set to the deployed backend URL
//                e.g. https://clouderp-backend.onrender.com or with trailing /api
const VITE_API_URL = import.meta.env.VITE_API_URL || '';
const BASE_URL = VITE_API_URL.endsWith('/api') ? VITE_API_URL.slice(0, -4) : VITE_API_URL;


const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for httpOnly refresh token cookie
  timeout: 15000,        // 15 s timeout — prevents hanging requests in prod
});

// ── Request Interceptor: Attach Access Token ──────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: Transparent Token Refresh ───────────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else       prom.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Never attempt auto-refresh for auth endpoints — prevents infinite 401 loops
    const isAuthEndpoint = originalRequest.url?.includes('/api/auth/login')
      || originalRequest.url?.includes('/api/auth/refresh')
      || originalRequest.url?.includes('/api/auth/register')
      || originalRequest.url?.includes('/api/auth/logout');

    if (
      error.response?.status === 401
      && !originalRequest._retry
      && !isAuthEndpoint
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Use the same base URL so the refresh call also works in production
        const res = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken: newAccessToken } = res.data;

        setAccessToken(newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        isRefreshing = false;

        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        setAccessToken(null);
        if (logoutCallback) logoutCallback();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
