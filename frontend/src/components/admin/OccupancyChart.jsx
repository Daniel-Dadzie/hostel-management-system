import PropTypes from 'prop-types';
import { Pie, PieChart, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * OccupancyChart - Displays a pie chart of room occupancy rates.
 * Shows booked vs empty rooms for a specific hostel or overall.
 */
export default function OccupancyChart({ data = null, title = 'Room Occupancy', loading = false, error = null }) {
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="space-y-3 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading occupancy data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <div className="space-y-3 text-center">
          <p className="text-sm font-medium text-red-600 dark:text-red-300">Error loading occupancy data</p>
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || (data.bookedRooms === 0 && data.emptyRooms === 0)) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">No occupancy data available</p>
      </div>
    );
  }

  const chartData = [
    { name: 'Booked Rooms', value: data.bookedRooms, fill: '#2b9a6d' },
    { name: 'Empty Rooms', value: data.emptyRooms, fill: '#e5e7eb' }
  ];

  const occupancyPercent = data.totalRooms > 0
    ? ((data.bookedRooms / data.totalRooms) * 100).toFixed(1)
    : 0;

  return (
    <div className="w-full rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h3>
        <div className="text-sm text-neutral-600 dark:text-neutral-400">
          {data.bookedRooms}/{data.totalRooms} rooms • <span className="font-semibold text-primary-600">{occupancyPercent}%</span> occupied
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(value) => [value, 'Rooms']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-900/20">
          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-300">Booked Rooms</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-200">{data.bookedRooms}</p>
        </div>
        <div className="rounded-lg border border-neutral-300 bg-neutral-100 p-3 dark:border-neutral-600 dark:bg-neutral-800">
          <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">Empty Rooms</p>
          <p className="mt-1 text-2xl font-bold text-neutral-700 dark:text-neutral-200">{data.emptyRooms}</p>
        </div>
      </div>
    </div>
  );
}

OccupancyChart.propTypes = {
  data: PropTypes.shape({
    bookedRooms: PropTypes.number,
    emptyRooms: PropTypes.number,
    totalRooms: PropTypes.number,
    occupancyRate: PropTypes.number
  }),
  title: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string
};
