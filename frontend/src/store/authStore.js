/**
 * src/store/authStore.js
 *
 * Zustand store for authentication state.
 *
 * Holds:
 *   - accessToken  — in-memory only (lost on refresh, re-hydrated via refresh token)
 *   - user         — decoded JWT payload { user_id, username, email, exp }
 *   - isAuthenticated — derived boolean
 *
 * Actions:
 *   - setTokens(access, refresh) — store new tokens after login / refresh
 *   - logout()                   — clear everything
 */

import { create } from 'zustand';
import {
  setAccessToken,
  setRefreshToken,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  decodeJWT,
  isTokenExpired,
} from '../utils/tokenStorage';

const useAuthStore = create((set) => ({
  // ── State ─────────────────────────────────────────────────
  accessToken:     getAccessToken()  || null,
  refreshToken:    getRefreshToken() || null,
  user:            decodeJWT(getAccessToken()) || null,
  isAuthenticated: !!(getAccessToken() && !isTokenExpired(getAccessToken())),

  // ── Actions ───────────────────────────────────────────────

  /**
   * Call this after a successful login OR after a token refresh.
   * Updates both in-memory state and localStorage.
   */
  setTokens: (access, refresh) => {
    setAccessToken(access);
    if (refresh) setRefreshToken(refresh);

    set({
      accessToken:     access,
      refreshToken:    refresh || getRefreshToken(),
      user:            decodeJWT(access),
      isAuthenticated: true,
    });
  },

  /**
   * Call this on logout or when a 401 that cannot be recovered occurs.
   * Clears localStorage and resets all state.
   */
  logout: () => {
    clearTokens();
    set({
      accessToken:     null,
      refreshToken:    null,
      user:            null,
      isAuthenticated: false,
    });
  },
}));

export default useAuthStore;
