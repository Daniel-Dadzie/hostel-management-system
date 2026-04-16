import { apiRequest, getAuthHeaders } from './api.js';

export function listAdminBookings() {
  return apiRequest('/api/admin/bookings', {
    headers: getAuthHeaders()
  });
}

export function listAdminBookingsPaginated(status = null, pageNumber = 0, pageSize = 20) {
  const params = new URLSearchParams();
  if (status) {
    params.append('status', status);
  }
  params.append('page', pageNumber);
  params.append('size', pageSize);
  
  const queryString = params.toString();
  return apiRequest(`/api/admin/bookings/paginated${queryString ? '?' + queryString : ''}`, {
    headers: getAuthHeaders()
  });
}

export function updateAdminBookingStatus(bookingId, status) {
  return apiRequest(`/api/admin/bookings/${bookingId}/status`, {
    method: 'PATCH',
    body: { status },
    headers: getAuthHeaders()
  });
}

export function getRolloverContext() {
  return apiRequest('/api/admin/rollover/context', {
    headers: getAuthHeaders()
  });
}

export function listRolloverStudents() {
  return apiRequest('/api/admin/rollover/students', {
    headers: getAuthHeaders()
  });
}

export function listAcademicTerms() {
  return apiRequest('/api/admin/rollover/terms', {
    headers: getAuthHeaders()
  });
}

export function createAcademicTerm(payload) {
  return apiRequest('/api/admin/rollover/terms', {
    method: 'POST',
    body: payload,
    headers: getAuthHeaders()
  });
}

export function updateAcademicTerm(termId, payload) {
  return apiRequest(`/api/admin/rollover/terms/${termId}`, {
    method: 'PUT',
    body: payload,
    headers: getAuthHeaders()
  });
}

export function activateAcademicTerm(termId) {
  return apiRequest(`/api/admin/rollover/terms/${termId}/activate`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
}

export function deleteAcademicTerm(termId) {
  return apiRequest(`/api/admin/rollover/terms/${termId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
}

export function runAnnualRollover() {
  return apiRequest('/api/admin/rollover/run', {
    method: 'POST',
    headers: getAuthHeaders()
  });
}

export function promoteStudent(studentId) {
  return apiRequest(`/api/admin/rollover/students/${studentId}/promote`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
}

export function retainStudent(studentId) {
  return apiRequest(`/api/admin/rollover/students/${studentId}/retain`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
}

export function checkoutStudent(studentId) {
  return apiRequest(`/api/admin/rollover/students/${studentId}/checkout`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
}

export function clearRetainStudent(studentId) {
  return apiRequest(`/api/admin/rollover/students/${studentId}/clear-retain`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
}

function postBulkAction(path, studentIds) {
  return apiRequest(path, {
    method: 'POST',
    body: { studentIds },
    headers: getAuthHeaders()
  });
}

export function bulkPromoteStudents(studentIds) {
  return postBulkAction('/api/admin/rollover/students/actions/promote', studentIds);
}

export function bulkRetainStudents(studentIds) {
  return postBulkAction('/api/admin/rollover/students/actions/retain', studentIds);
}

export function bulkClearRetainStudents(studentIds) {
  return postBulkAction('/api/admin/rollover/students/actions/clear-retain', studentIds);
}

export function bulkCheckoutStudents(studentIds) {
  return postBulkAction('/api/admin/rollover/students/actions/checkout', studentIds);
}
