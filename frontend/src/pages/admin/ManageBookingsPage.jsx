import { useEffect, useState } from 'react';
import { listAdminBookings, updateAdminBookingStatus } from '../../services/bookingService.js';

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [hostelFilter, setHostelFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const data = await listAdminBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(bookingId, status) {
    setProcessing(bookingId);
    setError('');

    try {
      await updateAdminBookingStatus(bookingId, status);
      loadBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(null);
    }
  }

  const statusConfig = {
    PENDING_PAYMENT: { color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pending Payment' },
    APPROVED: { color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400', label: 'Approved' },
    REJECTED: { color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', label: 'Rejected' },
    EXPIRED: { color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', label: 'Expired' },
    CANCELLED: { color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400', label: 'Cancelled' }
  };

  const filteredBookings = bookings
    .filter((item) => (statusFilter === 'ALL' ? true : item.status === statusFilter))
    .filter((item) => (hostelFilter === 'ALL' ? true : item.hostelName === hostelFilter))
    .filter((item) => {
      const query = search.trim().toLowerCase();
      if (!query) return true;
      return (
        item.studentName?.toLowerCase().includes(query) ||
        item.studentEmail?.toLowerCase().includes(query) ||
        item.roomNumber?.toLowerCase().includes(query)
      );
    });

  const hostelOptions = Array.from(new Set(bookings.map((item) => item.hostelName).filter(Boolean)));

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
        <h1 className="page-title text-neutral-900 dark:text-white">Manage Bookings</h1>
        <p className="section-subtitle">
          Filter and process booking approvals with payment context
        </p>
      </div>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {bookings.length > 0 && (
        <div className="card">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <select className="input-field" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">Status: All</option>
              {Object.keys(statusConfig).map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>

            <select className="input-field" value={hostelFilter} onChange={(e) => setHostelFilter(e.target.value)}>
              <option value="ALL">Hostel: All</option>
              {hostelOptions.map((hostel) => (
                <option key={hostel} value={hostel}>
                  {hostel}
                </option>
              ))}
            </select>

            <input
              className="input-field lg:col-span-2"
              placeholder="Search by student, email, or room"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {filteredBookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="empty-state-title">No Bookings Yet</h3>
          <p className="section-subtitle">
            Bookings will appear here when students apply for hostels.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 md:hidden">
            {filteredBookings.map((booking) => {
              const status = statusConfig[booking.status] || statusConfig.PENDING_PAYMENT;
              return (
                <div key={booking.id} className="card space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-neutral-900 dark:text-white">#{booking.id}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{booking.studentName}</p>
                    <p className="body-text text-neutral-500 dark:text-neutral-400">{booking.studentEmail}</p>
                  </div>
                  <p className="body-text text-neutral-600 dark:text-neutral-300">
                    Room: {booking.roomNumber || 'No room'} {booking.hostelName ? `(${booking.hostelName})` : ''}
                  </p>
                  <div className="body-text space-y-0.5 text-neutral-500 dark:text-neutral-300">
                    <p>Payment: {booking.paymentStatus || 'N/A'}</p>
                    {booking.paymentDueAt && <p>Due: {new Date(booking.paymentDueAt).toLocaleString()}</p>}
                  </div>
                  {booking.status === 'PENDING_PAYMENT' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(booking.id, 'APPROVED')}
                        disabled={processing === booking.id}
                        className="rounded bg-green-500 px-2 py-1 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(booking.id, 'REJECTED')}
                        disabled={processing === booking.id}
                        className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="body-text text-neutral-400">No actions</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="card hidden overflow-x-auto md:block">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">ID</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Student</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Room</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Status</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Payment</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {filteredBookings.map((booking) => {
                const status = statusConfig[booking.status] || statusConfig.PENDING_PAYMENT;
                return (
                  <tr key={booking.id}>
                    <td className="px-4 py-3 font-medium">#{booking.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{booking.studentName}</p>
                        <p className="body-text text-neutral-500 dark:text-neutral-400">{booking.studentEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {booking.roomNumber ? (
                        <div>
                          <p className="font-medium">{booking.roomNumber}</p>
                          <p className="body-text text-neutral-500 dark:text-neutral-400">{booking.hostelName}</p>
                        </div>
                      ) : (
                        <span className="text-neutral-400">No room</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="body-text space-y-0.5 text-neutral-500 dark:text-neutral-300">
                        <p>Status: {booking.paymentStatus || 'N/A'}</p>
                        {booking.paymentDueAt && <p>Due: {new Date(booking.paymentDueAt).toLocaleString()}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {booking.status === 'PENDING_PAYMENT' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(booking.id, 'APPROVED')}
                            disabled={processing === booking.id}
                            className="rounded bg-green-500 px-2 py-1 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateStatus(booking.id, 'REJECTED')}
                            disabled={processing === booking.id}
                            className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {booking.status !== 'PENDING_PAYMENT' && (
                        <span className="body-text text-neutral-400">No actions</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
