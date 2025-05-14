// File: src/api/index.js updated with new geocoding endpoints
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);

// Places API
export const getPlaces = (lat, lon, radius = 50000, query = '', type = '') => {
  const params = {
    location: `${lat},${lon}`,
  };
  
  if (radius) params.radius = radius;
  if (query) params.query = query;
  if (type) params.type = type;
  
  return api.get('/api/places', { params });
};

// Geocoding API
export const geocode = (address) => api.get(`/api/geocode`, { params: { address } });
export const reverseGeocode = (lat, lon) => api.get(`/api/geocode/reverse`, { params: { lat, lon } });

// Plan API
export const savePlan = (planData) => api.post('/plans', planData);
export const getUserPlans = () => api.get('/plans');

// Weather API
export const getWeather = (lat, lon, date) => 
  api.get(`/api/weather`, { params: { lat, lon, date } });

// Flight API
export const getFlightEstimate = (from, to) => 
  api.post('/api/flight/estimate', { from, to });

// Estimate API
export const getEstimate = (estimateData) => 
  api.post('/api/estimate', estimateData);

export default api;