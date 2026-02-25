import { useEffect, useState } from 'react';
import {
  cancelPaymentByBooking,
  confirmPaymentByBooking,
  listPaymentRecords
} from '../../services/paymentService.js';

export default function ManagePaymentsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    try {
      const data = await listPaymentRecords();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(bookingId, status) {
    setProcessing(bookingId);
    setError('');
    try {
      if (status === 'APPROVED') {
        await confirmPaymentByBooking(bookingId);
      } else {
        await cancelPaymentByBooking(bookingId);
      }
      await loadPayments();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  }

  const filteredRows = bookings.filter((item) =>
    statusFilter === 'ALL' ? true : (item.paymentStatus || 'N/A') === statusFilter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title text-neutral-900 dark:text-white">Manage Payments</h1>
        <p className="section-subtitle">
          Review payment states tied to active bookings.
        </p>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      <div className="card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="card-header text-neutral-900 dark:text-white">Payment Records</h2>
          <select className="input-field sm:max-w-xs" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Payment Status: All</option>
            <option value="PENDING">PENDING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div className="mt-4 space-y-3 md:hidden">
          {filteredRows.map((row) => (
            <div key={row.id} className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
              <p className="font-medium text-neutral-900 dark:text-white">Booking #{row.id}</p>
              <p className="body-text text-neutral-500 dark:text-neutral-400">{row.studentName} · {row.studentEmail}</p>
              <p className="body-text mt-2 text-neutral-600 dark:text-neutral-300">Status: {row.paymentStatus || 'N/A'}</p>
              <p className="body-text text-neutral-600 dark:text-neutral-300">Amount: {row.paymentAmount ?? 'N/A'}</p>
              <p className="body-text text-neutral-600 dark:text-neutral-300">
                Due: {row.paymentDueAt ? new Date(row.paymentDueAt).toLocaleString() : '-'}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  className="rounded bg-primary-700 px-2 py-1 text-xs font-medium text-white hover:bg-primary-800 disabled:opacity-50"
                  onClick={() => updateBookingStatus(row.id, 'APPROVED')}
                  disabled={processing === row.id || row.status === 'APPROVED'}
                >
                  Confirm
                </button>
                <button
                  className="rounded bg-accent-600 px-2 py-1 text-xs font-medium text-white hover:bg-accent-700 disabled:opacity-50"
                  onClick={() => updateBookingStatus(row.id, 'CANCELLED')}
                  disabled={processing === row.id || row.status === 'CANCELLED'}
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
          {filteredRows.length === 0 && (
            <div className="rounded-lg border border-neutral-200 p-3 section-subtitle dark:border-neutral-800">
              No payment records available.
            </div>
          )}
        </div>

        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Booking</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Student</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Payment</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Due</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-b border-neutral-100 dark:border-neutral-800">
                  <td className="px-3 py-2">#{row.id}</td>
                  <td className="px-3 py-2">
                    <div className="space-y-0.5">
                      <p className="font-medium text-neutral-900 dark:text-white">{row.studentName}</p>
                      <p className="body-text text-neutral-500 dark:text-neutral-400">{row.studentEmail}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="space-y-0.5 text-neutral-600 dark:text-neutral-300">
                      <p>Status: {row.paymentStatus || 'N/A'}</p>
                      <p>Amount: {row.paymentAmount ?? 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-neutral-600 dark:text-neutral-300">
                    {row.paymentDueAt ? new Date(row.paymentDueAt).toLocaleString() : '-'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        className="rounded bg-primary-700 px-2 py-1 text-xs font-medium text-white hover:bg-primary-800 disabled:opacity-50"
                        onClick={() => updateBookingStatus(row.id, 'APPROVED')}
                        disabled={processing === row.id || row.status === 'APPROVED'}
                      >
                        Confirm
                      </button>
                      <button
                        className="rounded bg-accent-600 px-2 py-1 text-xs font-medium text-white hover:bg-accent-700 disabled:opacity-50"
                        onClick={() => updateBookingStatus(row.id, 'CANCELLED')}
                        disabled={processing === row.id || row.status === 'CANCELLED'}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td className="px-3 py-3 text-neutral-500 dark:text-neutral-400" colSpan={5}>
                    No payment records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
