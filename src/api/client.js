import axios from 'axios';

// Configure base URL pointing directly to 65.20.92.22:8000
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://65.20.92.22:8000';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT access token and active admin role to outgoing requests
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agrovercity_access_token');
    const role = localStorage.getItem('agrovercity_admin_role') || 'superadmin';

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (!config.headers['X-Admin-Role']) {
      config.headers['X-Admin-Role'] = role;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 Unauthorized responses to clear stale credentials
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const code = error.response.data?.error?.code;
      if (code === 'INVALID_TOKEN' || code === 'MISSING_TOKEN') {
        localStorage.removeItem('agrovercity_access_token');
        localStorage.removeItem('agrovercity_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default client;
