import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Attach access token to every request
api.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — try refresh, then logout
api.interceptors.response.use(
  res => res,
  async err => {
    // Handle Timeouts & Network Errors (Universal for mobile)
    if (err.code === "ECONNABORTED") {
      return Promise.reject(new Error("Request timed out. Please check your connection."));
    }
    if (!err.response) {
      return Promise.reject(new Error("Network error. Please check your internet connection."));
    }

    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { refreshToken, setTokens } = useAuthStore.getState();
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken }
        );
        setTokens(data.accessToken, data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(err);
  }
);

export default api;
