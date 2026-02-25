import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBooking } from '../../services/studentService.js';

function getPaymentBadgeClass(status) {
  if (status === 'PENDING_PAYMENT') return 'badge-pending';
  if (status === 'APPROVED') return 'badge-approved';
  return 'badge-rejected';
}

function renderPaymentHistoryRow(booking) {
  if (!booking) {
    return (
      <tr>
        <td className="px-3 py-3 text-neutral-500 dark:text-neutral-400" colSpan={3}>
          No payment records yet.
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-neutral-100 dark:border-neutral-800">
      <td className="px-3 py-2">#{booking.id}</td>
      <td className="px-3 py-2">{booking.hostelName || '-'} / {booking.roomNumber || '-'}</td>
      <td className="px-3 py-2">{booking.status.replace('_', ' ')}</td>
    </tr>
  );
}

export default function MyPaymentsPage() {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPaymentContext();
  }, []);

  async function loadPaymentContext() {
    try {
      const data = await getMyBooking();
      setBooking(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const paymentSummary = useMemo(() => {
    if (!booking) {
      return {
        status: 'NOT_CREATED',
        amount: 'N/A',
        reference: 'No active booking'
      };
    }

    return {
      status: booking.status,
      amount: 'Calculated from allocated room',
      reference: `Booking #${booking.id}`
    };
  }, [booking]);

  const paymentBadgeClass = getPaymentBadgeClass(paymentSummary.status);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="page-title text-neutral-900 dark:text-white">My Payments</h1>
        <p className="section-subtitle">
          Track payment status linked to your booking lifecycle.
        </p>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="card-header text-neutral-900 dark:text-white">Latest Payment</h2>
          <span className={paymentBadgeClass}>{paymentSummary.status.replace('_', ' ')}</span>
        </div>
        <div className="body-text mt-4 space-y-2 text-neutral-600 dark:text-neutral-300">
          <p>Amount: {paymentSummary.amount}</p>
          <p>Reference: {paymentSummary.reference}</p>
          {booking?.paymentDueAt && (
            <p>Due At: {new Date(booking.paymentDueAt).toLocaleString()}</p>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/student/booking" className="btn-primary">
            Go to Booking
          </Link>
          <Link to="/student/apply" className="btn-ghost">
            New Application
          </Link>
        </div>
      </div>

      <div className="card">
        <h2 className="card-header text-neutral-900 dark:text-white">Payment History</h2>
        <p className="section-subtitle mt-2 dark:text-neutral-300">
          History is currently derived from your most recent booking record.
        </p>
        <div className="mt-4 md:hidden">
          {booking ? (
            <div className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
              <p className="font-medium text-neutral-900 dark:text-white">#{booking.id}</p>
              <p className="body-text text-neutral-600 dark:text-neutral-300">{booking.hostelName || '-'} / {booking.roomNumber || '-'}</p>
              <p className="body-text text-neutral-600 dark:text-neutral-300">{booking.status.replace('_', ' ')}</p>
            </div>
          ) : (
            <div className="rounded-lg border border-neutral-200 p-3 section-subtitle dark:border-neutral-800">
              No payment records yet.
            </div>
          )}
        </div>
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Booking</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Hostel/Room</th>
                <th className="px-3 py-2 text-left font-semibold text-neutral-800 dark:text-neutral-100">Status</th>
              </tr>
            </thead>
            <tbody>
              {renderPaymentHistoryRow(booking)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
