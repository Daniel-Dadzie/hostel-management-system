import { apiRequest, getAuthHeaders } from './api.js';

/**
 * Get occupancy analytics - roomsBooked vs roomsEmpty by hostel.
 * @returns {Promise<Object>} Occupancy data for each hostel
 */
export function getOccupancyAnalytics() {
  return apiRequest('/api/admin/analytics/occupancy', {
    headers: getAuthHeaders()
  });
}

/**
 * Get revenue analytics - total payments by month for the last 12 months.
 * @returns {Promise<Array>} List of monthly revenue data
 */
export function getRevenueAnalytics() {
  return apiRequest('/api/admin/analytics/revenue', {
    headers: getAuthHeaders()
  });
}

/**
 * Get summary statistics for the admin dashboard.
 * @returns {Promise<Object>} Summary statistics
 */
export function getAnalyticsSummary() {
  return apiRequest('/api/admin/analytics/summary', {
    headers: getAuthHeaders()
  });
}
