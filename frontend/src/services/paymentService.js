import { listAdminBookings, updateAdminBookingStatus } from './bookingService.js';
import { API_BASE_URL } from '../api/client.js';
import { getAuthHeaders } from './api.js';

export async function listPaymentRecords() {
  const bookings = await listAdminBookings();
  return (bookings || []).filter((item) => item.paymentStatus || item.paymentAmount != null || item.paymentDueAt);
}

export function confirmPaymentByBooking(bookingId) {
  return updateAdminBookingStatus(bookingId, 'APPROVED');
}

export function cancelPaymentByBooking(bookingId) {
  return updateAdminBookingStatus(bookingId, 'CANCELLED');
}

export async function fetchPaymentReceiptBlob(bookingId, download = false) {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/bookings/${bookingId}/receipt${download ? '?download=true' : ''}`,
    {
      method: 'GET',
      headers: {
        ...getAuthHeaders()
      },
      credentials: 'include'
    }
  );

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const detail = payload?.message || payload?.error || `HTTP ${response.status}`;
    throw new Error(detail);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('content-disposition') || '';
  const filenameMatch = /filename="?([^";]+)"?/i.exec(disposition);

  return {
    blob,
    filename: filenameMatch?.[1] || `receipt-${bookingId}`
  };
}
