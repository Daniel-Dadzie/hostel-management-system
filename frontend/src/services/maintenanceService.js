import { apiRequest, getAuthHeaders } from './api.js';

/**
 * Fetch all maintenance tickets (admin only)
 */
export function listAdminMaintenanceTickets() {
  return apiRequest('/api/admin/maintenance-tickets', {
    headers: getAuthHeaders()
  });
}

/**
 * Fetch maintenance tickets by status (admin only)
 */
export function listAdminMaintenanceTicketsByStatus(status) {
  return apiRequest(`/api/admin/maintenance-tickets/by-status/${status}`, {
    headers: getAuthHeaders()
  });
}

/**
 * Get a specific maintenance ticket by ID (admin only)
 */
export function getAdminMaintenanceTicket(ticketId) {
  return apiRequest(`/api/admin/maintenance-tickets/${ticketId}`, {
    headers: getAuthHeaders()
  });
}

/**
 * Update a maintenance ticket's status and add admin notes (admin only)
 */
export function updateAdminMaintenanceTicket(ticketId, status, adminNotes = '') {
  return apiRequest(`/api/admin/maintenance-tickets/${ticketId}`, {
    method: 'PUT',
    body: {
      status,
      adminNotes
    },
    headers: getAuthHeaders()
  });
}
