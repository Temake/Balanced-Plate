import axios from "axios"
import type { AxiosError, InternalAxiosRequestConfig } from "axios"
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants"

declare global {
  interface ImportMetaEnv {
    VITE_API_URL: string
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

// Extend the config type to include our custom _retry flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Token refresh state management - prevents multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - attach token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: Error) => {
        return Promise.reject(error);
    }
)

// Response interceptor - handle 401 and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as CustomAxiosRequestConfig;
        
        // If no config or already retried, reject immediately
        if (!originalRequest) {
            return Promise.reject(error);
        }

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise<string>((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem(REFRESH_TOKEN);
            
            if (!refreshToken) {
                isRefreshing = false;
                processQueue(new Error('No refresh token'), null);
                clearAuthAndRedirect();
                return Promise.reject(error);
            }

            try {
                // Use a fresh axios instance to avoid interceptor loops
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/token/refresh/`,
                    { refresh: refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );
                
                if (response.data?.access) {
                    const newToken = response.data.access;
                    localStorage.setItem(ACCESS_TOKEN, newToken);
                    
                    // Update default header for future requests
                    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                    
                    // Process queued requests with new token
                    processQueue(null, newToken);
                    
                    // Retry original request
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                processQueue(refreshError as Error, null);
                clearAuthAndRedirect();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        
        return Promise.reject(error);
    }
)

// Helper to clear auth state and redirect
const clearAuthAndRedirect = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    
    // Only redirect if not already on login page
    if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
    }
};

export default api
