import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBed,
  FaBuilding,
  FaCheckCircle,
  FaExclamationTriangle,
  FaFileExport,
  FaSearch,
  FaTimesCircle,
  FaTools,
  FaUsers
} from 'react-icons/fa';
import {
  listAdminBookings,
  updateAdminBookingStatus
} from '../../services/bookingService.js';
import LifecycleManagementPanel from '../../components/admin/LifecycleManagementPanel.jsx';
import { listHostels } from '../../services/hostelService.js';
import { listRooms } from '../../services/roomService.js';

/* ── Static sample data (maintenance + announcements have no backend yet) ── */
const INITIAL_TICKETS = [
  { id: 'TKT-001', room: '204', hostel: 'Block A', issue: 'Broken AC unit', category: 'HVAC', status: 'PENDING', priority: 'HIGH', date: '28 Feb 2026' },
  { id: 'TKT-002', room: '108', hostel: 'Block B', issue: 'Flickering overhead light', category: 'ELECTRICAL', status: 'IN_PROGRESS', priority: 'MEDIUM', date: '25 Feb 2026' },
  { id: 'TKT-003', room: '312', hostel: 'Block A', issue: 'Leaking bathroom pipe', category: 'PLUMBING', status: 'PENDING', priority: 'HIGH', date: '24 Feb 2026' },
  { id: 'TKT-004', room: '407', hostel: 'Block C', issue: 'WiFi not connecting', category: 'INTERNET', status: 'RESOLVED', priority: 'LOW', date: '20 Feb 2026' }
];

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Scheduled Power Maintenance',
    body: 'Power will be interrupted on Saturday 7 March from 8 AM – 2 PM for routine grid maintenance.',
    expires: '7 Mar 2026',
    published: '1 Mar 2026'
  },
  {
    id: 2,
    title: 'End-of-Semester Checkout Procedures',
    body: 'All students must complete the checkout form and return room keys by the last Friday of the semester.',
    expires: '30 Apr 2026',
    published: '28 Feb 2026'
  }
];

/* ── Status colour maps ── */
const STATUS_CHIP = {
  APPROVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  CHECKED_OUT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  EXPIRED: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  CANCELLED: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
};

const TICKET_CHIP = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  RESOLVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
};

const PRIORITY_CHIP = {
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
  LOW: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
};

const TABS = ['Overview', 'Bookings & Payments', 'Students', 'Lifecycle Management', 'Maintenance', 'Announcements'];

