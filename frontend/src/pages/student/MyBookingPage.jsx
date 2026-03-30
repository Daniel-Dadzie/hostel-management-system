
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBooking } from '../../services/studentService.js';
import { toastService } from '../../hooks/useToast.js';
import PaymentCountdown from '../../components/student/PaymentCountdown.jsx';
import BookingProgressTimeline from '../../components/student/BookingProgressTimeline.jsx';
import { Card } from '../../ui/Card.jsx';
import { Text } from '../../ui/Text.jsx';

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
      <Card style={{ border: status.color ? `2px solid var(--tw-${status.color})` : undefined }}>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/50 dark:bg-black/20">
            <span className="text-3xl">{status.icon}</span>
          </div>
          <div>
            <Text as="h2" size="xl" weight="bold">{status.title}</Text>
            <Text size="base" style={{ opacity: 0.8 }}>{status.description}</Text>
          </div>
        </div>
      </Card>

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
        <Card style={{ marginTop: 24 }}>
          <Text as="h3" size="lg" weight="bold" style={{ marginBottom: 16, color: '#18181b' }}>Booking Details</Text>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-neutral-200 pb-3 dark:border-neutral-700">
              <Text size="sm" style={{ color: '#6b7280' }}>Booking ID</Text>
              <Text size="base" weight="medium">#{booking.id}</Text>
            </div>
            {booking.hostelName && (
              <div className="flex justify-between border-b border-neutral-200 pb-3 dark:border-neutral-700">
                <Text size="sm" style={{ color: '#6b7280' }}>Hostel</Text>
                <Text size="base" weight="medium">{booking.hostelName}</Text>
              </div>
            )}
            {booking.roomNumber && (
              <div className="flex justify-between border-b border-neutral-200 pb-3 dark:border-neutral-700">
                <Text size="sm" style={{ color: '#6b7280' }}>Room Number</Text>
                <Text size="base" weight="medium">{booking.roomNumber}</Text>
              </div>
            )}
            {booking.paymentDueAt && booking.status === 'PENDING_PAYMENT' && (
              <div className="flex justify-between border-b border-neutral-200 pb-3 dark:border-neutral-700">
                <Text size="sm" style={{ color: '#6b7280' }}>Payment Due</Text>
                <Text size="base" weight="medium" style={{ color: '#dc2626' }}>{new Date(booking.paymentDueAt).toLocaleString()}</Text>
              </div>
            )}
            <div className="flex justify-between">
              <Text size="sm" style={{ color: '#6b7280' }}>Status</Text>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${status.color}`}>
                {booking.status?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Payment Action */}
      {booking?.status === 'PENDING_PAYMENT' && (
        <Card style={{ marginTop: 24, background: 'var(--color-primary-50)', color: 'var(--color-primary-900)' }}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-700 text-white">
              <span className="text-xl">💳</span>
            </div>
            <div className="flex-1">
              <Text as="h3" size="lg" weight="bold" style={{ color: '#18181b' }}>Complete Payment</Text>
              <Text size="base" style={{ color: '#52525b' }}>Pay now to confirm your booking</Text>
            </div>
            <Link to="/student/payments" className="btn-primary">
              Pay Now
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
