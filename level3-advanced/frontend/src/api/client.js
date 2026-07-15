// In production this comes from VITE_API_URL (set in Railway's frontend
// service variables); locally it falls back to the backend's default port.
const API_ROOT = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${API_ROOT}/api`;

// A small wrapper around fetch that:
// - prefixes the API base URL
// - attaches the JWT (if present) to every request
// - parses JSON and throws a readable error on failure
async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (auth) {
    const token = localStorage.getItem('campuscart_token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json();

  if (!res.ok || data.success === false) {
    const message = data.message || (data.errors && data.errors.join(', ')) || 'Something went wrong';
    throw new Error(message);
  }

  return data;
}

// Separate helper for multipart/form-data requests (image uploads).
// We deliberately don't set a Content-Type header here — the browser sets
// it automatically with the correct multipart boundary when the body is
// a FormData instance; setting it manually breaks the upload.
async function requestForm(path, { method = 'POST', formData, auth = true } = {}) {
  const headers = {};
  if (auth) {
    const token = localStorage.getItem('campuscart_token');
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: formData
  });

  const data = await res.json();

  if (!res.ok || data.success === false) {
    const message = data.message || (data.errors && data.errors.join(', ')) || 'Something went wrong';
    throw new Error(message);
  }

  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  getProfile: () => request('/auth/me', { auth: true }),
  updateProfile: (payload) => request('/auth/me', { method: 'PUT', body: payload, auth: true }),
  changePassword: (payload) => request('/auth/me/password', { method: 'PUT', body: payload, auth: true }),

  // Listings
  getListings: (query = '') => request(`/listings${query}`),
  getListingById: (id) => request(`/listings/${id}`),
  getMyListings: () => request('/listings/mine', { auth: true }),
  createListing: (payload, imageFile) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
    if (imageFile) formData.append('image', imageFile);
    return requestForm('/listings', { method: 'POST', formData });
  },
  updateListing: (id, payload, imageFile) => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
    if (imageFile) formData.append('image', imageFile);
    return requestForm(`/listings/${id}`, { method: 'PUT', formData });
  },
  deleteListing: (id) => request(`/listings/${id}`, { method: 'DELETE', auth: true }),

  // Messages / chat
  getConversations: () => request('/messages/conversations', { auth: true }),
  getConversationHistory: (listingId, buyerId) => request(`/messages/${listingId}/${buyerId}`, { auth: true })
};

// Base URL (without /api) for resolving relative image paths returned by the API
export const ASSET_BASE = API_ROOT;
