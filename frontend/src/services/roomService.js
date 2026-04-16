import { apiRequest, getAuthHeaders } from './api.js';

export function listRooms() {
  return apiRequest('/api/admin/rooms', {
    headers: getAuthHeaders()
  });
}

export function listRoomsPaginated(hostelId = null, pageNumber = 0, pageSize = 20) {
  const params = new URLSearchParams();
  if (hostelId !== null && hostelId !== undefined) {
    params.append('hostelId', hostelId);
  }
  params.append('page', pageNumber);
  params.append('size', pageSize);
  
  const queryString = params.toString();
  return apiRequest(`/api/admin/rooms/paginated${queryString ? '?' + queryString : ''}`, {
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
