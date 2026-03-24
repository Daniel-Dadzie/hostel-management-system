const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const REFRESH_TOKEN_KEY = 'hms.refreshToken';

const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
const getAccessToken = () => localStorage.getItem('hms.token');

const clearAuth = () => {
  localStorage.removeItem('hms.token');
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('hms.role');
  globalThis.location.href = '/login';
};

let isRefreshing = false;
let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
    credentials: 'include'
  });

  if (!response.ok) {
    clearAuth();
    throw new Error('Token refresh failed');
  }

  const data = await response.json();
  localStorage.setItem('hms.token', data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  return data.accessToken;
}

async function refreshTokenAndRetry(retryFn) {
  if (isRefreshing) {
    return refreshPromise.then(() => retryFn());
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      return await refreshAccessToken();
    } finally {
      isRefreshing = false;
    }
  })();

  await refreshPromise;
  return retryFn();
}

export { API_BASE_URL };

export async function apiRequest(path, { method = 'GET', body, headers } = {}) {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  let requestBody;
  if (body) {
    requestBody = isFormData ? body : JSON.stringify(body);
  }

  const doRequest = (token) =>
    fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers
      },
      body: requestBody,
      credentials: 'include'
    });

  const response = await doRequest(getAccessToken());
  let finalResponse = response;

  if (response.status === 401) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        finalResponse = await refreshTokenAndRetry(() => doRequest(getAccessToken()));
      } catch {
        clearAuth();
        throw new Error('Session expired. Please log in again.');
      }
    } else {
      clearAuth();
      throw new Error('Session expired. Please log in again.');
    }
  }

  const payload = await finalResponse.json().catch(() => null);
  if (!finalResponse.ok) {
    const detail = payload?.message || payload?.error || `HTTP ${finalResponse.status}`;
    throw new Error(detail);
  }

  return payload;
}
