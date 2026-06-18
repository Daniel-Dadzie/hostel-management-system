import { useEffect, useState } from 'react';
import { FaBed, FaBuilding, FaExclamationTriangle, FaTools, FaUsers } from 'react-icons/fa';
import { listAdminBookings, updateAdminBookingStatus } from '../../services/bookingService.js';
import { listAllAnnouncements, publishAnnouncement, deleteAnnouncement as deleteAnnAPI } from '../../services/announcementService.js';
import { listAdminMaintenanceTickets, updateAdminMaintenanceTicket } from '../../services/maintenanceService.js';
import LifecycleManagementPanel from '../../components/admin/LifecycleManagementPanel.jsx';
import AdminDashboardOverviewTab from '../../components/admin/AdminDashboardOverviewTab.jsx';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard.jsx';
import { AnnouncementsTab, BookingsPaymentsTab, MaintenanceTab, StudentsTab } from '../../components/admin/AdminDashboardOperationsTabs.jsx';
import { MetricCard, formatStatusLabel } from '../../components/admin/AdminDashboardShared.jsx';
import { listHostels } from '../../services/hostelService.js';
import { listRooms } from '../../services/roomService.js';

const STATUS_CHIP = {
  APPROVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  PENDING_PAYMENT: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  CHECKED_OUT: 'bg-lime-100 text-lime-800 dark:bg-lime-500/20 dark:text-lime-300',
  REJECTED: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
  EXPIRED: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300',
  CANCELLED: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300'
};

const TICKET_CHIP = {
  OPEN: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  RESOLVED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  CLOSED: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300'
};

const PRIORITY_CHIP = {
  HIGH: 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  LOW: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300'
};

