import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  FaFileExport,
  FaSearch
} from 'react-icons/fa';
import { DashboardPanel } from './AdminDashboardShared.jsx';

export function BookingsPaymentsTab({
  pendingPayments,
  filteredBookings,
  bookingSearch,
  setBookingSearch,
  STATUS_CHIP,
  formatStatusLabel,
  renderBookingActions
}) {
  return (
    <div className="space-y-5">
      {pendingPayments.length > 0 ? (
        <DashboardPanel
          title="Payment Verification Queue"
          subtitle="These bookings are waiting for admin review before rooms are confirmed."
          action={
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700 dark:bg-[rgba(227,239,38,0.18)] dark:text-[#f3f8b7]">
              {pendingPayments.length} pending
            </span>
          }
          className="border-yellow-200/70 dark:border-[rgba(227,239,38,0.14)]"
        >
          <div className="space-y-3">
            {pendingPayments.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-yellow-200/60 bg-yellow-50/60 px-4 py-4 dark:border-[rgba(227,239,38,0.12)] dark:bg-[rgba(227,239,38,0.08)]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-neutral-900 dark:text-[#fffdee]">
                    {booking.studentName}
                  </p>
                  <p className="mt-1 truncate text-xs text-neutral-500 dark:text-[#dcebd0]/58">
                    {booking.hostelName ?? 'Unassigned'} / Room {booking.roomNumber ?? '-'} / #{booking.id}
                    {booking.studentEmail ? ` / ${booking.studentEmail}` : ''}
                  </p>
                </div>
                {renderBookingActions(booking, true)}
              </div>
            ))}
          </div>
        </DashboardPanel>
      ) : null}

      <DashboardPanel
        title="All Bookings"
        subtitle="Search, review, and act on booking records without leaving the dashboard."
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="admin-toolbar-chip">Results: {filteredBookings.length}</div>
          <div className="relative w-full sm:w-[320px]">
            <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400" />
            <input
              type="text"
              className="input-field py-3 pl-10 pr-4 text-sm"
              placeholder="Search by student, hostel, or booking ID"
              value={bookingSearch}
              onChange={(event) => setBookingSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-[rgba(226,251,206,0.08)]">
                <th className="pb-3 pr-4 text-left">Booking</th>
                <th className="pb-3 pr-4 text-left">Student</th>
                <th className="pb-3 pr-4 text-left">Room</th>
                <th className="pb-3 pr-4 text-left">Status</th>
                <th className="pb-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-[rgba(226,251,206,0.08)]">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-sm text-neutral-500">
                    No results found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="py-4 pr-4 text-sm font-semibold text-neutral-700 dark:text-[#fffdee]/82">
                      #{booking.id}
                    </td>
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-neutral-900 dark:text-[#fffdee]">{booking.studentName}</p>
                      <p className="mt-1 text-xs text-neutral-500 dark:text-[#dcebd0]/58">{booking.studentEmail || 'No email'}</p>
                    </td>
                    <td className="py-4 pr-4 text-neutral-600 dark:text-[#dcebd0]/68">
                      {booking.hostelName ?? 'Unassigned'} / {booking.roomNumber ?? '-'}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CHIP[booking.status] ?? STATUS_CHIP.CANCELLED}`}
                      >
                        {formatStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="py-4">{renderBookingActions(booking)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardPanel>
    </div>
  );
}

export function StudentsTab({
  filteredStudents,
  studentSearch,
  setStudentSearch,
  exportDefaultersCSV,
  STATUS_CHIP,
  formatStatusLabel
}) {
  return (
    <DashboardPanel
      title="Student Directory"
      subtitle="Search students by booking activity and export payment defaulters when needed."
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-[320px]">
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400" />
          <input
            type="text"
            className="input-field py-3 pl-10 pr-4 text-sm"
            placeholder="Search by name, email, or room"
            value={studentSearch}
            onChange={(event) => setStudentSearch(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Link to="/admin/students" className="btn-primary text-sm">
            Full Directory
          </Link>
          <button type="button" onClick={exportDefaultersCSV} className="btn-accent text-sm">
            <FaFileExport className="text-xs" />
            Export Defaulters
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-[rgba(226,251,206,0.08)]">
              <th className="pb-3 pr-4 text-left">Student ID</th>
              <th className="pb-3 pr-4 text-left">Name</th>
              <th className="pb-3 pr-4 text-left">Email</th>
              <th className="pb-3 pr-4 text-left">Hostel / Room</th>
              <th className="pb-3 text-left">Payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-[rgba(226,251,206,0.08)]">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-sm text-neutral-500">
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((booking) => (
                <tr key={booking.id}>
                  <td className="py-4 pr-4 text-xs font-semibold text-neutral-500 dark:text-[#dcebd0]/58">
                    {booking.studentId ?? booking.id}
                  </td>
                  <td className="py-4 pr-4 font-semibold text-neutral-900 dark:text-[#fffdee]">
                    {booking.studentName}
                  </td>
                  <td className="py-4 pr-4 text-xs text-neutral-500 dark:text-[#dcebd0]/58">
                    {booking.studentEmail ?? '-'}
                  </td>
                  <td className="py-4 pr-4 text-neutral-600 dark:text-[#dcebd0]/68">
                    {booking.status === 'APPROVED'
                      ? `${booking.hostelName ?? '-'} / ${booking.roomNumber ?? '-'}`
                      : '-'}
                  </td>
                  <td className="py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CHIP[booking.status] ?? STATUS_CHIP.CANCELLED}`}
                    >
                      {formatStatusLabel(booking.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardPanel>
  );
}

export function MaintenanceTab({
  tickets,
  openTickets,
  updateTicketStatus,
  TICKET_CHIP,
  PRIORITY_CHIP,
  formatStatusLabel,
  ticketsLoading,
  ticketsError
}) {
  const [expandedTicketId, setExpandedTicketId] = useState(null);
  const [editingNotes, setEditingNotes] = useState({});

  function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  const categoryLabels = {
    ELECTRICAL: 'Electrical',
    PLUMBING: 'Plumbing',
    AC: 'AC/Ventilation',
    INTERNET: 'Internet/WiFi',
    FURNITURE: 'Furniture',
    CLEANING: 'Cleaning',
    SECURITY: 'Security',
    OTHER: 'Other'
  };

  const statusColors = {
    OPEN: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', badge: 'bg-yellow-100 dark:bg-yellow-900/40' },
    IN_PROGRESS: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', badge: 'bg-blue-100 dark:bg-blue-900/40' },
    RESOLVED: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-100 dark:bg-emerald-900/40' },
    CLOSED: { bg: 'bg-neutral-50 dark:bg-neutral-900/20', text: 'text-neutral-700 dark:text-neutral-300', badge: 'bg-neutral-100 dark:bg-neutral-900/40' }
  };

  if (ticketsLoading) {
    return (
      <DashboardPanel
        title="Maintenance Tickets"
        subtitle="Track open room and facility issues without leaving the admin dashboard."
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
            <p className="text-neutral-600 dark:text-neutral-400">Loading tickets...</p>
          </div>
        </div>
      </DashboardPanel>
    );
  }

  if (ticketsError) {
    return (
      <DashboardPanel
        title="Maintenance Tickets"
        subtitle="Track open room and facility issues without leaving the admin dashboard."
      >
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          ⚠️ {ticketsError}
        </div>
      </DashboardPanel>
    );
  }

  if (tickets.length === 0) {
    return (
      <DashboardPanel
        title="Maintenance Tickets"
        subtitle="Track open room and facility issues without leaving the admin dashboard."
        action={
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-[rgba(7,102,83,0.32)] dark:text-[#e2fbce]">
            All clear
          </span>
        }
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">No maintenance tickets at this time.</p>
        </div>
      </DashboardPanel>
    );
  }

  return (
    <DashboardPanel
      title="Maintenance Tickets"
      subtitle="Track open room and facility issues without leaving the admin dashboard."
      action={
        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 dark:bg-[rgba(133,67,50,0.28)] dark:text-[#fac2be]">
          {openTickets.length} open
        </span>
      }
    >
      <div className="space-y-2">
        {tickets.map((ticket) => {
          const isExpanded = expandedTicketId === ticket.id;
          const colors = statusColors[ticket.status] || statusColors.OPEN;

          return (
            <div
              key={ticket.id}
              className={`rounded-2xl border transition-all duration-200 ${
                isExpanded
                  ? `${colors.bg} border-blue-200 dark:border-blue-500/30`
                  : 'border-neutral-200 dark:border-white/10 hover:border-neutral-300 dark:hover:border-white/20'
              }`}
            >
              {/* Ticket Header */}
              <button
                type="button"
                onClick={() => setExpandedTicketId(isExpanded ? null : ticket.id)}
                className="w-full px-5 py-4 text-left transition-colors hover:bg-black/2 dark:hover:bg-white/2"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-bold text-neutral-900 dark:text-white">
                        TKT-{String(ticket.id).padStart(4, '0')}
                      </p>
                      <p className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {ticket.title}
                      </p>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colors.badge} ${colors.text}`}>
                        {categoryLabels[ticket.category] || ticket.category}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${TICKET_CHIP[ticket.status]}`}>
                        {formatStatusLabel(ticket.status)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                      <span>📅 {formatDate(ticket.createdAt)}</span>
                      <span>👤 {ticket.studentName || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="text-xl text-neutral-400 dark:text-white/50 transition-transform">
                    {isExpanded ? '▼' : '▶'}
                  </div>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className={`border-t ${colors.bg} px-5 py-4 space-y-4`}>
                  {/* Description */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                      Description
                    </p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-200 bg-white/50 dark:bg-black/20 rounded-lg p-3 leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                      Admin Notes
                    </p>
                    <textarea
                      value={editingNotes[ticket.id] || ticket.adminNotes || ''}
                      onChange={(e) => setEditingNotes({ ...editingNotes, [ticket.id]: e.target.value })}
                      placeholder="Add your notes and observations here..."
                      className="input-field w-full h-20 text-xs resize-none"
                    />
                  </div>

                  {/* Status Update */}
                  <div>
                    <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide mb-2">
                      Update Status
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateTicketStatus(ticket.id, status, editingNotes[ticket.id] || '')}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                            ticket.status === status
                              ? `${TICKET_CHIP[status]} ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#1a1d22] ring-blue-400`
                              : `${TICKET_CHIP[status]} opacity-70 hover:opacity-100`
                          }`}
                        >
                          {formatStatusLabel(status)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => updateTicketStatus(ticket.id, 'IN_PROGRESS', editingNotes[ticket.id] || '')}
                      className="flex-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 px-3 py-2 text-xs font-semibold transition-all"
                    >
                      Start Work
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTicketStatus(ticket.id, 'RESOLVED', editingNotes[ticket.id] || '')}
                      className="flex-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-300 px-3 py-2 text-xs font-semibold transition-all"
                    >
                      Mark Resolved
                    </button>
                    <button
                      type="button"
                      onClick={() => updateTicketStatus(ticket.id, 'CLOSED', editingNotes[ticket.id] || '')}
                      className="flex-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 dark:bg-neutral-800/50 dark:hover:bg-neutral-800 dark:text-neutral-300 px-3 py-2 text-xs font-semibold transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DashboardPanel>
  );
}

export function AnnouncementsTab({
  annSaved,
  newAnn,
  setNewAnn,
  handlePublishAnn,
  announcements,
  deleteAnnouncement
}) {
  return (
    <div className="space-y-5">
      {annSaved ? (
        <div className="alert-success">
          Announcement published and visible to all students.
        </div>
      ) : null}

      <DashboardPanel
        title="Publish New Announcement"
        subtitle="Share urgent notices and semester updates from the dashboard."
      >
        <form onSubmit={handlePublishAnn} className="space-y-4">
          <div>
            <label htmlFor="ann-title" className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-[#e7f3d8]/76">
              Title
            </label>
            <input
              id="ann-title"
              type="text"
              className="input-field"
              placeholder="Example: Water pump maintenance this Friday"
              value={newAnn.title}
              onChange={(event) => setNewAnn((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </div>

          <div>
            <label htmlFor="ann-body" className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-[#e7f3d8]/76">
              Message
            </label>
            <textarea
              id="ann-body"
              rows={4}
              className="input-field resize-none"
              placeholder="Write the full announcement here..."
              value={newAnn.body}
              onChange={(event) => setNewAnn((prev) => ({ ...prev, body: event.target.value }))}
              required
            />
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="w-full max-w-sm">
              <label htmlFor="ann-expires" className="mb-2 block text-sm font-semibold text-neutral-700 dark:text-[#e7f3d8]/76">
                Expiry Date (optional)
              </label>
              <input
                id="ann-expires"
                type="date"
                className="input-field"
                value={newAnn.expiresAt}
                onChange={(event) => setNewAnn((prev) => ({ ...prev, expiresAt: event.target.value }))}
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
      </DashboardPanel>

      <DashboardPanel
        title="Published Announcements"
        subtitle="Review currently published student-facing messages."
      >
        {announcements.length === 0 ? (
          <p className="py-4 text-sm text-neutral-500">No announcements published yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="rounded-[24px] border border-[#d6e2be] bg-[linear-gradient(180deg,#fffdee_0%,#f7fbdc_100%)] p-4 dark:border-[rgba(226,251,206,0.12)] dark:bg-[linear-gradient(180deg,#12473d_0%,#08271f_100%)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-[#fffdee]">{announcement.title}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-neutral-400 dark:text-[#dcebd0]/42">
                      <span>Published: {announcement.publishedAt}</span>
                      {announcement.expiresAt ? <span>Expires: {announcement.expiresAt}</span> : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteAnnouncement(announcement.id)}
                    className="rounded-full bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 dark:bg-[rgba(133,67,50,0.34)] dark:text-[#fac2be] dark:hover:bg-[rgba(133,67,50,0.46)]"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-[#dcebd0]/64">
                  {announcement.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </DashboardPanel>
    </div>
  );
}

const bookingShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  studentName: PropTypes.string,
  studentEmail: PropTypes.string,
  hostelName: PropTypes.string,
  roomNumber: PropTypes.string,
  status: PropTypes.string,
  studentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
});

BookingsPaymentsTab.propTypes = {
  pendingPayments: PropTypes.arrayOf(bookingShape).isRequired,
  filteredBookings: PropTypes.arrayOf(bookingShape).isRequired,
  bookingSearch: PropTypes.string.isRequired,
  setBookingSearch: PropTypes.func.isRequired,
  STATUS_CHIP: PropTypes.object.isRequired,
  formatStatusLabel: PropTypes.func.isRequired,
  renderBookingActions: PropTypes.func.isRequired
};

StudentsTab.propTypes = {
  filteredStudents: PropTypes.arrayOf(bookingShape).isRequired,
  studentSearch: PropTypes.string.isRequired,
  setStudentSearch: PropTypes.func.isRequired,
  exportDefaultersCSV: PropTypes.func.isRequired,
  STATUS_CHIP: PropTypes.object.isRequired,
  formatStatusLabel: PropTypes.func.isRequired
};

MaintenanceTab.propTypes = {
  tickets: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      category: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      adminNotes: PropTypes.string,
      createdAt: PropTypes.string,
      resolvedAt: PropTypes.string,
      studentId: PropTypes.number,
      studentName: PropTypes.string,
      roomId: PropTypes.number
    })
  ).isRequired,
  openTickets: PropTypes.array.isRequired,
  updateTicketStatus: PropTypes.func.isRequired,
  PRIORITY_CHIP: PropTypes.object.isRequired,
  TICKET_CHIP: PropTypes.object.isRequired,
  formatStatusLabel: PropTypes.func.isRequired
};

AnnouncementsTab.propTypes = {
  annSaved: PropTypes.bool.isRequired,
  newAnn: PropTypes.shape({
    title: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    expiresAt: PropTypes.string
  }).isRequired,
  setNewAnn: PropTypes.func.isRequired,
  handlePublishAnn: PropTypes.func.isRequired,
  announcements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      title: PropTypes.string,
      body: PropTypes.string,
      expiresAt: PropTypes.string,
      publishedAt: PropTypes.string,
      preview: PropTypes.string
    })
  ).isRequired,
  deleteAnnouncement: PropTypes.func.isRequired
};
