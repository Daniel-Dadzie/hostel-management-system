import { useEffect, useState } from 'react';
import {
  FaBed,
  FaBuilding,
  FaExclamationTriangle,
  FaTools,
  FaUsers
} from 'react-icons/fa';
import {
  listAdminBookings,
  updateAdminBookingStatus
} from '../../services/bookingService.js';
import LifecycleManagementPanel from '../../components/admin/LifecycleManagementPanel.jsx';
import AdminDashboardOverviewTab from '../../components/admin/AdminDashboardOverviewTab.jsx';
import {
  AnnouncementsTab,
  BookingsPaymentsTab,
  MaintenanceTab,
  StudentsTab
} from '../../components/admin/AdminDashboardOperationsTabs.jsx';
import { MetricCard, formatStatusLabel } from '../../components/admin/AdminDashboardShared.jsx';
import { listHostels } from '../../services/hostelService.js';
import { listRooms } from '../../services/roomService.js';

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
    body: 'Power will be interrupted on Saturday 7 March from 8 AM - 2 PM for routine grid maintenance.',
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
      setBookings((prev) => prev.map((booking) => (booking.id === id ? { ...booking, status } : booking)));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  function updateTicketStatus(ticketId, newStatus) {
    setTickets((prev) => prev.map((ticket) => (ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket)));
  }

  function deleteAnnouncement(annId) {
    setAnnouncements((prev) => prev.filter((item) => item.id !== annId));
  }

  function handlePublishAnn(event) {
    event.preventDefault();
    if (!newAnn.title.trim() || !newAnn.body.trim()) return;
    const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    setAnnouncements((prev) => [{ id: Date.now(), ...newAnn, published: today }, ...prev]);
    setNewAnn({ title: '', body: '', expires: '' });
    setAnnSaved(true);
    setTimeout(() => setAnnSaved(false), 3500);
  }

  function exportDefaultersCSV() {
    const defaulters = bookings.filter((booking) => booking.status === 'PENDING_PAYMENT');
    const rows = [
      'ID,Name,Email,Hostel,Room,Status',
      ...defaulters.map(
        (booking) =>
          `${booking.studentId ?? booking.id},"${booking.studentName ?? ''}","${booking.studentEmail ?? ''}","${booking.hostelName ?? ''}","${booking.roomNumber ?? ''}",${booking.status}`
      )
    ];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'defaulters.csv';
    anchor.click();
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

  const totalCapacity = rooms.reduce((sum, room) => sum + (room.capacity ?? 0), 0);
  const totalOccupied = rooms.reduce((sum, room) => sum + (room.currentOccupancy ?? 0), 0);
  const occupancyPct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  const pendingPayments = bookings.filter((booking) => booking.status === 'PENDING_PAYMENT');
  const approvedBookings = bookings.filter((booking) => booking.status === 'APPROVED');
  const openTickets = tickets.filter((ticket) => ticket.status !== 'RESOLVED');
  const highPriorityOpen = tickets.filter((ticket) => ticket.priority === 'HIGH' && ticket.status !== 'RESOLVED');

  const occupancyByHostel = rooms.reduce((acc, room) => {
    const key = room.hostelName ?? 'Unknown';
    if (!acc[key]) acc[key] = { occ: 0, cap: 0 };
    acc[key].occ += room.currentOccupancy ?? 0;
    acc[key].cap += room.capacity ?? 0;
    return acc;
  }, {});

  const totalFloors = new Set(
    rooms
      .filter((room) => room.hostelId != null && room.floorNumber != null)
      .map((room) => `${room.hostelId}-${room.floorNumber}`)
  ).size;

  const bookingQuery = bookingSearch.toLowerCase();
  const filteredBookings = bookings.filter(
    (booking) =>
      !bookingQuery
      || booking.studentName?.toLowerCase().includes(bookingQuery)
      || booking.hostelName?.toLowerCase().includes(bookingQuery)
      || String(booking.id).includes(bookingQuery)
  );

  const studentQuery = studentSearch.toLowerCase();
  const filteredStudents = bookings.filter(
    (booking) =>
      !studentQuery
      || booking.studentName?.toLowerCase().includes(studentQuery)
      || booking.studentEmail?.toLowerCase().includes(studentQuery)
      || booking.roomNumber?.toLowerCase().includes(studentQuery)
  );

  const metricCards = [
    {
      label: 'Occupancy Rate',
      value: loading ? '...' : `${totalOccupied} / ${totalCapacity}`,
      sub: loading ? 'Loading live bed allocation...' : `${occupancyPct}% of beds currently filled`,
      icon: FaBed,
      progress: occupancyPct,
      featured: true
    },
    {
      label: 'Total Bookings',
      value: loading ? '...' : bookings.length,
      sub: `${approvedBookings.length} approved bookings`,
      icon: FaUsers,
      progress: null
    },
    {
      label: 'Pending Payments',
      value: loading ? '...' : pendingPayments.length,
      sub: 'Awaiting verification or action',
      icon: FaExclamationTriangle,
      progress: null
    },
    {
      label: 'Open Maintenance',
      value: openTickets.length,
      sub: `${highPriorityOpen.length} high priority items`,
      icon: FaTools,
      progress: null
    },
    {
      label: 'Hostels',
      value: loading ? '...' : hostels.length,
      sub: `${totalFloors} floors across ${rooms.length} rooms`,
      icon: FaBuilding,
      progress: null
    }
  ];

  function renderBookingActions(booking, compact = false) {
    if (booking.status === 'PENDING_PAYMENT') {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={actionLoading === String(booking.id) + 'APPROVED'}
            onClick={() => handleBookingAction(booking.id, 'APPROVED')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold ${
              compact ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400'
            } disabled:opacity-50`}
          >
            {actionLoading === String(booking.id) + 'APPROVED' ? 'Working...' : 'Approve'}
          </button>
          <button
            type="button"
            disabled={actionLoading === String(booking.id) + 'REJECTED'}
            onClick={() => handleBookingAction(booking.id, 'REJECTED')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold ${
              compact ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400'
            } disabled:opacity-50`}
          >
            {actionLoading === String(booking.id) + 'REJECTED' ? 'Working...' : 'Reject'}
          </button>
        </div>
      );
    }

    if (booking.status === 'APPROVED') {
      return (
        <button
          type="button"
          disabled={actionLoading === String(booking.id) + 'CANCELLED'}
          onClick={() => handleBookingAction(booking.id, 'CANCELLED')}
          className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300"
        >
          {actionLoading === String(booking.id) + 'CANCELLED' ? 'Working...' : 'Revoke'}
        </button>
      );
    }

    return <span className="text-xs font-medium text-neutral-400">No actions</span>;
  }

  return (
    <div className="animate-fade-in space-y-6">
      <section className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-neutral-400 dark:text-neutral-500">
            Operations Overview
          </p>
          <h1 className="page-title mt-2 text-neutral-900 dark:text-white">Admin Dashboard</h1>
          <p className="section-subtitle mt-3 max-w-2xl">
            Full system overview and management tools, styled as a calmer admin workspace while keeping the same logic underneath.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <div className="admin-toolbar-chip">Pending payments: {pendingPayments.length}</div>
          <div className="admin-toolbar-chip">Open tickets: {openTickets.length}</div>
          <div className="admin-toolbar-chip">Live hostels: {hostels.length}</div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        {metricCards.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            sub={metric.sub}
            icon={metric.icon}
            progress={metric.progress}
            featured={metric.featured}
          />
        ))}
      </section>

      <div className="flex overflow-x-auto rounded-full border border-[#dfe7df] bg-white/80 p-1.5 shadow-[0_12px_26px_rgba(15,23,42,0.04)] dark:border-[#24332b] dark:bg-[#131916]">
        {TABS.map((tab, index) => {
          const isActive = activeTab === index;
          const badgeValue =
            tab === 'Bookings & Payments'
              ? pendingPayments.length
              : tab === 'Maintenance'
              ? openTickets.length
              : null;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(index)}
              className={`inline-flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-[#0f6b46] text-white shadow-[0_12px_24px_rgba(15,107,70,0.24)]'
                  : 'text-neutral-500 hover:bg-[#f3f7f3] hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-[#1c241f] dark:hover:text-white'
              }`}
            >
              <span>{tab}</span>
              {badgeValue > 0 ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    isActive ? 'bg-white/18 text-white' : 'bg-[#eaf5ed] text-[#0f6b46] dark:bg-[#183726] dark:text-[#89d8b1]'
                  }`}
                >
                  {badgeValue}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {activeTab === 0 ? (
        <AdminDashboardOverviewTab
          occupancyByHostel={occupancyByHostel}
          bookings={bookings}
          hostels={hostels}
          rooms={rooms}
          approvedBookings={approvedBookings}
          openTickets={openTickets}
          STATUS_CHIP={STATUS_CHIP}
          formatStatusLabel={formatStatusLabel}
        />
      ) : null}

      {activeTab === 1 ? (
        <BookingsPaymentsTab
          pendingPayments={pendingPayments}
          filteredBookings={filteredBookings}
          bookingSearch={bookingSearch}
          setBookingSearch={setBookingSearch}
          STATUS_CHIP={STATUS_CHIP}
          formatStatusLabel={formatStatusLabel}
          renderBookingActions={renderBookingActions}
        />
      ) : null}

      {activeTab === 2 ? (
        <StudentsTab
          filteredStudents={filteredStudents}
          studentSearch={studentSearch}
          setStudentSearch={setStudentSearch}
          exportDefaultersCSV={exportDefaultersCSV}
          STATUS_CHIP={STATUS_CHIP}
          formatStatusLabel={formatStatusLabel}
        />
      ) : null}

      {activeTab === 3 ? <LifecycleManagementPanel onLifecycleChanged={refreshBookings} /> : null}

      {activeTab === 4 ? (
        <MaintenanceTab
          tickets={tickets}
          openTickets={openTickets}
          updateTicketStatus={updateTicketStatus}
          PRIORITY_CHIP={PRIORITY_CHIP}
          TICKET_CHIP={TICKET_CHIP}
          formatStatusLabel={formatStatusLabel}
        />
      ) : null}

      {activeTab === 5 ? (
        <AnnouncementsTab
          annSaved={annSaved}
          newAnn={newAnn}
          setNewAnn={setNewAnn}
          handlePublishAnn={handlePublishAnn}
          announcements={announcements}
          deleteAnnouncement={deleteAnnouncement}
        />
      ) : null}
    </div>
  );
}
