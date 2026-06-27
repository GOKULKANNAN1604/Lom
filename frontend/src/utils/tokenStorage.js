/**
 * src/utils/tokenStorage.js
 *
 * Centralised helpers for storing JWT tokens in localStorage.
 *
 * WHY localStorage vs. httpOnly cookie?
 *   - Access token: stored in memory (Zustand) — never persisted.
 *     This limits XSS exposure; the token is lost on tab close.
 *   - Refresh token: stored in localStorage so the user stays
 *     logged in across page refreshes. Upgrade to httpOnly cookie
 *     on the backend when you move to production.
 */

const ACCESS_KEY  = 'life_os_access';
const REFRESH_KEY = 'life_os_refresh';

// ── Access Token ────────────────────────────────────────────
export const getAccessToken  = ()      => localStorage.getItem(ACCESS_KEY);
export const setAccessToken  = (token) => localStorage.setItem(ACCESS_KEY, token);
export const clearAccessToken = ()     => localStorage.removeItem(ACCESS_KEY);

// ── Refresh Token ───────────────────────────────────────────
export const getRefreshToken  = ()      => localStorage.getItem(REFRESH_KEY);
export const setRefreshToken  = (token) => localStorage.setItem(REFRESH_KEY, token);
export const clearRefreshToken = ()     => localStorage.removeItem(REFRESH_KEY);

// ── Clear all session data (logout) ─────────────────────────
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

// ── Decode JWT payload without a library ───────────────────
export const decodeJWT = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
};

// ── Check if a token is expired ─────────────────────────────
export const isTokenExpired = (token) => {
  const decoded = decodeJWT(token);
  if (!decoded?.exp) return true;
  // exp is in seconds, Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now();
};
