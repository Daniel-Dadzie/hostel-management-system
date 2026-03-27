import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import {
  FaArrowRight,
  FaBed,
  FaBuilding,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaFileAlt,
  FaGraduationCap,
  FaUniversity
} from 'react-icons/fa';
import { DashboardPanel } from './AdminDashboardShared.jsx';

const QUICK_ACTIONS = [
  { to: '/admin/hostels', label: 'Manage Hostels', icon: FaUniversity },
  { to: '/admin/rooms', label: 'Manage Rooms', icon: FaBed },
  { to: '/admin/students', label: 'Student Directory', icon: FaGraduationCap },
  { to: '/admin/bookings', label: 'Manage Bookings', icon: FaFileAlt },
  { to: '/admin/terms', label: 'Academic Terms', icon: FaCalendarAlt },
  { to: '/admin/payments', label: 'Manage Payments', icon: FaExclamationTriangle },
  { to: '/admin/reports', label: 'View Reports', icon: FaBuilding }
];

function occupancyBarColor(pct) {
  if (pct >= 90) return 'bg-red-500';
  if (pct >= 60) return 'bg-yellow-500';
  return 'bg-emerald-500';
}

export default function AdminDashboardOverviewTab({
  occupancyByHostel,
  bookings,
  hostels,
  rooms,
  approvedBookings,
  openTickets,
  STATUS_CHIP,
  formatStatusLabel
}) {
  const overviewStats = [
    { label: 'Hostels', value: hostels.length },
    { label: 'Rooms', value: rooms.length },
    { label: 'Approved', value: approvedBookings.length },
    { label: 'Open tickets', value: openTickets.length }
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.95fr]">
      <div className="space-y-5">
        <DashboardPanel
          title="Occupancy by Hostel"
          subtitle="Track where current room allocation pressure is highest."
          action={
            <Link to="/admin/rooms" className="btn-accent text-sm">
              View Rooms
            </Link>
          }
        >
          {Object.keys(occupancyByHostel).length === 0 ? (
            <p className="py-4 text-sm text-neutral-400">No room data yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(occupancyByHostel).map(([name, data]) => {
                const pct = data.cap > 0 ? Math.round((data.occ / data.cap) * 100) : 0;
                const barColor = occupancyBarColor(pct);
                return (
                  <div key={name} className="rounded-[22px] border border-[#edf2eb] bg-[#f8fbf8] p-4 dark:border-[#233129] dark:bg-[#151c18]">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                        {name}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          pct >= 90
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : pct >= 60
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}
                      >
                        {data.occ}/{data.cap} beds | {pct}%
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                      <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DashboardPanel>

        <DashboardPanel
          title="Recent Bookings"
          subtitle="Latest booking activity flowing into the admin queue."
          action={
            <Link to="/admin/bookings" className="btn-accent text-sm">
              View All
            </Link>
          }
        >
          {bookings.length === 0 ? (
            <p className="py-4 text-sm text-neutral-400">No bookings yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 7).map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#e8efe8] bg-[#fbfcfa] px-4 py-3.5 dark:border-[#223129] dark:bg-[#141a17]"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">
                      {booking.studentName}
                    </p>
                    <p className="mt-1 truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {booking.hostelName ?? 'Unassigned'} / Room {booking.roomNumber ?? '-'} / ID #{booking.id}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${STATUS_CHIP[booking.status] ?? STATUS_CHIP.CANCELLED}`}
                  >
                    {formatStatusLabel(booking.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </DashboardPanel>
      </div>

      <DashboardPanel
        title="Quick Actions"
        subtitle="Jump straight into the admin tools you use most."
        className="h-full"
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.to}
                to={action.to}
                className="group flex items-center justify-between rounded-[22px] border border-[#e6eee7] bg-[#f9fbf8] px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#cadccf] hover:bg-white hover:shadow-[0_12px_24px_rgba(15,23,42,0.06)] dark:border-[#223129] dark:bg-[#141b18] dark:hover:border-[#315242] dark:hover:bg-[#16211c]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9f4ed] text-[#0f6b46] dark:bg-[#163324] dark:text-[#7ad0a6]">
                    <Icon className="text-sm" />
                  </span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">{action.label}</span>
                </div>
                <FaArrowRight className="text-xs text-neutral-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#0f6b46] dark:group-hover:text-[#7ad0a6]" />
              </Link>
            );
          })}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {overviewStats.map((item) => (
            <div
              key={item.label}
              className="rounded-[22px] border border-dashed border-[#d9e5db] bg-[#f6faf5] px-4 py-3 dark:border-[#294036] dark:bg-[#121916]"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400 dark:text-neutral-500">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-black tracking-[-0.05em] text-neutral-900 dark:text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </DashboardPanel>
    </div>
  );
}

AdminDashboardOverviewTab.propTypes = {
  occupancyByHostel: PropTypes.object.isRequired,
  bookings: PropTypes.array.isRequired,
  hostels: PropTypes.array.isRequired,
  rooms: PropTypes.array.isRequired,
  approvedBookings: PropTypes.array.isRequired,
  openTickets: PropTypes.array.isRequired,
  STATUS_CHIP: PropTypes.object.isRequired,
  formatStatusLabel: PropTypes.func.isRequired
};
