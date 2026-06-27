/**
 * src/hooks/useAuth.js
 *
 * Wraps Zustand auth store + login/logout logic.
 * Import this hook in any component that needs auth state or actions.
 *
 * Usage:
 *   const { user, isAuthenticated, login, logout, isLoading } = useAuth();
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { loginApi } from '../api/auth';

const useAuth = () => {
  const { user, isAuthenticated, setTokens, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);

  /**
   * Login the user.
   * On success: stores tokens and redirects to dashboard.
   * On failure: surfaces the error message.
   */
  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await loginApi(username, password);
      setTokens(data.access, data.refresh);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Log out the user.
   * Clears tokens from store + localStorage and redirects to /login.
   */
  const logout = () => {
    storeLogout();
    navigate('/login', { replace: true });
  };

  return { user, isAuthenticated, login, logout, isLoading, error };
};

export default useAuth;
