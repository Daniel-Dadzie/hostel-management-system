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
