import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (userData) => 
    api.post('/auth/register', userData),
  
  verifyToken: () => 
    api.get('/auth/verify')
};

export const facilityService = {
  getNearby: (lat, lon, radius = 5000, type = null) => {
    const params = new URLSearchParams({ lat, lon, radius_m: radius });
    if (type) params.append('type', type);
    return api.get(`/facilities/nearby?${params}`);
  },
  
  getById: (id) => 
    api.get(`/facilities/${id}`),
  
  updateSnapshot: (id, data) => 
    api.post(`/facilities/${id}/snapshot`, data)
};

export const routingService = {
  estimateRoute: (origin, destinationId, mode = 'driving') => 
    api.post('/routing/estimate', { origin, destination_id: destinationId, mode })
};

export const analyticsService = {
  getRiskHeatmap: (bbox) => 
    api.get(`/analytics/risk?bbox=${bbox}`),
  
  runScenario: (location, serviceRadius) => 
    api.post('/analytics/scenario', { location, service_radius: serviceRadius }),
  
  getStats: (timeRange) => 
    api.get(`/analytics/stats?time_range=${timeRange}`),
  
  getTrends: (diseaseCode, timeRange) => {
    const params = new URLSearchParams();
    if (diseaseCode) params.append('disease_code', diseaseCode);
    if (timeRange) params.append('time_range', timeRange);
    return api.get(`/analytics/trends?${params}`);
  }
};

export const adminService = {
  getAuditLogs: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/admin/auditlogs?${params}`);
  },
  
  getSystemStats: () => 
    api.get('/admin/stats')
};

export default api;
