import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client.js';

export default function ManageBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      const data = await apiRequest('/api/admin/bookings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hms.token')}` }
      });
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
      await apiRequest(`/api/admin/bookings/${bookingId}/status`, {
        method: 'PUT',
        body: { status },
        headers: { Authorization: `Bearer ${localStorage.getItem('hms.token')}` }
      });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Manage Bookings</h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          View and manage student bookings
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="card text-center py-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No Bookings Yet</h3>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            Bookings will appear here when students apply for hostels
          </p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 dark:border-neutral-700">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">ID</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Student</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Room</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Status</th>
                <th className="px-4 py-3 font-medium text-neutral-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              {bookings.map((booking) => {
                const status = statusConfig[booking.status] || statusConfig.PENDING_PAYMENT;
                return (
                  <tr key={booking.id}>
                    <td className="px-4 py-3 font-medium">#{booking.id}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-white">{booking.studentName}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{booking.studentEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {booking.roomNumber ? (
                        <div>
                          <p className="font-medium">{booking.roomNumber}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{booking.hostelName}</p>
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
                            onClick={() => updateStatus(booking.id, 'CANCELLED')}
                            disabled={processing === booking.id}
                            className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                      {booking.status !== 'PENDING_PAYMENT' && (
                        <span className="text-xs text-neutral-400">No actions</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
