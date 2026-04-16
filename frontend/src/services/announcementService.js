import { apiRequest, getAuthHeaders } from './api.js';

/**
 * Fetch all active announcements visible to students
 */
export function listAnnouncements() {
  return apiRequest('/api/announcements', {
    headers: getAuthHeaders()
  });
}

/**
 * Admin: Get all announcements (including inactive)
 */
export function listAllAnnouncements() {
  return apiRequest('/api/admin/announcements', {
    headers: getAuthHeaders()
  });
}

/**
 * Admin: Publish a new announcement
 */
export function publishAnnouncement(payload) {
  return apiRequest('/api/admin/announcements', {
    method: 'POST',
    body: payload,
    headers: getAuthHeaders()
  });
}

/**
 * Admin: Delete an announcement
 */
export function deleteAnnouncement(announcementId) {
  return apiRequest(`/api/admin/announcements/${announcementId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
}
