import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginUser, registerUser } from '../services/authService.js';
import { getStudentProfile } from '../services/studentService.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'hms.token';
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
    localStorage.removeItem(ROLE_KEY);
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const data = await getStudentProfile();
      setUser(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (role === 'STUDENT') {
      loadProfile();
      return;
    }

    setUser(null);
    setLoading(false);
  }, [token, role, loadProfile]);

  async function login(email, password) {
    const data = await loginUser(email, password);
    setToken(data.token);
    setRole(data.role);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(ROLE_KEY, data.role);
    if (data.role === 'STUDENT') {
      await loadProfile();
    }
    return data;
  }

  async function register(userData) {
    const data = await registerUser(userData);
    setToken(data.token);
    setRole(data.role);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(ROLE_KEY, data.role);
    if (data.role === 'STUDENT') {
      await loadProfile();
    }
    return data;
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
