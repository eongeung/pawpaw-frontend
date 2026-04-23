import axios from 'axios';
import useErrorStore from '../store/errorStore';

const instance = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      useErrorStore.getState().setNetworkError(true);
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post('http://localhost:8080/api/auth/refresh', {
          refreshToken,
        });
        localStorage.setItem('accessToken', res.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        return instance(originalRequest);
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        useErrorStore.getState().setSessionExpired(true);
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;
