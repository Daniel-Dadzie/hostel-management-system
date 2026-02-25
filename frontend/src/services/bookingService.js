import { apiRequest, getAuthHeaders } from './api.js';

export function listAdminBookings() {
  return apiRequest('/api/admin/bookings', {
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
