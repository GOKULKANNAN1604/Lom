/**
 * src/api/axios.js
 *
 * Central Axios instance for all Life OS API calls.
 *
 * Features:
 *  1. Base URL from VITE_API_BASE_URL env variable
 *  2. REQUEST interceptor  — injects 'Authorization: Bearer <token>'
 *  3. RESPONSE interceptor — handles 401 responses by:
 *       a. Attempting a silent token refresh via /auth/token/refresh/
 *       b. Retrying the original failed request with the new token
 *       c. Logging the user out if the refresh also fails
 *  4. Request queue — queues concurrent requests while a refresh is in flight,
 *     preventing a "refresh storm" of parallel refresh calls
 */

import axios from 'axios';
import useAuthStore from '../store/authStore';
import { getRefreshToken } from '../utils/tokenStorage';

// ── 1. Create the Axios instance ──────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  timeout: 10_000,                   // 10 second request timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});


// ── Refresh-in-flight state ───────────────────────────────────
// Prevents multiple parallel calls to /token/refresh/
let isRefreshing      = false;
let failedQueue       = [];   // [ { resolve, reject } ]

/**
 * Process queued requests after a refresh succeeds or fails.
 * @param {Error|null} error      - If non-null, all queued requests are rejected.
 * @param {string|null} token     - New access token to inject if refresh succeeded.
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token);
  });
  failedQueue = [];
};


// ── 2. REQUEST Interceptor ────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// ── 3. RESPONSE Interceptor ───────────────────────────────────
api.interceptors.response.use(
  // ✅ Success path — pass response through unchanged
  (response) => response,

  // ❌ Error path — handle 401 Unauthorized
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401 errors on non-auth endpoints,
    // and only once per request (prevent infinite retry loop)
    const is401          = error.response?.status === 401;
    const isRetry        = originalRequest._retry;
    const isAuthEndpoint = originalRequest.url?.includes('/auth/token/');

    if (!is401 || isRetry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Mark this request as already retried
    originalRequest._retry = true;

    // ── If a refresh is already in flight, queue this request ──
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // ── Start the refresh flow ──────────────────────────────────
    isRefreshing = true;
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      // No refresh token available — log the user out immediately
      useAuthStore.getState().logout();
      processQueue(new Error('No refresh token'), null);
      isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      // Call the Django SimpleJWT refresh endpoint
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'}/auth/token/refresh/`,
        { refresh: refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const newAccessToken  = data.access;
      const newRefreshToken = data.refresh; // returned when ROTATE_REFRESH_TOKENS=True

      // Update the store + localStorage with new tokens
      useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

      // Inject new token into the original failed request
      originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

      // Unblock all queued requests
      processQueue(null, newAccessToken);

      return api(originalRequest);   // retry the original request

    } catch (refreshError) {
      // Refresh failed (e.g., refresh token expired) — force logout
      useAuthStore.getState().logout();
      processQueue(refreshError, null);
      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);


export default api;
