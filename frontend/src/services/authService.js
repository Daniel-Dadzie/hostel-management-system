import { apiRequest } from './api.js';

export function loginUser(email, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: { email, password }
  });
}

export function registerUser(userData) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: userData
  });
}

export function forgotPassword(email) {
  return apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: { email }
  });
}

export function resetPassword(token, newPassword) {
  return apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: { token, newPassword }
  });
}