const TABS = ['Overview', 'Analytics', 'Bookings & Payments', 'Students', 'Lifecycle Management', 'Maintenance', 'Announcements'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [bookingSearch, setBookingSearch] = useState('');
  const [tickets, setTickets] = useState([]);
  const [ticketsError, setTicketsError] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [newAnn, setNewAnn] = useState({ title: '', body: '', expiresAt: '' });
  const [annSaved, setAnnSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [b, r, h, a, t] = await Promise.all([
          listAdminBookings(),
          listRooms(),
          listHostels(),
          listAllAnnouncements(),
          listAdminMaintenanceTickets()
        ]);
        setBookings(Array.isArray(b) ? b : []);
        setRooms(Array.isArray(r) ? r : []);
        setHostels(Array.isArray(h) ? h : []);
        setAnnouncements(Array.isArray(a) ? a : []);
        setTickets(Array.isArray(t) ? t : []);
        setTicketsError(null);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setTicketsError('Failed to load maintenance tickets');
      } finally {
        setLoading(false);
        setAnnouncementsLoading(false);
        setTicketsLoading(false);
      }
    })();
  }, []);

  async function handleBookingAction(id, status) {
    const key = String(id) + status;
    setActionLoading(key);
    try {
      await updateAdminBookingStatus(id, status);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  }

  async function updateTicketStatus(ticketId, newStatus, adminNotes = '') {
    const key = `ticket-${ticketId}-${newStatus}`;
    setActionLoading(key);
    try {
      const updatedTicket = await updateAdminMaintenanceTicket(ticketId, newStatus, adminNotes);
      setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
    } catch (err) {
      console.error('Failed to update ticket:', err);
      alert('Failed to update maintenance ticket. Please try again.');
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteAnnouncement(annId) {
    try {
      await deleteAnnAPI(annId);
      setAnnouncements(prev => prev.filter(item => item.id !== annId));
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  }

  async function handlePublishAnn(event) {
    event.preventDefault();
    if (!newAnn.title.trim() || !newAnn.body.trim()) return;
    
    try {
      const response = await publishAnnouncement({
        title: newAnn.title,
        body: newAnn.body,
        expiresAt: newAnn.expiresAt || null
      });
      
      setAnnouncements(prev => [response, ...prev]);
      setNewAnn({ title: '', body: '', expiresAt: '' });
      setAnnSaved(true);
      setTimeout(() => setAnnSaved(false), 3500);
    } catch (err) {
      console.error('Failed to publish announcement:', err);
    }
  }

  function exportDefaultersCSV() {
    const defaulters = bookings.filter(b => b.status === 'PENDING_PAYMENT');
    const rows = ['ID,Name,Email,Hostel,Room,Status', ...defaulters.map(b => `${b.studentId ?? b.id},"${b.studentName ?? ''}","${b.studentEmail ?? ''}","${b.hostelName ?? ''}","${b.roomNumber ?? ''}",${b.status}`)];
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'defaulters.csv'; anchor.click();
    URL.revokeObjectURL(url);
  }

  async function refreshBookings() {
    try {
      const latest = await listAdminBookings();
      setBookings(Array.isArray(latest) ? latest : []);
    } catch (err) { console.error(err); }
  }

  async function refreshTickets() {
    try {
      setTicketsLoading(true);
      const latest = await listAdminMaintenanceTickets();
      setTickets(Array.isArray(latest) ? latest : []);
      setTicketsError(null);
    } catch (err) {
      console.error(err);
      setTicketsError('Failed to refresh maintenance tickets');
    } finally {
      setTicketsLoading(false);
    }
  }

  const totalCapacity = rooms.reduce((s, r) => s + (r.capacity ?? 0), 0);
  const totalOccupied = rooms.reduce((s, r) => s + (r.currentOccupancy ?? 0), 0);
  const occupancyPct = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
  const pendingPayments = bookings.filter(b => b.status === 'PENDING_PAYMENT');
  const approvedBookings = bookings.filter(b => b.status === 'APPROVED');
  const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
  const highPriorityOpen = tickets.filter(t => (t.status === 'OPEN' || t.status === 'IN_PROGRESS'));

  const occupancyByHostel = rooms.reduce((acc, room) => {
    const key = room.hostelName ?? 'Unknown';
    if (!acc[key]) acc[key] = { occ: 0, cap: 0 };
    acc[key].occ += room.currentOccupancy ?? 0;
    acc[key].cap += room.capacity ?? 0;
    return acc;
  }, {});

  const totalFloors = new Set(
    rooms.filter(r => r.hostelId != null && r.floorNumber != null).map(r => `${r.hostelId}-${r.floorNumber}`)
  ).size;

  const bookingQuery = bookingSearch.toLowerCase();
  const filteredBookings = bookings.filter(b => !bookingQuery || b.studentName?.toLowerCase().includes(bookingQuery) || b.hostelName?.toLowerCase().includes(bookingQuery) || String(b.id).includes(bookingQuery));

  const studentQuery = studentSearch.toLowerCase();
  const filteredStudents = bookings.filter(b => !studentQuery || b.studentName?.toLowerCase().includes(studentQuery) || b.studentEmail?.toLowerCase().includes(studentQuery) || b.roomNumber?.toLowerCase().includes(studentQuery));

  const metricCards = [
    { label: 'Occupancy Rate', value: loading ? '...' : `${totalOccupied} / ${totalCapacity}`, sub: loading ? 'Loading...' : `${occupancyPct}% of beds currently filled`, icon: FaBed, progress: occupancyPct, featured: true },
    { label: 'Total Bookings', value: loading ? '...' : bookings.length, sub: `${approvedBookings.length} approved bookings`, icon: FaUsers, progress: null },
    { label: 'Pending Payments', value: loading ? '...' : pendingPayments.length, sub: 'Awaiting verification or action', icon: FaExclamationTriangle, progress: null },
    { label: 'Open Maintenance', value: openTickets.length, sub: `${highPriorityOpen.length} high priority items`, icon: FaTools, progress: null },
    { label: 'Hostels', value: loading ? '...' : hostels.length, sub: `${totalFloors} floors across ${rooms.length} rooms`, icon: FaBuilding, progress: null }
  ];

  function renderBookingActions(booking, compact = false) {
    if (booking.status === 'PENDING_PAYMENT') {
      return (
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={actionLoading === String(booking.id) + 'APPROVED'}
            onClick={() => handleBookingAction(booking.id, 'APPROVED')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold ${compact ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500 dark:text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500'} disabled:opacity-50`}>
            {actionLoading === String(booking.id) + 'APPROVED' ? 'Working...' : 'Approve'}
          </button>
          <button type="button" disabled={actionLoading === String(booking.id) + 'REJECTED'}
            onClick={() => handleBookingAction(booking.id, 'REJECTED')}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold ${compact ? 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 dark:text-white' : 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500'} disabled:opacity-50`}>
            {actionLoading === String(booking.id) + 'REJECTED' ? 'Working...' : 'Reject'}
          </button>
        </div>
      );
    }
    if (booking.status === 'APPROVED') {
      return (
        <button type="button" disabled={actionLoading === String(booking.id) + 'CANCELLED'}
          onClick={() => handleBookingAction(booking.id, 'CANCELLED')}
          className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-200 disabled:opacity-50 dark:bg-[rgba(12,52,44,0.72)] dark:text-[#dcebd0]/78">
          {actionLoading === String(booking.id) + 'CANCELLED' ? 'Working...' : 'Revoke'}
        </button>
      );
    }
    return <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">No actions</span>;
  }

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">

      {/* ── Header ── */}
      <section className="flex flex-col gap-3 sm:gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#64806f] dark:text-[#d8ecd5]/46">
            Operations Overview
          </p>
          <h1 className="page-title mt-1.5 text-neutral-900 dark:text-white sm:mt-2">Admin Dashboard</h1>
          <p className="section-subtitle mt-2 max-w-2xl text-sm sm:mt-3 sm:text-base">
            Monitor allocations, payments, maintenance, and student activity from one live operations center.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          <div className="admin-toolbar-chip text-xs sm:text-sm">Pending: {pendingPayments.length}</div>
          <div className="admin-toolbar-chip text-xs sm:text-sm">Tickets: {openTickets.length}</div>
          <div className="admin-toolbar-chip text-xs sm:text-sm">Hostels: {hostels.length}</div>
        </div>
      </section>

      {/* ── Metric Cards ── */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5">
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

      {/* ── Tabs ── */}
      <div className="flex overflow-x-auto rounded-2xl border border-[#cadca5] bg-[rgba(255,253,238,0.82)] p-1 shadow-[0_12px_26px_rgba(6,35,29,0.08)] scrollbar-none dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-[0_12px_20px_rgba(0,0,0,0.3)] sm:rounded-full sm:p-1.5">
        {TABS.map((tab, index) => {
          const isActive = activeTab === index;
          const badgeValue = tab === 'Bookings & Payments' ? pendingPayments.length : tab === 'Maintenance' ? openTickets.length : null;
          return (
            <button key={tab} type="button" onClick={() => setActiveTab(index)}
              className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all duration-200 sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm ${
                isActive
                  ? 'bg-[linear-gradient(135deg,#fffdee_0%,#e2fbce_30%,#e3ef26_100%)] text-[#0c342c] shadow-[0_12px_24px_rgba(6,35,29,0.16)] dark:bg-neutral-800 dark:text-emerald-400 dark:shadow-[0_8px_16px_rgba(0,0,0,0.3)]'
                  : 'text-neutral-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200'
              }`}>
              <span className="whitespace-nowrap">{tab}</span>
              {badgeValue > 0 && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${isActive ? 'bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white' : 'bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white'}`}>
                  {badgeValue}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      <div className="min-w-0">
        {activeTab === 0 && <AdminDashboardOverviewTab occupancyByHostel={occupancyByHostel} bookings={bookings} STATUS_CHIP={STATUS_CHIP} formatStatusLabel={formatStatusLabel} />}
        {activeTab === 1 && <AnalyticsDashboard />}
        {activeTab === 2 && <BookingsPaymentsTab pendingPayments={pendingPayments} filteredBookings={filteredBookings} bookingSearch={bookingSearch} setBookingSearch={setBookingSearch} STATUS_CHIP={STATUS_CHIP} formatStatusLabel={formatStatusLabel} renderBookingActions={renderBookingActions} />}
        {activeTab === 3 && <StudentsTab filteredStudents={filteredStudents} studentSearch={studentSearch} setStudentSearch={setStudentSearch} exportDefaultersCSV={exportDefaultersCSV} STATUS_CHIP={STATUS_CHIP} formatStatusLabel={formatStatusLabel} />}
        {activeTab === 4 && <LifecycleManagementPanel onLifecycleChanged={refreshBookings} />}
        {activeTab === 5 && <MaintenanceTab tickets={tickets} openTickets={openTickets} updateTicketStatus={updateTicketStatus} PRIORITY_CHIP={PRIORITY_CHIP} TICKET_CHIP={TICKET_CHIP} formatStatusLabel={formatStatusLabel} ticketsLoading={ticketsLoading} ticketsError={ticketsError} />}
        {activeTab === 6 && <AnnouncementsTab annSaved={annSaved} newAnn={newAnn} setNewAnn={setNewAnn} handlePublishAnn={handlePublishAnn} announcements={announcements} deleteAnnouncement={deleteAnnouncement} />}
      </div>
    </div>
  );
}