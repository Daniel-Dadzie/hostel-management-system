import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBed,
  FaBuilding,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaTools,
  FaWrench
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext.jsx';
import { getMyBooking } from '../../services/studentService.js';
import { toastService } from '../../hooks/useToast.js';
import PaymentCountdown from '../../components/student/PaymentCountdown.jsx';
import BookingProgressTimeline from '../../components/student/BookingProgressTimeline.jsx';

const SAMPLE_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Scheduled Power Maintenance',
    date: '5 Mar 2026',
    preview:
      'Power will be interrupted on Saturday 7 March from 8 AM – 2 PM for routine grid maintenance. Plan accordingly.'
  },
  {
    id: 2,
    title: 'End-of-Semester Checkout Procedures',
    date: '1 Mar 2026',
    preview:
      'All students must complete the checkout form and return room keys by the last Friday of the semester.'
  },
  {
    id: 3,
    title: 'Water Supply Notice – Block A & B',
    date: '28 Feb 2026',
    preview:
      'Water supply will be restricted on Tuesday 3 March from 6 AM – 12 PM while plumbing repairs are underway.'
  }
];

function StatusBadge({ booking, loading }) {
  if (loading) {
    return (
      <span className="inline-flex h-7 w-28 animate-pulse items-center rounded-full bg-white/20" />
    );
  }
  if (!booking) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Unallocated
      </span>
    );
  }
  if (booking.status === 'APPROVED') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
        Allocated
      </span>
    );
  }
  if (booking.status === 'PENDING_PAYMENT') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-sm font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
        Pending Payment
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-sm font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
      <span className="h-2 w-2 rounded-full bg-neutral-400" />
      {booking.status.replace('_', ' ')}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return null;
  }
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState(null);
  const firstName = user?.fullName?.trim()?.split(/\s+/)?.[0] ?? 'Student';
  const isAllocated = booking?.status === 'APPROVED';
  const isPendingPayment = booking?.status === 'PENDING_PAYMENT';

  useEffect(() => {
    let pollingInterval;
    let previousStatus = null;

    // Initial fetch
    (async () => {
      try {
        const data = await getMyBooking();
        setBooking(data);
        previousStatus = data?.status;
      } catch (err) {
        if (!err.message?.includes('No booking')) setError(err.message ?? 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();

    // Set up polling every 30 seconds to check for booking status changes
    pollingInterval = setInterval(async () => {
      try {
        const data = await getMyBooking();
        
        // Check if status changed and notify user
        if (previousStatus && previousStatus !== data?.status) {
          if (data?.status === 'APPROVED') {
            toastService.success('🎉 Your booking has been approved! Your room is confirmed.');
          } else if (data?.status === 'REJECTED') {
            toastService.error('❌ Your booking was rejected. Please try applying again.');
          } else if (data?.status === 'EXPIRED') {
            toastService.error('⏰ Your booking has expired. Please apply again.');
          } else if (data?.status === 'CANCELLED') {
            toastService.error('🚫 Your booking has been cancelled.');
          }
        }
        
        setBooking(data);
        previousStatus = data?.status;
      } catch (err) {
        // Silently ignore errors during polling - don't show toast for background updates
        console.debug('Polling error (non-blocking):', err.message);
      }
    }, 30000); // Poll every 30 seconds

    // Clean up polling interval on unmount
    return () => clearInterval(pollingInterval);
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── 1. Welcome & Status Header ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-700 to-emerald-700 p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-8 right-20 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mb-0.5 text-sm font-medium text-primary-100">Student Portal</p>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome back, {firstName}!
            </h1>
            <p className="mt-1 text-sm text-primary-100 opacity-80">{user?.email}</p>
          </div>
          <StatusBadge booking={booking} loading={loading} />
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* ── Two-column layout ── */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* ── Left (wide) column ── */}
        <div className="space-y-5 lg:col-span-2">
          {/* ── 2. Current Allocation Card ── */}
          <section className="card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-white">
                <FaBed className="text-primary-600 dark:text-primary-400" />
                Current Allocation
              </h2>
              {isAllocated && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Active
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-10 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                ))}
              </div>
            ) : isAllocated ? (
              <div className="grid gap-3 rounded-xl bg-emerald-50/60 p-4 dark:bg-emerald-900/10 sm:grid-cols-2">
                <Detail label="Hostel" value={booking.hostelName} />
                <Detail label="Room" value={booking.roomNumber} />
                <Detail label="Booking Ref" value={`#${booking.id}`} />
                {booking.paymentDueAt && (
                  <Detail
                    label="Payment Due"
                    value={formatDate(booking.paymentDueAt)}
                    valueClass="text-yellow-700 dark:text-yellow-400"
                  />
                )}
                {booking.bookingAcademicYear && (
                  <Detail 
                    label="Academic Year" 
                    value={booking.bookingAcademicYear}
                  />
                )}
                {booking.bookingAcademicSession && (
                  <Detail 
                    label="Semester" 
                    value={booking.bookingAcademicSession}
                  />
                )}
              </div>
            ) : isPendingPayment ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-yellow-200 bg-yellow-50/60 p-4 dark:border-yellow-800/30 dark:bg-yellow-900/10">
                  <div className="flex items-start gap-3">
                    <FaExclamationTriangle className="mt-0.5 shrink-0 text-yellow-500" />
                    <div>
                      <p className="font-semibold text-yellow-800 dark:text-yellow-300">Payment Required</p>
                      <p className="mt-0.5 text-sm text-yellow-700 dark:text-yellow-400">
                        Your booking for{' '}
                        <strong>{booking.hostelName}</strong> — Room{' '}
                        <strong>{booking.roomNumber}</strong> is awaiting payment.
                        {booking.paymentDueAt && ` Due by ${formatDate(booking.paymentDueAt)}.`}
                      </p>
                      <Link to="/student/payments" className="btn-primary mt-3 inline-block text-sm">
                        Pay Now
                      </Link>
                    </div>
                  </div>
                </div>

                {booking?.paymentDueAt && (
                  <PaymentCountdown 
                    dueDate={booking.paymentDueAt}
                    onWarning={() => {
                      toastService.error('⏰ Payment deadline in 5 minutes! Complete payment now to secure your room.');
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                  <FaBuilding className="text-2xl text-neutral-400" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                    No room assigned yet
                  </p>
                  <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                    Browse available hostels and apply for a room that suits you.
                  </p>
                </div>
                <Link to="/student/hostels" className="btn-primary text-sm">
                  Book Accommodation
                </Link>
              </div>
            )}
          </section>

          {/* ── 2.5. Booking Progress Timeline ── */}
          {booking && !loading && (
            <BookingProgressTimeline booking={booking} />
          )}

          {/* ── 3. Financial Summary Card ── */}
          <section className="card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-white">
                <FaCalendarAlt className="text-primary-600 dark:text-primary-400" />
                Financial Summary
              </h2>
              <Link
                to="/student/payments"
                className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
              >
                View History →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-10 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800" />
                ))}
              </div>
            ) : booking ? (
              <div className="space-y-2">
                <FinanceRow
                  label="Payment Status"
                  right={
                    booking.status === 'APPROVED' ? (
                      <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        <FaCheckCircle /> Confirmed
                      </span>
                    ) : booking.status === 'PENDING_PAYMENT' ? (
                      <span className="flex items-center gap-1.5 text-sm font-bold text-yellow-600 dark:text-yellow-400">
                        <FaClock /> Awaiting Payment
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-neutral-500">
                        {booking.status.replace('_', ' ')}
                      </span>
                    )
                  }
                />
                {booking.paymentDueAt && (
                  <FinanceRow
                    label="Due Date"
                    right={
                      <span
                        className={`text-sm font-bold ${
                          new Date(booking.paymentDueAt) < new Date()
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-neutral-800 dark:text-neutral-200'
                        }`}
                      >
                        {formatDate(booking.paymentDueAt)}
                      </span>
                    }
                  />
                )}
                <FinanceRow
                  label="Booking Ref"
                  right={
                    <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                      #{booking.id}
                    </span>
                  }
                />
                {isPendingPayment && (
                  <Link
                    to="/student/payments"
                    className="btn-primary mt-2 block w-full text-center text-sm"
                  >
                    Pay Now
                  </Link>
                )}
              </div>
            ) : (
              <p className="py-5 text-center text-sm text-neutral-500 dark:text-neutral-400">
                No financial records yet. Apply for a room to get started.
              </p>
            )}
          </section>

          {/* ── 5. Maintenance Tickets ── */}
          <section className="card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-white">
                <FaWrench className="text-primary-600 dark:text-primary-400" />
                Maintenance Tickets
              </h2>
              <Link
                to="/student/complaints"
                className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
              >
                + Report Issue
              </Link>
            </div>
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                <FaTools className="text-xl text-neutral-400" />
              </div>
              <div>
                <p className="font-semibold text-neutral-700 dark:text-neutral-300">No open tickets</p>
                <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                  All maintenance requests will appear here once submitted.
                </p>
              </div>
              <Link
                to="/student/complaints"
                className="mt-1 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Report New Issue
              </Link>
            </div>
          </section>
        </div>

        {/* ── Right (narrow) column ── */}
        <div className="space-y-5">
          {/* ── Quick Navigation ── */}
          <section className="card !p-3">
            <p className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Quick Links
            </p>
            <nav className="space-y-0.5">
              {[
                { to: '/student/hostels', icon: '🏨', label: 'Browse Hostels' },
                { to: '/student/booking', icon: '📋', label: 'My Booking' },
                { to: '/student/payments', icon: '💳', label: 'Payment History' },
                { to: '/student/complaints', icon: '🔧', label: 'Maintenance / Complaints' },
                { to: '/student/preferences', icon: '⚙️', label: 'Room Preferences' },
                { to: '/student/profile', icon: '👤', label: 'Profile Settings' }
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-primary-50 hover:text-primary-700 dark:text-neutral-400 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </section>

          {/* ── 4. Announcements ── */}
          <section className="card">
            <h2 className="mb-4 text-base font-bold text-neutral-900 dark:text-white">
              📢 Announcements
            </h2>
            <div className="space-y-3">
              {SAMPLE_ANNOUNCEMENTS.map((a) => {
                const isExpanded = expandedAnnouncementId === a.id;
                return (
                <div
                  key={a.id}
                  className="rounded-xl border border-neutral-100 p-3 transition-colors hover:border-primary-200 hover:bg-primary-50/40 dark:border-neutral-800 dark:hover:border-primary-800/40 dark:hover:bg-primary-900/10"
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{a.title}</p>
                    <span className="shrink-0 text-[11px] text-neutral-400 dark:text-neutral-500">
                      {a.date}
                    </span>
                  </div>
                  <p className={`${isExpanded ? '' : 'line-clamp-2'} text-xs text-neutral-500 dark:text-neutral-400`}>
                    {a.preview}
                  </p>
                  <button
                    type="button"
                    className="mt-1.5 text-[11px] font-medium text-primary-600 hover:underline dark:text-primary-400"
                    onClick={() => setExpandedAnnouncementId(isExpanded ? null : a.id)}
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ── Small helper components ── */
function Detail({ label, value, valueClass = '' }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {label}
      </p>
      <p className={`mt-0.5 text-sm font-bold text-neutral-900 dark:text-white ${valueClass}`}>
        {value ?? '—'}
      </p>
    </div>
  );
}

function FinanceRow({ label, right }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800/60">
      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">{label}</span>
      {right}
    </div>
  );
}
