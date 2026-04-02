// FILE: src/lib/apiClient.ts
// PURPOSE: Axios client with token refresh interceptor and CSRF handling
// API: All v2 endpoints use this client

import axios, { AxiosError } from 'axios';
import type {InternalAxiosRequestConfig} from 'axios'

// Base configuration
const baseURL = import.meta.env.VITE_API_BASE || '/api/v2';

// Create axios instance
export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true, // Essential for cookie-based auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF token storage
let csrfToken: string | null = null;

/**
 * Fetch CSRF token from server
 * Call this before making mutating requests if backend requires CSRF
 */
export const ensureCsrf = async (): Promise<string> => {
  if (csrfToken) return csrfToken;
  
  try {
    const response = await apiClient.get('/auth/csrf');
    // Backend returns { csrftoken: "..." }
    csrfToken = response.data.csrftoken || response.data.csrf_token || response.data.csrfToken;
    return csrfToken || '';
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
};

/**
 * Clear CSRF token (call on logout)
 */
export const clearCsrf = () => {
  csrfToken = null;
};

// Request interceptor - attach CSRF token for mutating requests
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Attach CSRF token for POST, PUT, PATCH, DELETE requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      // Skip CSRF for auth endpoints that don't need it (csrf fetch itself)
      if (!config.url?.includes('/auth/csrf')) {
        try {
          const token = await ensureCsrf();
          config.headers['X-CSRFToken'] = token;
        } catch (error) {
          console.error('CSRF token fetch failed:', error);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 with token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Skip refresh for auth endpoints
      if (originalRequest.url?.includes('/auth/refresh') || 
          originalRequest.url?.includes('/auth/login') ||
          originalRequest.url?.includes('/auth/signup')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt token refresh
        await apiClient.post('/auth/refresh');
        processQueue(null, 'refreshed');
        isRefreshing = false;
        
        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        isRefreshing = false;
        
        // Clear auth state and redirect to login
        clearCsrf();
        
        // Dispatch custom event for auth failure
        window.dispatchEvent(new CustomEvent('auth:logout'));
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper to handle API errors
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message || 
                   error.response?.data?.error ||
                   error.message;
    return message;
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred';
};

export default apiClient;
