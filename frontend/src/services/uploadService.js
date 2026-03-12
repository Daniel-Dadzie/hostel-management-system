import { apiRequest, getAuthHeaders } from './api.js';

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiRequest('/api/uploads/images', {
    method: 'POST',
    body: formData,
    headers: getAuthHeaders()
  });

  return response?.path || null;
}
