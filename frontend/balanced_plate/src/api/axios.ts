import axios from "axios"
import type { InternalAxiosRequestConfig } from "axios"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants"

declare global {
  interface ImportMetaEnv {
    VITE_API_URL: string
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
})

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

const addSubscriber = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN);
      
      if (!refreshToken) {
        isRefreshing = false;
        clearAuth();
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/token/refresh/`,
          { refresh: refreshToken }
        );
        
        localStorage.setItem(ACCESS_TOKEN, data.access);
        onRefreshed(data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch {
        clearAuth();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

const clearAuth = () => {
  localStorage.removeItem(ACCESS_TOKEN);
  localStorage.removeItem(REFRESH_TOKEN);
  if (!window.location.pathname.includes('/login')) {
    window.location.href = '/login';
  }
};

export default api
