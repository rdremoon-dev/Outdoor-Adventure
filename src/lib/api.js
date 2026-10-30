const defaultApiUrl = import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://outdoor-adventure-lpah.onrender.com';
const API_URL = (import.meta.env.VITE_API_URL || defaultApiUrl).replace(/\/$/, '');
export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(payload.message || 'Request failed. Please try again.');
  return payload;
}
export { API_URL };
