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

/**
 * Downloads the allocation letter PDF for a booking
 * @param {number} bookingId - The booking ID
 */
export async function downloadAllocationLetter(bookingId) {
  const token = getAuthHeaders()['Authorization'];
  const response = await fetch(`/api/student/payments/${bookingId}/allocation-letter`, {
    method: 'GET',
    headers: {
      'Authorization': token
    }
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to download allocation letter');
    }
    throw new Error('Failed to download allocation letter');
  }

  // Get the blob and trigger download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `allocation-letter-${bookingId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

/**
 * Downloads the payment receipt PDF for a booking
 * @param {number} bookingId - The booking ID
 */
export async function downloadPaymentReceipt(bookingId) {
  const token = getAuthHeaders()['Authorization'];
  const response = await fetch(`/api/student/payments/${bookingId}/receipt`, {
    method: 'GET',
    headers: {
      'Authorization': token
    }
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to download payment receipt');
    }
    throw new Error('Failed to download payment receipt');
  }

  // Get the blob and trigger download
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `payment-receipt-${bookingId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
