import { apiRequest } from '../api/client.js';

const TOKEN_KEY = 'hms.token';

export function getAuthHeaders(token = localStorage.getItem(TOKEN_KEY)) {
  if (!token) {
    return {};
  }

  return { Authorization: `Bearer ${token}` };
}

export { apiRequest };
