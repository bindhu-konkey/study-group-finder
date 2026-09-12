import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create Axios instance
const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Bearer token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studysync_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for consistent error extraction
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg =
      error.response?.data?.error ||
      (error.response?.data?.details ? error.response.data.details.join(', ') : error.message) ||
      'An unexpected error occurred';
    return Promise.reject(new Error(errorMsg));
  }
);

export const api = {
  // Module 1: Authentication & User Management
  auth: {
    register: (userData) => client.post('/auth/register', userData),
    login: (credentials) => client.post('/auth/login', credentials),
    logout: () => client.post('/auth/logout'),
    getMe: () => client.get('/auth/me'),
    getProfile: () => client.get('/users/profile'),
    updateProfile: (profileData) => client.put('/users/profile', profileData),
  },

  // Module 2 & 3: Group Creation, Discovery & Membership
  groups: {
    getAll: () => client.get('/groups'),
    getById: (id) => client.get(`/groups/${id}`),
    create: (groupData) => client.post('/groups', groupData),
    update: (id, groupData) => client.put(`/groups/${id}`, groupData),
    delete: (id) => client.delete(`/groups/${id}`),
    join: (id) => client.post(`/groups/${id}/join`),
    leave: (id) => client.post(`/groups/${id}/leave`),
    getMyGroups: () => client.get('/groups/my-groups'),
    search: (params = {}) => {
      const queryParams = new URLSearchParams();
      if (params.query) queryParams.append('query', params.query);
      if (params.subject && params.subject !== 'All') queryParams.append('subject', params.subject);
      if (params.branch && params.branch !== 'All') queryParams.append('branch', params.branch);
      if (params.semester && params.semester !== 'All') queryParams.append('semester', params.semester);
      if (params.availability) queryParams.append('availability', params.availability);
      return client.get(`/groups/search?${queryParams.toString()}`);
    },
  },

  // Module 4: Scheduling & Location / Meeting Links
  sessions: {
    getByGroup: (groupId) => client.get(`/groups/${groupId}/sessions`),
    create: (groupId, sessionData) => client.post(`/groups/${groupId}/sessions`, sessionData),
    update: (id, sessionData) => client.put(`/sessions/${id}`, sessionData),
    delete: (id) => client.delete(`/sessions/${id}`),
    getMySessions: () => client.get('/sessions/my-sessions'),
  },

  // Alias for backward compatibility
  meetings: {
    getByGroup: (groupId) => client.get(`/groups/${groupId}/meetings`),
    create: (groupId, meetingData) => client.post(`/groups/${groupId}/meetings`, meetingData),
    update: (id, meetingData) => client.put(`/meetings/${id}`, meetingData),
    delete: (id) => client.delete(`/meetings/${id}`),
  },

  // Module 5: Dashboard Overview
  dashboard: {
    getOverview: () => client.get('/dashboard/overview'),
  },

  // Module 5: In-App Notifications
  notifications: {
    getAll: () => client.get('/notifications'),
    markRead: (id) => client.put(`/notifications/${id}/read`),
    markAllRead: () => client.put('/notifications/read-all'),
  },
};

export default api;
