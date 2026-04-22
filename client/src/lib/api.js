import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: `http://${window.location.hostname}:5000/api`, 
});

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
