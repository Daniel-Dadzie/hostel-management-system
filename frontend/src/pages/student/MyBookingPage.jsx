import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/client.js';

export default function MyBookingPage() {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBooking();
  }, []);

  async function loadBooking() {
    try {
      const data = await apiRequest('/api/student/booking', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hms.token')}` }
      });
      setBooking(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const statusConfig = {
    PENDING_PAYMENT: {
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      icon: '⏳',
      title: 'Pending Payment',
      description: 'Please complete your payment within 30 minutes to confirm your booking.'
    },
    APPROVED: {
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      icon: '✅',
      title: 'Approved',
      description: 'Your booking has been confirmed. Welcome to your new accommodation!'
    },
    REJECTED: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      icon: '❌',
      title: 'Rejected',
      description: 'Unfortunately, no rooms were available matching your preferences.'
    },
    EXPIRED: {
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      icon: '⌛',
      title: 'Expired',
      description: 'Your booking expired due to non-payment. You can apply again.'
    },
    CANCELLED: {
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      icon: '🚫',
      title: 'Cancelled',
      description: 'This booking has been cancelled.'
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <span className="text-3xl">📋</span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">No Active Booking</h2>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const status = statusConfig[booking?.status] || statusConfig.PENDING_PAYMENT;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-white">My Booking</h1>

      {/* Status Card */}
      <div className={`card ${status.color}`}>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/50 dark:bg-black/20">
            <span className="text-3xl">{status.icon}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">{status.title}</h2>
            <p className="text-sm opacity-80">{status.description}</p>
          </div>
        </div>
      </div>

      {/* Booking Details */}
      {booking && (
        <div className="mt-6 card">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">Booking Details</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between border-b border-neutral-200 pb-3 dark:border-neutral-700">
              <span className="text-neutral-500 dark:text-neutral-400">Booking ID</span>
              <span className="font-medium text-neutral-900 dark:text-white">#{booking.id}</span>
            </div>

            {booking.hostelName && (
              <div className="flex justify-between border-b border-neutral-200 pb-3 dark:border-neutral-700">
                <span className="text-neutral-500 dark:text-neutral-400">Hostel</span>
                <span className="font-medium text-neutral-900 dark:text-white">{booking.hostelName}</span>
              </div>
            )}

            {booking.roomNumber && (
              <div className="flex justify-between border-b border-neutral-200 pb-3 dark:border-neutral-700">
                <span className="text-neutral-500 dark:text-neutral-400">Room Number</span>
                <span className="font-medium text-neutral-900 dark:text-white">{booking.roomNumber}</span>
              </div>
            )}

            {booking.dueAt && booking.status === 'PENDING_PAYMENT' && (
              <div className="flex justify-between border-b border-neutral-200 pb-3 dark:border-neutral-700">
                <span className="text-neutral-500 dark:text-neutral-400">Payment Due</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {new Date(booking.dueAt).toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-neutral-400">Status</span>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${status.color}`}>
                {booking.status?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Action */}
      {booking?.status === 'PENDING_PAYMENT' && (
        <div className="mt-6 card bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
              <span className="text-xl">💳</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-neutral-900 dark:text-white">Complete Payment</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Pay now to confirm your booking
              </p>
            </div>
            <button className="btn-primary">
              Pay Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
