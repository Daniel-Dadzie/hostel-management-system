import { useEffect, useState } from 'react';
import OccupancyChart from './OccupancyChart.jsx';
import RevenueChart from './RevenueChart.jsx';
import { getOccupancyAnalytics, getRevenueAnalytics } from '../../services/analyticsService.js';

/**
 * AnalyticsDashboard - Main analytics component for admin dashboard.
 * Displays occupancy rates and revenue over time charts.
 */
export default function AnalyticsDashboard() {
  const [occupancyData, setOccupancyData] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [occupancyError, setOccupancyError] = useState(null);
  const [revenueError, setRevenueError] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  async function loadAnalyticsData() {
    setLoading(true);
    setOccupancyError(null);
    setRevenueError(null);

    try {
      // Load occupancy data - use overall stats
      const occupancyResponse = await getOccupancyAnalytics();
      if (occupancyResponse && occupancyResponse.overall) {
        setOccupancyData(occupancyResponse.overall);
      }
    } catch (err) {
      console.error('Error loading occupancy data:', err);
      setOccupancyError(err.message || 'Failed to load occupancy data');
    }

    try {
      // Load revenue data
      const revenueResponse = await getRevenueAnalytics();
      if (Array.isArray(revenueResponse)) {
        setRevenueData(revenueResponse);
      }
    } catch (err) {
      console.error('Error loading revenue data:', err);
      setRevenueError(err.message || 'Failed to load revenue data');
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Analytics</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Track occupancy rates and revenue trends across all hostels
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <OccupancyChart
          data={occupancyData}
          title="Overall Room Occupancy"
          loading={loading}
          error={occupancyError}
        />
        <RevenueChart
          data={revenueData}
          loading={loading}
          error={revenueError}
        />
      </div>

      {occupancyData && (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-900">
          <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
            Quick Stats
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Total Rooms</span>
              <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                {occupancyData.totalRooms}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Booked Rooms</span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {occupancyData.bookedRooms}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Empty Rooms</span>
              <span className="text-2xl font-bold text-neutral-500 dark:text-neutral-400">
                {occupancyData.emptyRooms}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Occupancy Rate</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {occupancyData.occupancyRate?.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={loadAnalyticsData}
        className="btn-secondary w-full sm:w-auto"
      >
        🔄 Refresh Data
      </button>
    </div>
  );
}
