/**
 * src/api/auth.js
 * Auth API — login, refresh, logout (server-side blacklist)
 */

import api from './axios';

// POST /api/auth/token/  →  { access, refresh }
export const loginApi = (username, password) =>
  api.post('/auth/token/', { username, password });

// POST /api/auth/token/refresh/  →  { access, refresh }
export const refreshApi = (refresh) =>
  api.post('/auth/token/refresh/', { refresh });

// POST /api/auth/token/verify/
export const verifyApi = (token) =>
  api.post('/auth/token/verify/', { token });
