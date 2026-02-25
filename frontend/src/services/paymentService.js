import { listAdminBookings, updateAdminBookingStatus } from './bookingService.js';

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
