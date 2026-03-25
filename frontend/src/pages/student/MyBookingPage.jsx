import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBooking } from '../../services/studentService.js';
import { toastService } from '../../hooks/useToast.js';
import PaymentCountdown from '../../components/student/PaymentCountdown.jsx';
import BookingProgressTimeline from '../../components/student/BookingProgressTimeline.jsx';

export default function MyBookingPage() {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let pollingInterval;
    let previousStatus = null;

    // Initial load
    const initializeBooking = async () => {
      const initialBooking = await loadBooking();
      previousStatus = initialBooking?.status ?? null;
    };
    void initializeBooking();

    // Set up polling to check for status updates every 30 seconds
    pollingInterval = setInterval(async () => {
      try {
        const data = await getMyBooking();
        
        // Notify if status changed
        if (previousStatus && previousStatus !== data?.status) {
          if (data?.status === 'APPROVED') {
            toastService.success('✅ Payment approved! Your booking is confirmed.');
          } else if (data?.status === 'REJECTED') {
            toastService.error('❌ Your booking was rejected.');
          } else if (data?.status === 'EXPIRED') {
            toastService.error('⏰ Your booking expired. Please apply again.');
          }
        }
        
        setBooking(data);
        previousStatus = data?.status;
      } catch (err) {
        console.debug('Polling error:', err.message);
      }
    }, 30000); // Poll every 30 seconds

    // Cleanup
    return () => clearInterval(pollingInterval);
  }, []);

  async function loadBooking() {
    try {
      const data = await getMyBooking();
      setBooking(data);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
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
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="empty-state">
          <div className="empty-state-icon">
            <span className="text-3xl">📋</span>
          </div>
          <h2 className="empty-state-title">No Active Booking</h2>
          <p className="section-subtitle mt-2">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const status = statusConfig[booking?.status] || statusConfig.PENDING_PAYMENT;

  const handleCountdownWarning = () => {
    toastService.error('⏰ Payment deadline in 5 minutes! Complete payment now to secure your room.');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="page-title mb-6 text-neutral-900 dark:text-white">My Booking</h1>

      {/* Status Card */}
      <div className={`card ${status.color}`}>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/50 dark:bg-black/20">
            <span className="text-3xl">{status.icon}</span>
          </div>
          <div>
            <h2 className="card-header">{status.title}</h2>
            <p className="body-text opacity-80">{status.description}</p>
          </div>
        </div>
      </div>

      {/* Payment Countdown Timer */}
      {booking?.status === 'PENDING_PAYMENT' && booking?.paymentDueAt && (
        <div className="mt-6">
          <PaymentCountdown 
            dueDate={booking.paymentDueAt}
            onWarning={handleCountdownWarning}
          />
        </div>
      )}

      {/* Booking Progress Timeline */}
      {booking && (
        <div className="mt-6">
          <BookingProgressTimeline booking={booking} />
        </div>
      )}

      {/* Booking Details */}
      {booking && (
        <div className="mt-6 card">
          <h3 className="card-header mb-4 text-neutral-900 dark:text-white">Booking Details</h3>
          
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

            {booking.paymentDueAt && booking.status === 'PENDING_PAYMENT' && (
              <div className="flex justify-between border-b border-neutral-200 pb-3 dark:border-neutral-700">
                <span className="text-neutral-500 dark:text-neutral-400">Payment Due</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {new Date(booking.paymentDueAt).toLocaleString()}
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
        <div className="mt-6 card bg-primary-50 dark:bg-primary-900/20">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-700 text-white">
              <span className="text-xl">💳</span>
            </div>
            <div className="flex-1">
              <h3 className="card-header text-neutral-900 dark:text-white">Complete Payment</h3>
              <p className="body-text text-neutral-600 dark:text-neutral-400">
                Pay now to confirm your booking
              </p>
            </div>
            <Link to="/student/payments" className="btn-primary">
              Pay Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
