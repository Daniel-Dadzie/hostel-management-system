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

export function submitPaymentReceipt({ bookingId, paymentMethod, transactionReference, receipt }) {
  const formData = new FormData();
  formData.append('bookingId', String(bookingId));
  formData.append('paymentMethod', paymentMethod);
  formData.append('transactionReference', transactionReference);
  formData.append('receipt', receipt);

  return apiRequest('/api/student/payments/submit', {
    method: 'POST',
    body: formData,
    headers: getAuthHeaders()
  });
}

export function initiateGatewayPayment({ bookingId, paymentMethod }) {
  return apiRequest('/api/student/payments/gateway/initiate', {
    method: 'POST',
    body: { bookingId, paymentMethod },
    headers: getAuthHeaders()
  });
}

export function verifyGatewayPayment({ bookingId }) {
  return apiRequest('/api/student/payments/gateway/verify', {
    method: 'POST',
    body: { bookingId },
    headers: getAuthHeaders()
  });
}
