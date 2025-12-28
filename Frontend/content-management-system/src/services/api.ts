import axios, { type InternalAxiosRequestConfig, type AxiosError } from 'axios';

// Use relative URL to leverage Vite's proxy configuration
// In production, set this via environment variable
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Important: Don't send cookies with CORS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      // Ensure the token is properly formatted
      const cleanToken = token.trim();
      config.headers['Authorization'] = `Bearer ${cleanToken}`;
      console.log('🔑 Token attached to request:', config.method?.toUpperCase(), config.url);
      console.log('📋 Authorization header:', config.headers['Authorization'].substring(0, 30) + '...');
    } else {
      console.warn('⚠️ No token found in localStorage for request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log all errors for debugging
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data
    });

    // Only auto-redirect on 401 if the error message indicates token expiration or invalid token
    // This allows other 401 errors (like permission issues) to be handled by the component
    if (error.response?.status === 401) {
      const errorMessage = (error.response?.data as any)?.message?.toLowerCase() || '';
      const shouldRedirect = 
        errorMessage.includes('token') || 
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('authentication');
      
      if (shouldRedirect) {
        console.warn('🚪 Token invalid, redirecting to login...');
        // Clear invalid token and user data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Delay redirect slightly to allow error messages to display
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }, 1500);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
