import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getMyBooking } from '../../services/studentService.js';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const firstName = user?.fullName?.trim()?.split(/\s+/)?.[0] || 'Student';

  useEffect(() => {
    loadBooking();
  }, []);

  async function loadBooking() {
    try {
      const data = await getMyBooking();
      setBooking(data);
    } catch (err) {
      // No booking found is okay for dashboard
      if (!err.message.includes('No booking')) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  const statusColors = {
    PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
  };

  function renderBookingStatus() {
    if (loading) {
      return <p className="card-header">Loading...</p>;
    }

    if (booking) {
      return (
        <span className={`inline-block rounded-full px-2 py-0.5 text-sm font-medium ${statusColors[booking.status]}`}>
          {booking.status?.replace('_', ' ')}
        </span>
      );
    }

    return <p className="card-header text-neutral-400">No Active Booking</p>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <h1 className="page-title text-neutral-900 dark:text-white">
          Welcome, {firstName}!
        </h1>
        <p className="section-subtitle mt-2">
          Manage your hostel accommodation from this dashboard.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-100 dark:bg-accent-900/30">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <p className="card-header text-neutral-700 dark:text-neutral-300">Booking Status</p>
              {renderBookingStatus()}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <span className="text-2xl">🏠</span>
            </div>
            <div>
              <p className="card-header text-neutral-700 dark:text-neutral-300">Room</p>
              {booking?.roomNumber ? (
                <p className="card-header text-neutral-900 dark:text-white">
                  {booking.hostelName} - {booking.roomNumber}
                </p>
              ) : (
                <p className="card-header text-neutral-400">Not Allocated</p>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-100 dark:bg-accent-900/30">
              <span className="text-2xl">👤</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="card-header text-neutral-700 dark:text-neutral-300">Profile</p>
              <p className="body-text mt-1 rounded-md bg-primary-100 px-2.5 py-1.5 font-semibold text-neutral-900 break-all dark:bg-primary-900/30 dark:text-white">
                {user?.email || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        {!booking && (
          <Link to="/student/apply" className="card hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-700 text-white">
                <span className="text-2xl">🏠</span>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 dark:text-white">Apply for Hostel</h3>
                <p className="body-text text-neutral-500 dark:text-neutral-400">
                  Submit your hostel application
                </p>
              </div>
            </div>
          </Link>
        )}

        <Link to="/student/booking" className="card hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-600 text-white">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">View Booking</h3>
              <p className="body-text text-neutral-500 dark:text-neutral-400">
                Check your booking status
              </p>
            </div>
          </div>
        </Link>

        <Link to="/student/profile" className="card hover:border-primary-300 dark:hover:border-primary-600 transition-colors">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-600 text-white">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-white">My Profile</h3>
              <p className="body-text text-neutral-500 dark:text-neutral-400">
                Update your personal information
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
