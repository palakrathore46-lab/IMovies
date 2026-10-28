// src/api/axios.js - Centralized Axios instance with JWT interceptor
import axios from 'axios';

const TOKEN_KEY = 'imovies_token';

// Backend base URL (set VITE_API_URL in .env locally and in Vercel project settings).
// Trailing slashes are removed to avoid double-slash request URLs.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

// Warn loudly if a production build is still pointing at localhost
if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.warn(
    '[IMovies] VITE_API_URL is not set. API requests are going to http://localhost:5000/api. ' +
      'Set VITE_API_URL in your Vercel project settings and redeploy.'
  );
}

// Create Axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30s, so slow cold starts on free hosting still succeed
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token from localStorage to every outgoing request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: if a logged-in user's token has expired (401), clear it
// and send them to the login page. Login/register 401s (wrong password) are
// left alone so their error messages still show.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthForm = url.includes('/auth/login') || url.includes('/auth/register');
    const hadToken = !!localStorage.getItem(TOKEN_KEY);

    if (status === 401 && hadToken && !isAuthForm) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
