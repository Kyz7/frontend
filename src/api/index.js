// File: src/api/index.js - Updated with debugging and fallback
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Debug function to check token size
const debugToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    console.log('🔍 Token length:', token.length);
    console.log('🔍 Token size in bytes:', new Blob([token]).size);
    
    // Try to decode token to see payload
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        console.log('🔍 Token payload:', payload);
        console.log('🔍 Payload size:', JSON.stringify(payload).length);
      }
    } catch (e) {
      console.log('❌ Could not decode token');
    }
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Debug token before sending
    debugToken();
    
    // Check if this is the problematic endpoint
    if (config.url === '/plans') {
      console.log('🚨 Making request to /plans endpoint');
      console.log('🚨 Full headers:', config.headers);
    }
    
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to catch 431 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 431) {
      console.error('🚨 431 Error - Request Header Fields Too Large');
      console.error('🚨 This usually means the Authorization header is too large');
      debugToken();
      
      // Clear potentially corrupted token
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Alternative: Create a separate API instance without token for testing
const apiWithoutAuth = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = (credentials) => api.post('/api/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);

export const getPlaces = (lat, lon, radius = 50000, query = '', type = '') => {
  const params = {
    location: `${lat},${lon}`,
  };
  
  if (radius) params.radius = radius;
  if (query) params.query = query;
  if (type) params.type = type;
  
  return api.get('/api/places', { params });
};

export const geocode = (address) => api.get(`/api/geocode`, { params: { address } });
export const reverseGeocode = (lat, lon) => api.get(`/api/geocode/reverse`, { params: { lat, lon } });

export const savePlan = (planData) => api.post('/api/plans', planData);

// Alternative getUserPlans with manual token handling
export const getUserPlans = () => {
  const token = localStorage.getItem('token');
  console.log('📍 getUserPlans called, token exists:', !!token);
  
  if (!token) {
    return Promise.reject(new Error('No token found'));
  }
  
  // Try with minimal headers first
  return axios({
    method: 'GET',
    url: `${API_URL}/api/plans`,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000 // 10 second timeout
  }).catch(error => {
    if (error.response?.status === 431) {
      console.error('🚨 431 error on getUserPlans');
      // Try without any custom headers
      return axios.get(`${API_URL}/plans?token=${encodeURIComponent(token)}`);
    }
    throw error;
  });
};

export const deletePlan = (planId) => api.delete(`/plans/${planId}`);

export const getWeather = (lat, lon, date) => 
  api.get(`/api/weather`, { params: { lat, lon, date } });

export const getFlightEstimate = (from, to) => 
  api.post('/api/flight/estimate', { from, to });

export const getEstimate = (estimateData) => 
  api.post('/api/estimate', estimateData);

export default api;