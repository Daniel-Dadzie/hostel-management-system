import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/**
 * RevenueChart - Displays a bar chart of revenue over time.
 * Shows monthly payment revenue for the last 12 months.
 */
export default function RevenueChart({ data = [], loading = false, error = null }) {
  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="space-y-3 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <div className="space-y-3 text-center">
          <p className="text-sm font-medium text-red-600 dark:text-red-300">Error loading revenue data</p>
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">No revenue data available</p>
      </div>
    );
  }

  // Transform data to ensure numeric values
  const chartData = data.map(item => ({
    ...item,
    revenueNumeric: typeof item.revenue === 'string' ? parseFloat(item.revenue) : (item.revenue || 0)
  }));

  // Calculate total revenue
  const totalRevenue = chartData.reduce((sum, item) => sum + item.revenueNumeric, 0);
  const avgRevenue = chartData.length > 0 ? (totalRevenue / chartData.length).toFixed(2) : 0;
  const maxRevenue = Math.max(...chartData.map(item => item.revenueNumeric), 0);

  <div className="w-full rounded-lg border border-neutral-200 bg-white p-4 sm:p-6 dark:border-neutral-700 dark:bg-neutral-900">
       <div className="mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
         <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Revenue Over Time</h3>
         <div className="text-sm text-neutral-600 dark:text-neutral-400">
           Last 12 months • Total: <span className="font-semibold text-primary-600">GHS {totalRevenue.toFixed(2)}</span>
         </div>
       </div>

       <div className="overflow-x-auto">
         <div className="min-w-[300px] sm:min-w-0">
           <ResponsiveContainer width="100%" height={240} className="sm:h-[320px]">
             <BarChart
               data={chartData}
               margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
             >
               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
               <XAxis
                 dataKey="monthDisplay"
                 tick={{ fontSize: 11 }}
                 angle={-45}
                 textAnchor="end"
                 height={50}
               />
               <YAxis
                 tick={{ fontSize: 11 }}
                 label={{ value: 'Revenue (GHS)', angle: -90, position: 'insideLeft' }}
                 width={50}
               />
               <Tooltip
                 contentStyle={{
                   backgroundColor: '#1f2937',
                   border: 'none',
                   borderRadius: '8px',
                   color: '#fff'
                 }}
                 formatter={(value) => [
                   `GHS ${typeof value === 'number' ? value.toFixed(2) : value}`,
                   'Revenue'
                 ]}
                 labelFormatter={(label) => `${label}`}
               />
               <Legend />
               <Bar
                 dataKey="revenueNumeric"
                 fill="#2563eb"
                 name="Revenue"
                 radius={[4, 4, 0, 0]}
                 isAnimationActive={true}
               />
             </BarChart>
           </ResponsiveContainer>
         </div>
       </div>

       <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-3">
         <div className="rounded-lg border border-blue-200 bg-blue-50 p-2 sm:p-3 dark:border-blue-800 dark:bg-blue-900/20">
           <p className="text-[10px] font-medium sm:text-xs text-blue-600 dark:text-blue-300">Total Revenue</p>
           <p className="mt-0.5 text-lg font-bold sm:mt-1 sm:text-xl text-blue-700 dark:text-blue-200">
             GHS {totalRevenue.toFixed(2)}
           </p>
         </div>
         <div className="rounded-lg border border-purple-200 bg-purple-50 p-2 sm:p-3 dark:border-purple-800 dark:bg-purple-900/20">
           <p className="text-[10px] font-medium sm:text-xs text-purple-600 dark:text-purple-300">Average/Month</p>
           <p className="mt-0.5 text-lg font-bold sm:mt-1 sm:text-xl text-purple-700 dark:text-purple-200">
             GHS {avgRevenue}
           </p>
         </div>
         <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 sm:p-3 dark:border-amber-800 dark:bg-amber-900/20">
           <p className="text-[10px] font-medium sm:text-xs text-amber-600 dark:text-amber-300">Peak Month</p>
           <p className="mt-0.5 text-lg font-bold sm:mt-1 sm:text-xl text-amber-700 dark:text-amber-200">
             GHS {maxRevenue.toFixed(2)}
           </p>
         </div>
       </div>
     </div>
}

RevenueChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string,
      monthDisplay: PropTypes.string,
      revenue: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string
};
