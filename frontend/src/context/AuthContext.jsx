import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as defaultAuthService from '../services/authService.js';
import * as defaultProfileService from '../services/profileService.js';
import { ApiError }  from '../api/client.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'hms.token';
const REFRESH_TOKEN_KEY = 'hms.refreshToken';
const ROLE_KEY = 'hms.role';

export function AuthProvider({
  children,
  authService = defaultAuthService,
  profileService = defaultProfileService,
}) {
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
    const data = await profileService.getMyProfile();
    setUser(data);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
      logout();
    } else {
      console.error('Failed to load profile:', error);
    }
  } finally {
    setLoading(false);
  }
}, [profileService, logout]);
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    loadProfile();
  }, [token, loadProfile]);

  async function login(email, password) {
    const data = await authService.loginUser(email, password);

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

  async function register(userData) {
    return authService.registerUser(userData);
  }

  async function forgotPassword(email) {
    return authService.forgotPassword(email);
  }

  async function resetPassword(tokenValue, newPassword) {
    return authService.resetPassword(tokenValue, newPassword);
  }

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
      getAuthHeaders: () => ({ Authorization: `Bearer ${token}` }),
    }),
    [token, role, user, isAuthenticated, loading, loadProfile, logout]
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
  children: PropTypes.node.isRequired,
  authService: PropTypes.shape({
    loginUser: PropTypes.func,
    registerUser: PropTypes.func,
    forgotPassword: PropTypes.func,
    resetPassword: PropTypes.func,
  }),
  profileService: PropTypes.shape({
    getMyProfile: PropTypes.func,
  }),
};