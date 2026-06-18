import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { DashboardPanel } from './AdminDashboardShared.jsx';

function occupancyBarColor(pct) {
  if (pct >= 90) return 'bg-red-500 dark:bg-red-500';
  if (pct >= 60) return 'bg-yellow-500 dark:bg-amber-500';
  return 'bg-emerald-500 dark:bg-emerald-500';
}

export default function AdminDashboardOverviewTab({
  occupancyByHostel,
  bookings,
  STATUS_CHIP,
  formatStatusLabel
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-2">
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
          <p className="py-4 text-sm text-neutral-400 dark:text-neutral-500">No room data yet.</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(occupancyByHostel).map(([name, data]) => {
              const pct = data.cap > 0 ? Math.round((data.occ / data.cap) * 100) : 0;
              const barColor = occupancyBarColor(pct);
              return (
                <div key={name} className="rounded-[22px] border border-[#d6e2be] bg-[linear-gradient(180deg,#fffdee_0%,#f7fbdc_100%)] p-4 dark:border-neutral-700 dark:bg-neutral-800">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-[#163b32] dark:text-neutral-100">
                      {name}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        pct >= 90
                          ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300'
                          : pct >= 60
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-amber-500/20 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                      }`}
                    >
                      {data.occ}/{data.cap} beds | {pct}%
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#dfeac7] dark:bg-neutral-900">
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
          <p className="py-4 text-sm text-neutral-400 dark:text-neutral-500">No bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 7).map((booking) => (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#d6e2be] bg-[linear-gradient(180deg,#fffdee_0%,#f7fbdc_100%)] px-4 py-3.5 transition-colors hover:bg-white/50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#163b32] dark:text-neutral-100">
                    {booking.studentName}
                  </p>
                  <p className="mt-1 truncate text-xs text-[#567165] dark:text-neutral-400">
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
  );
}

AdminDashboardOverviewTab.propTypes = {
  occupancyByHostel: PropTypes.object.isRequired,
  bookings: PropTypes.array.isRequired,
  STATUS_CHIP: PropTypes.object.isRequired,
  formatStatusLabel: PropTypes.func.isRequired
};