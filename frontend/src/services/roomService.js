import { apiRequest, getAuthHeaders } from './api.js';

export function listRooms() {
  return apiRequest('/api/admin/rooms', {
    headers: getAuthHeaders()
  });
}

export function createRoom(payload) {
  return apiRequest('/api/admin/rooms', {
    method: 'POST',
    body: payload,
    headers: getAuthHeaders()
  });
}

export function updateRoom(id, payload) {
  return apiRequest(`/api/admin/rooms/${id}`, {
    method: 'PUT',
    body: payload,
    headers: getAuthHeaders()
  });
}
