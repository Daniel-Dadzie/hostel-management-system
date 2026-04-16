import { apiRequest, getAuthHeaders } from './api.js';

export function listHostels() {
  return apiRequest('/api/admin/hostels', {
    headers: getAuthHeaders()
  });
}

export function listHostelsPaginated(active = null, pageNumber = 0, pageSize = 20) {
  const params = new URLSearchParams();
  if (active !== null && active !== undefined) {
    params.append('active', active);
  }
  params.append('page', pageNumber);
  params.append('size', pageSize);
  
  const queryString = params.toString();
  return apiRequest(`/api/admin/hostels/paginated${queryString ? '?' + queryString : ''}`, {
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

export function listStudentHostels() {
  return apiRequest('/api/student/hostels', {
    headers: getAuthHeaders()
  });
}

export function listStudentHostelRooms(hostelId) {
  return apiRequest(`/api/student/hostels/${hostelId}/rooms`, {
    headers: getAuthHeaders()
  });
}
