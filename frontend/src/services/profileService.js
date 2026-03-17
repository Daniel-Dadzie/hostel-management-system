import { apiRequest, getAuthHeaders } from './api.js';

export function getMyProfile() {
  return apiRequest('/api/profile', {
    headers: getAuthHeaders()
  });
}

export function updateMyProfile(payload) {
  return apiRequest('/api/profile', {
    method: 'PUT',
    body: payload,
    headers: getAuthHeaders()
  });
}
