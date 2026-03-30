import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBed, FaBuilding, FaCalendarAlt, FaCheckCircle,
  FaClock, FaExclamationTriangle, FaTools, FaWrench
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext.jsx';
import { getMyBooking } from '../../services/studentService.js';
import { toastService } from '../../hooks/useToast.js';
import PaymentCountdown from '../../components/student/PaymentCountdown.jsx';
import BookingProgressTimeline from '../../components/student/BookingProgressTimeline.jsx';

const SAMPLE_ANNOUNCEMENTS = [
  { id: 1, title: 'Scheduled Power Maintenance', date: '5 Mar 2026', preview: 'Power will be interrupted on Saturday 7 March from 8 AM – 2 PM for routine grid maintenance. Plan accordingly.' },
  { id: 2, title: 'End-of-Semester Checkout Procedures', date: '1 Mar 2026', preview: 'All students must complete the checkout form and return room keys by the last Friday of the semester.' },
  { id: 3, title: 'Water Supply Notice – Block A & B', date: '28 Feb 2026', preview: 'Water supply will be restricted on Tuesday 3 March from 6 AM – 12 PM while plumbing repairs are underway.' }
];

function StatusBadge({ booking, loading }) {
  if (loading) return <span className="inline-flex h-6 w-24 animate-pulse rounded-full bg-white/20 sm:h-7 sm:w-28" />;
  if (!booking) return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700 dark:bg-red-900/30 dark:text-red-400 sm:px-3 sm:py-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Unallocated
    </span>
  );
  if (booking.status === 'APPROVED') return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 sm:px-3 sm:py-1.5">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Allocated
    </span>
  );
  if (booking.status === 'PENDING_PAYMENT') return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 sm:px-3 sm:py-1.5">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-500" /> Pending Payment
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 sm:px-3 sm:py-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" /> {booking.status.replace('_', ' ')}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return null;
  try { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return null; }
}

function SectionCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-white/8 dark:bg-[#1c1f26] ${className}`}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, action }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3.5 dark:border-white/6 sm:px-5 sm:py-4">
      <div className="flex items-center gap-2 sm:gap-2.5">
        <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[#0f6b46]/10 text-[#0f6b46] dark:bg-[#0f6b46]/20 dark:text-emerald-400 sm:h-8 sm:w-8 sm:rounded-[10px]">
          <Icon className="text-xs sm:text-sm" />
        </span>
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white">{title}</h2>
      </div>
      {action}
    </div>
  );
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
    pollingInterval = setInterval(async () => {
      try {
        const data = await getMyBooking();
        if (previousStatus && previousStatus !== data?.status) {
          if (data?.status === 'APPROVED') toastService.success('🎉 Your booking has been approved!');
          else if (data?.status === 'REJECTED') toastService.error('❌ Your booking was rejected.');
          else if (data?.status === 'EXPIRED') toastService.error('⏰ Your booking has expired.');
          else if (data?.status === 'CANCELLED') toastService.error('🚫 Your booking has been cancelled.');
        }
        setBooking(data);
        previousStatus = data?.status;
      } catch (err) { console.debug('Polling error:', err.message); }
    }, 30000);
    return () => clearInterval(pollingInterval);
  }, []);

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">

      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f6b46] via-[#0e6040] to-[#0a4a30] p-5 text-white shadow-[0_8px_32px_rgba(15,107,70,0.30)] sm:p-6">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/6 sm:h-40 sm:w-40" />
        <div className="pointer-events-none absolute -bottom-8 right-16 h-20 w-20 rounded-full bg-white/4 sm:right-24 sm:h-28 sm:w-28" />

        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200/70 sm:text-xs">Student Portal</p>
            <h1 className="text-xl font-black tracking-tight sm:text-2xl lg:text-3xl">
              Welcome back, {firstName}!
            </h1>
            <p className="mt-0.5 truncate text-xs text-white/60 sm:text-sm">{user?.email}</p>

            <div className="mt-3 flex flex-wrap gap-2 sm:mt-4 sm:gap-3">
              <div className="rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-sm ring-1 ring-white/10 sm:px-4 sm:py-2">
                <p className="text-[9px] font-semibold uppercase tracking-wider text-white/50 sm:text-[10px]">Status</p>
                <p className="mt-0.5 text-xs font-bold sm:text-sm">
                  {loading ? '—' : booking ? booking.status.replace('_', ' ') : 'No Booking'}
                </p>
              </div>
              {isAllocated && booking?.hostelName && (
                <div className="rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-sm ring-1 ring-white/10 sm:px-4 sm:py-2">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-white/50 sm:text-[10px]">Hostel</p>
                  <p className="mt-0.5 text-xs font-bold sm:text-sm">{booking.hostelName}</p>
                </div>
              )}
              {isAllocated && booking?.roomNumber && (
                <div className="rounded-xl bg-white/10 px-3 py-1.5 backdrop-blur-sm ring-1 ring-white/10 sm:px-4 sm:py-2">
                  <p className="text-[9px] font-semibold uppercase tracking-wider text-white/50 sm:text-[10px]">Room</p>
                  <p className="mt-0.5 text-xs font-bold sm:text-sm">{booking.roomNumber}</p>
                </div>
              )}
            </div>
          </div>
          <StatusBadge booking={booking} loading={loading} />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ── Two-column grid ── */}
      <div className="grid gap-4 sm:gap-5 lg:grid-cols-3">

        {/* ── Left column ── */}
        <div className="space-y-4 sm:space-y-5 lg:col-span-2">

          {/* Current Allocation */}
          <SectionCard>
            <SectionHeader icon={FaBed} title="Current Allocation"
              action={isAllocated && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Active</span>
              )}
            />
            <div className="p-4 sm:p-5">
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(n => <div key={n} className="h-9 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800 sm:h-10" />)}</div>
              ) : isAllocated ? (
                <div className="grid grid-cols-2 gap-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/10 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
                  <Detail label="Hostel" value={booking.hostelName} />
                  <Detail label="Room" value={booking.roomNumber} />
                  <Detail label="Booking Ref" value={`#${booking.id}`} />
                  {booking.paymentDueAt && <Detail label="Payment Due" value={formatDate(booking.paymentDueAt)} valueClass="text-yellow-700 dark:text-yellow-400" />}
                  {booking.bookingAcademicYear && <Detail label="Academic Year" value={booking.bookingAcademicYear} />}
                  {booking.bookingAcademicSession && <Detail label="Semester" value={booking.bookingAcademicSession} />}
                </div>
              ) : isPendingPayment ? (
                <div className="space-y-4">
                  <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800/30 dark:bg-yellow-900/10 sm:p-4">
                    <div className="flex items-start gap-3">
                      <FaExclamationTriangle className="mt-0.5 shrink-0 text-yellow-500" />
                      <div>
                        <p className="font-semibold text-yellow-800 dark:text-yellow-300">Payment Required</p>
                        <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-400 sm:text-sm">
                          Your booking for <strong>{booking.hostelName}</strong> — Room <strong>{booking.roomNumber}</strong> is awaiting payment.
                          {booking.paymentDueAt && ` Due by ${formatDate(booking.paymentDueAt)}.`}
                        </p>
                        <Link to="/student/payments" className="mt-3 inline-block rounded-lg bg-[#0f6b46] px-4 py-2 text-sm font-bold text-white hover:bg-[#0c5a3b]">Pay Now</Link>
                      </div>
                    </div>
                  </div>
                  {booking?.paymentDueAt && <PaymentCountdown dueDate={booking.paymentDueAt} onWarning={() => toastService.error('⏰ Payment deadline in 5 minutes!')} />}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 py-6 text-center sm:py-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 sm:h-16 sm:w-16">
                    <FaBuilding className="text-xl text-neutral-400 sm:text-2xl" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">No room assigned yet</p>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Browse available hostels and apply for a room.</p>
                  </div>
                  <Link to="/student/hostels" className="rounded-xl bg-[#0f6b46] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_rgba(15,107,70,0.28)] hover:bg-[#0c5a3b]">
                    Book Accommodation
                  </Link>
                </div>
              )}
            </div>
          </SectionCard>

          {booking && !loading && <BookingProgressTimeline booking={booking} />}

          {/* Financial Summary */}
          <SectionCard>
            <SectionHeader icon={FaCalendarAlt} title="Financial Summary"
              action={<Link to="/student/payments" className="text-xs font-semibold text-[#0f6b46] hover:underline dark:text-emerald-400">View History →</Link>}
            />
            <div className="p-4 sm:p-5">
              {loading ? (
                <div className="space-y-3">{[1,2,3].map(n => <div key={n} className="h-9 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800 sm:h-10" />)}</div>
              ) : booking ? (
                <div className="space-y-2">
                  <FinanceRow label="Payment Status" right={
                    booking.status === 'APPROVED' ? (
                      <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400"><FaCheckCircle /> Confirmed</span>
                    ) : booking.status === 'PENDING_PAYMENT' ? (
                      <span className="flex items-center gap-1.5 text-sm font-bold text-yellow-600 dark:text-yellow-400"><FaClock /> Awaiting Payment</span>
                    ) : (
                      <span className="text-sm font-bold text-neutral-500">{booking.status.replace('_', ' ')}</span>
                    )
                  } />
                  {booking.paymentDueAt && (
                    <FinanceRow label="Due Date" right={
                      <span className={`text-sm font-bold ${new Date(booking.paymentDueAt) < new Date() ? 'text-red-600 dark:text-red-400' : 'text-neutral-800 dark:text-neutral-200'}`}>
                        {formatDate(booking.paymentDueAt)}
                      </span>
                    } />
                  )}
                  <FinanceRow label="Booking Ref" right={<span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">#{booking.id}</span>} />
                  {isPendingPayment && (
                    <Link to="/student/payments" className="mt-3 block w-full rounded-xl bg-[#0f6b46] py-2.5 text-center text-sm font-bold text-white hover:bg-[#0c5a3b]">Pay Now</Link>
                  )}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">No financial records yet. Apply for a room to get started.</p>
              )}
            </div>
          </SectionCard>

          {/* Maintenance Tickets */}
          <SectionCard>
            <SectionHeader icon={FaWrench} title="Maintenance Tickets"
              action={<Link to="/student/complaints" className="text-xs font-semibold text-[#0f6b46] hover:underline dark:text-emerald-400">+ Report Issue</Link>}
            />
            <div className="p-4 sm:p-5">
              <div className="flex flex-col items-center gap-3 py-5 text-center sm:gap-4 sm:py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 sm:h-14 sm:w-14">
                  <FaTools className="text-lg text-neutral-400 sm:text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-700 dark:text-neutral-300">No open tickets</p>
                  <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">All maintenance requests will appear here once submitted.</p>
                </div>
                <Link to="/student/complaints"
                  className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
                  Report New Issue
                </Link>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-4 sm:space-y-5">

          {/* Announcements */}
          <SectionCard>
            <SectionHeader icon={FaBuilding} title="📢 Announcements" />
            <div className="divide-y divide-neutral-100 dark:divide-white/6">
              {SAMPLE_ANNOUNCEMENTS.map((a) => {
                const isExpanded = expandedAnnouncementId === a.id;
                return (
                  <div key={a.id} className="p-3.5 transition-colors hover:bg-neutral-50 dark:hover:bg-white/3 sm:p-4">
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{a.title}</p>
                      <span className="shrink-0 text-[11px] text-neutral-400 dark:text-neutral-500">{a.date}</span>
                    </div>
                    <p className={`text-xs leading-relaxed text-neutral-500 dark:text-neutral-400 ${isExpanded ? '' : 'line-clamp-2'}`}>{a.preview}</p>
                    <button type="button"
                      className="mt-2 text-[11px] font-semibold text-[#0f6b46] hover:underline dark:text-emerald-400"
                      onClick={() => setExpandedAnnouncementId(isExpanded ? null : a.id)}>
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Need Help */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f6b46] to-[#0a4a30] p-4 text-white shadow-[0_8px_24px_rgba(15,107,70,0.25)] sm:p-5">
            <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/6" />
            <p className="relative text-sm font-bold">Need help?</p>
            <p className="relative mt-1 text-xs text-white/60">Contact the hostel office or submit a complaint if you have any issues.</p>
            <Link to="/student/complaints"
              className="relative mt-3 inline-block rounded-xl bg-white/15 px-4 py-2 text-xs font-bold text-white ring-1 ring-white/20 transition hover:bg-white/25 sm:mt-4">
              Submit a Complaint
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value, valueClass = '' }) {
  return (
    <div>
      <p className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 sm:text-[10px]">{label}</p>
      <p className={`mt-0.5 text-xs font-bold text-neutral-900 dark:text-white sm:text-sm ${valueClass}`}>{value ?? '—'}</p>
    </div>
  );
}

function FinanceRow({ label, right }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2.5 dark:bg-neutral-800/50 sm:px-4 sm:py-3">
      <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 sm:text-sm">{label}</span>
      {right}
    </div>
  );
}
