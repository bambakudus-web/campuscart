const API_BASE = 'http://localhost:5000/api';

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

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  getProfile: () => request('/auth/me', { auth: true }),

  // Listings
  getListings: (query = '') => request(`/listings${query}`),
  getMyListings: () => request('/listings/mine', { auth: true }),
  createListing: (payload) => request('/listings', { method: 'POST', body: payload, auth: true }),
  updateListing: (id, payload) => request(`/listings/${id}`, { method: 'PUT', body: payload, auth: true }),
  deleteListing: (id) => request(`/listings/${id}`, { method: 'DELETE', auth: true })
};
