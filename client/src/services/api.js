import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('adminAuth');

  if (stored) {
    const adminAuth = JSON.parse(stored);

    if (adminAuth?.token) {
      config.headers.Authorization = `Bearer ${adminAuth.token}`;
    }
  }

  return config;
});

export default api;