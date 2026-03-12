const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081').replace(/\/$/, '');

export { API_BASE_URL };

export async function apiRequest(path, { method = 'GET', body, headers } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    credentials: 'include'
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload?.message || payload?.error || `HTTP ${response.status}`;
    throw new Error(detail);
  }

  return payload;
}
