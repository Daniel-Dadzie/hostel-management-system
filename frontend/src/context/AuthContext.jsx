import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginUser, registerUser, forgotPassword as fp, resetPassword as rp } from '../services/authService.js';
import { getMyProfile } from '../services/profileService.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'hms.token';
const REFRESH_TOKEN_KEY = 'hms.refreshToken';
const ROLE_KEY = 'hms.role';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(token);

  const logout = useCallback(() => {
    setToken('');
    setRole('');
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const data = await getMyProfile();
      setUser(data);
    } catch (error) {
      // Only logout on auth failures (401/403), not network errors
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        logout();
      } else {
        console.error('Failed to load profile:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    loadProfile();
  }, [token, role, loadProfile]);

  async function login(email, password) {
    const data = await loginUser(email, password);
    // Handle new token format with accessToken and refreshToken
    const accessToken = data.accessToken || data.token;
    const refreshToken = data.refreshToken;
    setToken(accessToken);
    setRole(data.role);
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
    localStorage.setItem(ROLE_KEY, data.role);
    await loadProfile();
    return data;
  }

  const register = registerUser;

  const forgotPassword = fp;

  const resetPassword = rp;

  const value = useMemo(
    () => ({
      token,
      role,
      user,
      isAuthenticated,
      loading,
      login,
      register,
      logout,
      loadProfile,
      setUser,
      forgotPassword,
      resetPassword,
      getAuthHeaders: () => ({ Authorization: `Bearer ${token}` })
    }),
    [token, role, user, isAuthenticated, loading, logout, loadProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
