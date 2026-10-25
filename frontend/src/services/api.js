// ---------------------------------------------------------------------------
// API service layer. Every page imports from here — never calls axios or the
// mock directly. When the real backend is ready, flip VITE_USE_MOCK to false
// and these same functions talk to Express via axios.
// ---------------------------------------------------------------------------

import axios from 'axios';
import * as mock from './mockApi.js';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const http = axios.create({ baseURL: API_URL, timeout: 15000 });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('hct_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Normalize any axios/mock error into a useful message. */
export const getErrorMessage = (error) => {
  if (!error) return 'Something went wrong. Please try again.';
  if (error.response) return error.response.data?.message || 'Something went wrong. Please try again.';
  if (error.request) return 'Cannot reach the server. Please check your connection.';
  return error.message || 'Something went wrong. Please try again.';
};

const unwrap = async (fn) => {
  try {
    return await fn();
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// ---- auth ------------------------------------------------------------------

export const authService = {
  login: (credentials) =>
    unwrap(async () => {
      if (USE_MOCK) {
        const res = await mock.login(credentials);
        return res.data;
      }
      const { data } = await http.post('/auth/login', credentials);
      return data.data;
    }),

  register: (payload) =>
    unwrap(async () => {
      if (USE_MOCK) {
        const res = await mock.register(payload);
        return res.data;
      }
      const { data } = await http.post('/auth/register', payload);
      return data.data;
    }),

  me: () =>
    unwrap(async () => {
      if (USE_MOCK) {
        const res = await mock.getMe(localStorage.getItem('hct_token'));
        return res.data;
      }
      const { data } = await http.get('/auth/me');
      return data.data;
    }),

  updateProfile: (payload) =>
    unwrap(async () => {
      if (USE_MOCK) {
        const res = await mock.updateProfile(localStorage.getItem('hct_token'), payload);
        return res.data;
      }
      const { data } = await http.put('/auth/profile', payload);
      return data.data;
    }),
};

// ---- complaints ------------------------------------------------------------

export const complaintService = {
  create: (payload) =>
    unwrap(async () => {
      if (USE_MOCK) {
        const res = await mock.createComplaint(localStorage.getItem('hct_token'), payload);
        return res.data;
      }
      const { data } = await http.post('/complaints', payload);
      return data.data;
    }),

  getMy: () =>
    unwrap(async () => {
      if (USE_MOCK) {
        const res = await mock.listMyComplaints(localStorage.getItem('hct_token'));
        return res.data;
      }
      const { data } = await http.get('/complaints/my');
      return data.data;
    }),

  getAll: () =>
    unwrap(async () => {
      if (USE_MOCK) {
        const res = await mock.listAllComplaints();
        return res.data;
      }
      const { data } = await http.get('/complaints/all');
      return data.data;
    }),

  getById: (id) =>
    unwrap(async () => {
      if (USE_MOCK) {
        const res = await mock.getComplaint(localStorage.getItem('hct_token'), id);
        return res.data;
      }
      const { data } = await http.get(`/complaints/${id}`);
      return data.data;
    }),

  update: (id, payload) =>
    unwrap(async () => {
      if (USE_MOCK) {
        const res = await mock.updateComplaint(localStorage.getItem('hct_token'), id, payload);
        return res.data;
      }
      const { data } = await http.put(`/complaints/${id}`, payload);
      return data.data;
    }),

  feedback: (id, payload) => unwrap(async () => {
    if (USE_MOCK) return (await mock.submitFeedback(localStorage.getItem('hct_token'), id, payload)).data;
    return (await http.post(`/complaints/${id}/feedback`, payload)).data.data;
  }),
  reopen: (id, payload) => unwrap(async () => {
    if (USE_MOCK) return (await mock.reopenComplaint(localStorage.getItem('hct_token'), id, payload)).data;
    return (await http.post(`/complaints/${id}/reopen`, payload)).data.data;
  }),
  remove: (id) =>
    unwrap(async () => {
      if (USE_MOCK) {
        const res = await mock.deleteComplaint(localStorage.getItem('hct_token'), id);
        return res.data;
      }
      const { data } = await http.delete(`/complaints/${id}`);
      return data.data;
    }),
};

// ---- manager-only ----------------------------------------------------------

export const managerService = {
  getStudents: () =>
    unwrap(async () => {
      if (USE_MOCK) {
        const res = await mock.listStudents();
        return res.data;
      }
      const { data } = await http.get('/students');
      return data.data;
    }),

  getManagers: () =>
    unwrap(async () => {
      if (USE_MOCK) {
        const res = await mock.listManagers();
        return res.data;
      }
      const { data } = await http.get('/students/managers');
      return data.data;
    }),

  getAnalytics: () =>
    unwrap(async () => {
      if (USE_MOCK) {
        const res = await mock.getAnalytics();
        return res.data;
      }
      const { data } = await http.get('/analytics');
      return data.data;
    }),
};
