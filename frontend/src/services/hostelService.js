import { apiRequest, getAuthHeaders } from './api.js';

export function listHostels() {
  return apiRequest('/api/admin/hostels', {
    headers: getAuthHeaders()
  });
}

export function createHostel(payload) {
  return apiRequest('/api/admin/hostels', {
    method: 'POST',
    body: payload,
    headers: getAuthHeaders()
  });
}

export function updateHostel(id, payload) {
  return apiRequest(`/api/admin/hostels/${id}`, {
    method: 'PUT',
    body: payload,
    headers: getAuthHeaders()
  });
}
