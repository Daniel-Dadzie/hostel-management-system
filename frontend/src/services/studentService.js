import { apiRequest, getAuthHeaders } from './api.js';

export function getStudentProfile() {
  return apiRequest('/api/student/profile', {
    headers: getAuthHeaders()
  });
}

export function updateStudentProfile(payload) {
  return apiRequest('/api/student/profile', {
    method: 'PUT',
    body: payload,
    headers: getAuthHeaders()
  });
}

export function applyForHostel(payload) {
  return apiRequest('/api/student/apply', {
    method: 'POST',
    body: payload,
    headers: getAuthHeaders()
  });
}

export function getMyBooking() {
  return apiRequest('/api/student/booking', {
    headers: getAuthHeaders()
  });
}
