const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

async function apiRequest(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
      window.location.href = 'login.html';
    }
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

const api = {
  auth: {
    register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    getMe: () => apiRequest('/auth/me'),
    updateProfile: (body) => apiRequest('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),
  },
  food: {
    getAvailable: () => apiRequest('/food/available'),
    getMyListings: () => apiRequest('/food/my-listings'),
    getMyClaims: () => apiRequest('/food/my-claims'),
    getById: (id) => apiRequest(`/food/${id}`),
    create: (body) => apiRequest('/food', { method: 'POST', body: JSON.stringify(body) }),
    claim: (id) => apiRequest(`/food/${id}/claim`, { method: 'POST' }),
    markPickedUp: (id) => apiRequest(`/food/${id}/pickup`, { method: 'POST' }),
    cancel: (id) => apiRequest(`/food/${id}/cancel`, { method: 'POST' }),
  },
  notifications: {
    getAll: () => apiRequest('/notifications'),
    markAsRead: (id) => apiRequest(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllAsRead: () => apiRequest('/notifications/read-all', { method: 'PUT' }),
  },
  ai: {
    classify: (body) => apiRequest('/ai/classify', { method: 'POST', body: JSON.stringify(body) }),
    enrich: (body) => apiRequest('/ai/enrich', { method: 'POST', body: JSON.stringify(body) }),
    getRecommendations: () => apiRequest('/ai/recommendations'),
    getStats: () => apiRequest('/ai/stats'),
  },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString();
}

function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function statusBadge(status) {
  return `<span class="badge badge-${status}">${status.replace('_', ' ')}</span>`;
}

function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function redirectByRole() {
  const user = getUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  window.location.href = 'dashboard.html';
}