function occupancyBarColor(pct) {
  if (pct >= 90) return 'bg-red-500';
  if (pct >= 60) return 'bg-yellow-500';
  return 'bg-emerald-500';
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [newAnn, setNewAnn] = useState({ title: '', body: '', expires: '' });
  const [annSaved, setAnnSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [b, r, h] = await Promise.all([
          listAdminBookings(),
          listRooms(),
          listHostels()
        ]);
        setBookings(Array.isArray(b) ? b : []);
        setRooms(Array.isArray(r) ? r : []);
        setHostels(Array.isArray(h) ? h : []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleBookingAction(id, status) {
    const key = String(id) + status;
    setActionLoading(key);
    try {
      await updateAdminBookingStatus(id, status);
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  function updateTicketStatus(ticketId, newStatus) {
    setTickets((prev) => prev.map((x) => (x.id === ticketId ? { ...x, status: newStatus } : x)));
  }

  function deleteAnnouncement(annId) {
    setAnnouncements((prev) => prev.filter((x) => x.id !== annId));
  }

  function handlePublishAnn(e) {
    e.preventDefault();
    if (!newAnn.title.trim() || !newAnn.body.trim()) return;
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    setAnnouncements((prev) => [{ id: Date.now(), ...newAnn, published: today }, ...prev]);
    setNewAnn({ title: '', body: '', expires: '' });
    setAnnSaved(true);
    setTimeout(() => setAnnSaved(false), 3500);
  }

  function exportDefaultersCSV() {
    const defaulters = bookings.filter((b) => b.status === 'PENDING_PAYMENT');
    const rows = ['ID,Name,Email,Hostel,Room,Status', ...defaulters.map((b) =>
      `${b.studentId ?? b.id},"${b.studentName ?? ''}","${b.studentEmail ?? ''}","${b.hostelName ?? ''}","${b.roomNumber ?? ''}",${b.status}`
    )];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'defaulters.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function refreshBookings() {
    try {
      const latestBookings = await listAdminBookings();
      setBookings(Array.isArray(latestBookings) ? latestBookings : []);
    } catch (err) {
      console.error(err);
    }
  }

  /* ── Derived stats ── */
  const totalCapacity = rooms.reduce((s, r) => s + (r.capacity ?? 0), 0);
  const totalOccupied = rooms.reduce((s, r) => s + (r.currentOccupancy ?? 0), 0);
  const occupancyPct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  const pendingPayments = bookings.filter((b) => b.status === 'PENDING_PAYMENT');
  const approvedBookings = bookings.filter((b) => b.status === 'APPROVED');
  const openTickets = tickets.filter((t) => t.status !== 'RESOLVED');
  const highPriorityOpen = tickets.filter((t) => t.priority === 'HIGH' && t.status !== 'RESOLVED');

  const occupancyByHostel = rooms.reduce((acc, r) => {
    const key = r.hostelName ?? 'Unknown';
    if (!acc[key]) acc[key] = { occ: 0, cap: 0 };
    acc[key].occ += r.currentOccupancy ?? 0;
    acc[key].cap += r.capacity ?? 0;
    return acc;
  }, {});

  const totalFloors = new Set(
    rooms
      .filter((room) => room.hostelId != null && room.floorNumber != null)
      .map((room) => `${room.hostelId}-${room.floorNumber}`)
  ).size;

  const q = bookingSearch.toLowerCase();
  const filteredBookings = bookings.filter(
    (b) =>
      !q ||
      b.studentName?.toLowerCase().includes(q) ||
      b.hostelName?.toLowerCase().includes(q) ||
      String(b.id).includes(q)
  );

  const sq = studentSearch.toLowerCase();
  const filteredStudents = bookings.filter(
    (b) =>
      !sq ||
      b.studentName?.toLowerCase().includes(sq) ||
      b.studentEmail?.toLowerCase().includes(sq) ||
      b.roomNumber?.toLowerCase().includes(sq)
  );

  const metricCards = [
    {
      label: 'Occupancy Rate',
      value: loading ? '…' : `${totalOccupied} / ${totalCapacity}`,
      sub: loading ? '' : `${occupancyPct}% of beds filled`,
      icon: FaBed,
      gradient: 'from-primary-500 to-primary-700',
      bar: occupancyPct
    },
    {
      label: 'Total Bookings',
      value: loading ? '…' : bookings.length,
      sub: `${approvedBookings.length} approved`,
      icon: FaUsers,
      gradient: 'from-emerald-500 to-emerald-700',
      bar: null
    },
    {
      label: 'Pending Payments',
      value: loading ? '…' : pendingPayments.length,
      sub: 'Awaiting verification',
      icon: FaExclamationTriangle,
      gradient: pendingPayments.length > 0 ? 'from-yellow-500 to-yellow-700' : 'from-neutral-400 to-neutral-600',
      bar: null
    },
    {
      label: 'Open Maintenance',
      value: openTickets.length,
      sub: `${highPriorityOpen.length} high priority`,
      icon: FaTools,
      gradient: openTickets.length > 0 ? 'from-red-500 to-red-700' : 'from-neutral-400 to-neutral-600',
      bar: null
    },
    {
      label: 'Hostels',
      value: loading ? '…' : hostels.length,
      sub: `${totalFloors} floors · ${rooms.length} rooms`,
      icon: FaBuilding,
      gradient: 'from-violet-500 to-violet-700',
      bar: null
    }
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page title */}
      <div>
        <h1 className="page-title text-neutral-900 dark:text-white">Admin Dashboard</h1>
        <p className="section-subtitle mt-1">Full system overview and management tools.</p>
      </div>

      {/* ── Metric cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metricCards.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800 dark:bg-surface-dark"
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${m.gradient}`} />
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                    {m.label}
                  </p>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${m.gradient} text-white`}>
                    <Icon className="text-xs" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-neutral-900 dark:text-white">{m.value}</p>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{m.sub}</p>
                {m.bar !== null && (
                  <div className="mt-3 h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${m.gradient}`}
                      style={{ width: `${m.bar}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Tab bar ── */}
      <div className="flex overflow-x-auto rounded-2xl border border-neutral-200 bg-white p-1 dark:border-neutral-800 dark:bg-surface-dark">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(i)}
            className={`relative flex-shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === i
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            {tab}
            {tab === 'Bookings & Payments' && pendingPayments.length > 0 && (
              <span className="ml-1.5 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[10px] font-extrabold text-yellow-900">
                {pendingPayments.length}
              </span>
            )}
            {tab === 'Maintenance' && openTickets.length > 0 && (
              <span className="ml-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
                {openTickets.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════
          Tab 0 — Overview
      ═══════════════════════════════════════ */}
      {activeTab === 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Occupancy by hostel */}
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Occupancy by Hostel</h2>
              <Link to="/admin/rooms" className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">
                View Rooms →
              </Link>
            </div>
            {Object.keys(occupancyByHostel).length === 0 ? (
              <p className="py-4 text-sm text-neutral-400">No room data yet.</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(occupancyByHostel).map(([name, d]) => {
                  const pct = d.cap > 0 ? Math.round((d.occ / d.cap) * 100) : 0;
                  const barColor = occupancyBarColor(pct);
                  return (
                    <div key={name}>
                      <div className="mb-1.5 flex items-center justify-between text-sm">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{name}</span>
                        <span className="text-neutral-500 dark:text-neutral-400">
                          {d.occ}/{d.cap} &bull; {pct}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent bookings */}
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">Recent Bookings</h2>
              <Link to="/admin/bookings" className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400">
                View All →
              </Link>
            </div>
            {bookings.length === 0 ? (
              <p className="py-4 text-sm text-neutral-400">No bookings yet.</p>
            ) : (
              <div className="space-y-2">
                {bookings.slice(0, 7).map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2.5 dark:bg-neutral-800/60"
                  >
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {b.studentName}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {b.hostelName ?? '—'} &middot; Rm {b.roomNumber ?? '—'}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_CHIP[b.status] ?? STATUS_CHIP.CANCELLED}`}
                    >
                      {b.status?.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="card lg:col-span-2">
            <h2 className="mb-4 text-base font-bold text-neutral-900 dark:text-white">Quick Actions</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { to: '/admin/hostels', icon: '🏢', label: 'Manage Hostels' },
                { to: '/admin/rooms', icon: '🛏️', label: 'Manage Rooms' },
                { to: '/admin/students', icon: '🎓', label: 'Student Directory' },
                { to: '/admin/bookings', icon: '📋', label: 'Manage Bookings' },
                { to: '/admin/terms', icon: '🗓️', label: 'Academic Terms' },
                { to: '/admin/payments', icon: '💳', label: 'Payments' },
                { to: '/admin/reports', icon: '📊', label: 'Reports' }
              ].map((a) => (
                <Link
                  key={a.to}
                  to={a.to}
                  className="flex items-center gap-3 rounded-xl border border-neutral-200 p-4 transition-colors hover:border-primary-300 hover:bg-primary-50/40 dark:border-neutral-700 dark:hover:border-primary-700 dark:hover:bg-primary-900/10"
                >
                  <span className="text-xl">{a.icon}</span>
                  <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                    {a.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          Tab 1 — Bookings & Payments
      ═══════════════════════════════════════ */}
      {activeTab === 1 && (
        <div className="space-y-5">
          {/* Payment verification queue */}
          {pendingPayments.length > 0 && (
            <div className="card border-l-4 border-yellow-400">
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-neutral-900 dark:text-white">
                <span>⏳ Payment Verification Queue</span>
                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                  {pendingPayments.length}
                </span>
              </h2>
              <div className="space-y-2">
                {pendingPayments.map((b) => (
                  <div
                    key={b.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-yellow-50/60 p-3 dark:bg-yellow-900/10"
                  >
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {b.studentName}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {b.hostelName ?? '—'} &middot; Rm {b.roomNumber ?? '—'} &middot; #{b.id}
                        {b.studentEmail ? ` · ${b.studentEmail}` : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={actionLoading === String(b.id) + 'APPROVED'}
                        onClick={() => handleBookingAction(b.id, 'APPROVED')}
                        className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <FaCheckCircle />
                        {actionLoading === String(b.id) + 'APPROVED' ? '…' : 'Approve'}
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading === String(b.id) + 'REJECTED'}
                        onClick={() => handleBookingAction(b.id, 'REJECTED')}
                        className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        <FaTimesCircle />
                        {actionLoading === String(b.id) + 'REJECTED' ? '…' : 'Reject'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All bookings table */}
          <div className="card">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">All Bookings</h2>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400" />
                <input
                  type="text"
                  className="input-field py-1.5 pl-8 pr-3 text-sm"
                  placeholder="Search name, hostel, ID…"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-left text-xs font-bold uppercase tracking-wider text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
                    <th className="pb-2 pr-4">#</th>
                    <th className="pb-2 pr-4">Student</th>
                    <th className="pb-2 pr-4">Room</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-sm text-neutral-500">
                        No results found.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                        <td className="py-2.5 pr-4 text-neutral-500">#{b.id}</td>
                        <td className="py-2.5 pr-4">
                          <p className="font-semibold text-neutral-900 dark:text-white">{b.studentName}</p>
                          <p className="text-xs text-neutral-400">{b.studentEmail}</p>
                        </td>
                        <td className="py-2.5 pr-4 text-neutral-600 dark:text-neutral-300">
                          {b.hostelName ?? '—'} &middot; {b.roomNumber ?? '—'}
                        </td>
                        <td className="py-2.5 pr-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_CHIP[b.status] ?? STATUS_CHIP.CANCELLED}`}>
                            {b.status?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5">
                          {b.status === 'PENDING_PAYMENT' && (
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                disabled={actionLoading === String(b.id) + 'APPROVED'}
                                onClick={() => handleBookingAction(b.id, 'APPROVED')}
                                className="rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-200 disabled:opacity-50 dark:bg-emerald-900/20 dark:text-emerald-400"
                              >
                                ✓ Approve
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading === String(b.id) + 'REJECTED'}
                                onClick={() => handleBookingAction(b.id, 'REJECTED')}
                                className="rounded bg-red-100 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-200 disabled:opacity-50 dark:bg-red-900/20 dark:text-red-400"
                              >
                                ✗ Reject
                              </button>
                            </div>
                          )}
                          {b.status === 'APPROVED' && (
                            <button
                              type="button"
                              disabled={actionLoading === String(b.id) + 'CANCELLED'}
                              onClick={() => handleBookingAction(b.id, 'CANCELLED')}
                              className="rounded bg-neutral-100 px-2 py-1 text-xs font-bold text-neutral-600 hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-400"
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          Tab 2 — Students
      ═══════════════════════════════════════ */}
      {activeTab === 2 && (
        <div className="card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Student Directory</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400" />
                <input
                  type="text"
                  className="input-field py-1.5 pl-8 pr-3 text-sm"
                  placeholder="Search name, email, room…"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>
              <Link to="/admin/students" className="btn-primary text-sm">
                Full Directory
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs font-bold uppercase tracking-wider text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
                  <th className="pb-2 pr-4">ID</th>
                  <th className="pb-2 pr-4">Name</th>
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">Hostel / Room</th>
                  <th className="pb-2">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-sm text-neutral-500">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((b) => (
                    <tr key={b.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                      <td className="py-2.5 pr-4 text-xs text-neutral-500">{b.studentId ?? b.id}</td>
                      <td className="py-2.5 pr-4 font-semibold text-neutral-900 dark:text-white">
                        {b.studentName}
                      </td>
                      <td className="py-2.5 pr-4 text-xs text-neutral-500">{b.studentEmail ?? '—'}</td>
                      <td className="py-2.5 pr-4 text-neutral-600 dark:text-neutral-300">
                        {b.status === 'APPROVED'
                          ? `${b.hostelName ?? '—'} · ${b.roomNumber ?? '—'}`
                          : '—'}
                      </td>
                      <td className="py-2.5">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${STATUS_CHIP[b.status] ?? STATUS_CHIP.CANCELLED}`}>
                          {b.status?.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={exportDefaultersCSV}
              className="flex items-center gap-2 rounded-xl border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary-300 hover:bg-primary-50/40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-primary-900/10"
            >
              <FaFileExport className="text-xs" />
              Export Defaulters (CSV)
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          Tab 3 — Lifecycle Management
      ═══════════════════════════════════════ */}
      {activeTab === 3 && (
        <LifecycleManagementPanel onLifecycleChanged={refreshBookings} />
      )}

      {/* ═══════════════════════════════════════
          Tab 4 — Maintenance
      ═══════════════════════════════════════ */}
      {activeTab === 4 && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900 dark:text-white">Maintenance Tickets</h2>
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700 dark:bg-red-900/20 dark:text-red-400">
              {openTickets.length} open
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs font-bold uppercase tracking-wider text-neutral-400 dark:border-neutral-700 dark:text-neutral-500">
                  <th className="pb-2 pr-4">Ticket</th>
                  <th className="pb-2 pr-4">Issue</th>
                  <th className="pb-2 pr-4">Location</th>
                  <th className="pb-2 pr-4">Priority</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    <td className="py-2.5 pr-4">
                      <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{t.id}</p>
                      <p className="text-xs text-neutral-400">{t.date}</p>
                    </td>
                    <td className="py-2.5 pr-4 font-semibold text-neutral-900 dark:text-white">{t.issue}</td>
                    <td className="py-2.5 pr-4 text-neutral-600 dark:text-neutral-300">
                      {t.hostel} &middot; Rm {t.room}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${PRIORITY_CHIP[t.priority] ?? PRIORITY_CHIP.LOW}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${TICKET_CHIP[t.status] ?? TICKET_CHIP.PENDING}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <select
                        value={t.status}
                        onChange={(e) => updateTicketStatus(t.id, e.target.value)}
                        className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════
          Tab 5 — Announcements
      ═══════════════════════════════════════ */}
        {activeTab === 5 && (
        <div className="space-y-5">
          {annSaved && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-800/30 dark:bg-emerald-900/15 dark:text-emerald-400">
              ✅ Announcement published and visible to all students.
            </div>
          )}

          {/* Publish form */}
          <div className="card">
            <h2 className="mb-4 text-base font-bold text-neutral-900 dark:text-white">
              📢 Publish New Announcement
            </h2>
            <form onSubmit={handlePublishAnn} className="space-y-4">
              <div>
                <label
                  htmlFor="ann-title"
                  className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="ann-title"
                  type="text"
                  className="input-field"
                  placeholder="e.g. Water pump maintenance this Friday"
                  value={newAnn.title}
                  onChange={(e) => setNewAnn((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="ann-body"
                  className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="ann-body"
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Write the full announcement here…"
                  value={newAnn.body}
                  onChange={(e) => setNewAnn((p) => ({ ...p, body: e.target.value }))}
                  required
                />
              </div>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex-1">
                  <label
                    htmlFor="ann-expires"
                    className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Expiry Date (optional)
                  </label>
                  <input
                    id="ann-expires"
                    type="date"
                    className="input-field"
                    value={newAnn.expires}
                    onChange={(e) => setNewAnn((p) => ({ ...p, expires: e.target.value }))}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newAnn.title.trim() || !newAnn.body.trim()}
                  className="btn-primary disabled:opacity-50"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>

          {/* Published list */}
          <div className="card">
            <h2 className="mb-4 text-base font-bold text-neutral-900 dark:text-white">
              Published Announcements
            </h2>
            {announcements.length === 0 ? (
              <p className="py-4 text-sm text-neutral-500">No announcements published yet.</p>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-xl border border-neutral-100 p-4 dark:border-neutral-800"
                  >
                    <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
                      <p className="font-semibold text-neutral-900 dark:text-white">{a.title}</p>
                      <div className="flex gap-3 text-xs text-neutral-400 dark:text-neutral-500">
                        <span>Published: {a.published}</span>
                        {a.expires && <span>Expires: {a.expires}</span>}
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">{a.body}</p>
                    <button
                      type="button"
                      onClick={() => deleteAnnouncement(a.id)}
                      className="mt-2 text-xs font-medium text-red-500 hover:text-red-700 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
