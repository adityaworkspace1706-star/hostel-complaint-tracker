// ---------------------------------------------------------------------------
// Mock API — simulates the Express + MongoDB backend in the browser using
// localStorage. It mirrors the real API contract:
//   success responses: { success: true, message, data }
//   error responses:   { success: false, message }
// ---------------------------------------------------------------------------

import {
  SEED_USERS,
  SEED_COMPLAINTS,
} from '../data/mockData.js';
import {
  COMPLAINT_CATEGORIES,
  HOSTELS,
  getPriorityForIssue,
} from '../utils/constants.js';
import { ROOM_PATTERN } from '../utils/constants.js';

const DB_KEY = 'hct_mock_db_v1';

const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 250));

const ok = (message, data) => ({ success: true, message, data });
const fail = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// ---- persistence -----------------------------------------------------------

function readDb() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fall through and reseed */
  }
  const db = { users: SEED_USERS, complaints: SEED_COMPLAINTS, seq: SEED_COMPLAINTS.length };
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  return db;
}

function writeDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Never leak passwords — strip them from every outgoing user object.
const publicUser = ({ password: _password, ...user }) => user;

// ---- auth helpers ----------------------------------------------------------

function tokenUserId(token) {
  if (!token || !token.startsWith('mock.')) return null;
  const [, userId] = token.split('.');
  return userId || null;
}

// ---- authentication --------------------------------------------------------

export async function login({ email, password }) {
  await delay();
  const db = readDb();
  const user = db.users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user || user.password !== password) throw fail(401, 'Invalid email or password.');
  const token = `mock.${user._id}.${Date.now()}`;
  return ok('Login successful', { user: publicUser(user), token });
}

export async function register(data) {
  await delay();
  const db = readDb();
  if (db.users.some((u) => u.email.toLowerCase() === String(data.email).toLowerCase())) {
    throw fail(409, 'An account with this email already exists.');
  }
  if (!HOSTELS.includes(data.hostel)) throw fail(400, 'Please select a valid hostel.');
  if (!ROOM_PATTERN.test(data.room || '')) throw fail(400, 'Invalid room number.');

  // Students can NEVER self-register as managers — role is forced server-side.
  const user = {
    _id: `u_${Date.now().toString(36)}`,
    name: data.name.trim(),
    email: data.email.toLowerCase(),
    password: data.password,
    role: 'student',
    hostel: data.hostel,
    room: data.room,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeDb(db);
  const token = `mock.${user._id}.${Date.now()}`;
  return ok('Account created successfully', { user: publicUser(user), token });
}

export async function getMe(token) {
  await delay(250);
  const userId = tokenUserId(token);
  const user = readDb().users.find((u) => u._id === userId);
  if (!user) throw fail(401, 'Session expired. Please log in again.');
  return ok('OK', { user: publicUser(user) });
}

export async function updateProfile(token, data) {
  await delay();
  const userId = tokenUserId(token);
  const db = readDb();
  const user = db.users.find((u) => u._id === userId);
  if (!user) throw fail(401, 'Session expired. Please log in again.');

  const emailTaken = db.users.some(
    (u) => u._id !== userId && u.email.toLowerCase() === String(data.email).toLowerCase()
  );
  if (emailTaken) throw fail(409, 'This email is already in use.');

  // Role can never be changed by the user themselves.
  Object.assign(user, {
    name: data.name?.trim() || user.name,
    email: data.email?.toLowerCase() || user.email,
    ...(user.role === 'student'
      ? { hostel: data.hostel || user.hostel, room: data.room || user.room }
      : {}),
    updatedAt: new Date().toISOString(),
  });
  writeDb(db);
  return ok('Profile updated successfully', { user: publicUser(user) });
}

// ---- complaints ------------------------------------------------------------

const nextComplaintId = (db) => {
  const num = db.seq + 1;
  db.seq = num;
  return `CMP-${String(num).padStart(4, '0')}`;
};

export async function listMyComplaints(token) {
  await delay();
  const userId = tokenUserId(token);
  const complaints = readDb().complaints.filter((c) => c.studentId === userId);
  return ok('OK', { complaints });
}

export async function listAllComplaints() {
  await delay();
  return ok('OK', { complaints: readDb().complaints });
}

export async function getComplaint(token, id) {
  await delay(300);
  const userId = tokenUserId(token);
  const db = readDb();
  const user = db.users.find((u) => u._id === userId);
  if (!user) throw fail(401, 'Session expired. Please log in again.');
  const complaint = db.complaints.find((c) => c._id === id);
  if (!complaint) throw fail(404, 'Complaint not found.');
  if (user.role !== 'manager' && complaint.studentId !== userId) {
    throw fail(403, 'Not authorized.');
  }
  return ok('OK', { complaint });
}

export async function createComplaint(token, payload) {
  await delay();
  const db = readDb();
  const userId = tokenUserId(token);
  const user = db.users.find((u) => u._id === userId);
  if (!user) throw fail(401, 'Session expired. Please log in again.');
  if (user.role !== 'student') throw fail(403, 'Only students can file complaints');

  const category = COMPLAINT_CATEGORIES[payload.category];
  if (!category) throw fail(400, 'Invalid complaint category.');
  if (!category.issues[payload.issue]) throw fail(400, 'Invalid issue for the selected category.');
  if (!HOSTELS.includes(payload.hostel)) throw fail(400, 'Please select a valid hostel.');
  if (!ROOM_PATTERN.test(payload.room || '')) throw fail(400, 'Invalid room number.');

  // Priority is derived from the issue mapping — never trusted from the client.
  const complaint = {
    _id: `c_${Date.now().toString(36)}`,
    complaintId: nextComplaintId(db),
    studentId: user._id,
    studentName: user.name,
    category: payload.category,
    issue: payload.issue,
    description: payload.description.trim(),
    hostel: payload.hostel,
    room: payload.room,
    priority: getPriorityForIssue(payload.category, payload.issue),
    status: 'pending',
    managerComment: '',
    assignedTo: '',
    images: Array.isArray(payload.images) ? payload.images : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    resolvedAt: null,
  };
  db.complaints.unshift(complaint);
  writeDb(db);
  return ok('Complaint submitted successfully', { complaint });
}

export async function updateComplaint(token, id, payload) {
  await delay();
  const db = readDb();
  const userId = tokenUserId(token);
  const user = db.users.find((u) => u._id === userId);
  if (!user) throw fail(401, 'Session expired. Please log in again.');

  const complaint = db.complaints.find((c) => c._id === id);
  if (!complaint) throw fail(404, 'Complaint not found.');

  if (user.role !== 'manager') {
    // Mirror the real backend: students edit only their own pending
    // complaint's content — never priority/status/comments/assignment.
    if (complaint.studentId !== userId) throw fail(403, 'Not authorized.');
    if (complaint.status !== 'pending') {
      throw fail(400, 'Only pending complaints can be edited');
    }
    if (payload.status !== undefined) {
      throw fail(400, 'Only a manager can change the status of a complaint.');
    }
    if (payload.priority !== undefined) {
      throw fail(400, 'Priority is assigned automatically and can only be changed by a manager.');
    }
    if (payload.managerComment !== undefined) {
      throw fail(400, 'Only a manager can comment on a complaint.');
    }
    if (payload.assignedTo !== undefined) {
      throw fail(400, 'Only a manager can assign a complaint.');
    }
    if (payload.category) complaint.category = payload.category;
    if (payload.issue) complaint.issue = payload.issue;
    if (payload.description) complaint.description = payload.description.trim();
    if (payload.hostel) complaint.hostel = payload.hostel;
    if (payload.room) complaint.room = payload.room;
    if (payload.category || payload.issue) {
      complaint.priority = getPriorityForIssue(complaint.category, complaint.issue);
    }
    complaint.updatedAt = new Date().toISOString();
    writeDb(db);
    return ok('Complaint updated successfully', { complaint });
  }

  if (payload.status && ['pending', 'in_progress', 'resolved', 'rejected'].includes(payload.status)) {
    complaint.status = payload.status;
    if (payload.status === 'resolved' && !complaint.resolvedAt) {
      complaint.resolvedAt = new Date().toISOString();
    }
    if (payload.status !== 'resolved') complaint.resolvedAt = null;
  }
  if (payload.priority && ['low', 'medium', 'high', 'critical'].includes(payload.priority)) {
    complaint.priority = payload.priority; // manager override
  }
  if (typeof payload.managerComment === 'string') complaint.managerComment = payload.managerComment;
  if (typeof payload.assignedTo === 'string') complaint.assignedTo = payload.assignedTo;

  complaint.updatedAt = new Date().toISOString();
  writeDb(db);
  return ok('Complaint updated successfully', { complaint });
}

export async function deleteComplaint(token, id) {
  await delay();
  const db = readDb();
  const userId = tokenUserId(token);
  const user = db.users.find((u) => u._id === userId);
  if (!user) throw fail(401, 'Session expired. Please log in again.');
  const idx = db.complaints.findIndex((c) => c._id === id);
  if (idx === -1) throw fail(404, 'Complaint not found.');
  if (user.role !== 'manager') {
    if (db.complaints[idx].studentId !== userId) throw fail(403, 'Not authorized.');
    if (db.complaints[idx].status !== 'pending') {
      throw fail(400, 'Only pending complaints can be deleted');
    }
  }
  db.complaints.splice(idx, 1);
  writeDb(db);
  return ok('Complaint deleted', {});
}

// ---- manager: students -----------------------------------------------------

export async function listStudents() {
  await delay();
  const db = readDb();
  const students = db.users
    .filter((u) => u.role === 'student')
    .map((s) => {
      const mine = db.complaints.filter((c) => c.studentId === s._id);
      return {
        ...publicUser(s),
        stats: {
          total: mine.length,
          pending: mine.filter((c) => c.status === 'pending').length,
          inProgress: mine.filter((c) => c.status === 'in_progress').length,
          resolved: mine.filter((c) => c.status === 'resolved').length,
          rejected: mine.filter((c) => c.status === 'rejected').length,
        },
      };
    });
  return ok('OK', { students });
}

export async function listManagers() {
  await delay(200);
  const managers = readDb()
    .users.filter((u) => u.role === 'manager')
    .map(publicUser);
  return ok('OK', { managers });
}

// ---- manager: analytics ----------------------------------------------------

export async function getAnalytics() {
  await delay();
  const db = readDb();
  const complaints = db.complaints;

  const byStatus = {};
  complaints.forEach((c) => {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1;
  });

  const byPriority = {};
  complaints.forEach((c) => {
    byPriority[c.priority] = (byPriority[c.priority] || 0) + 1;
  });

  const byCategory = {};
  complaints.forEach((c) => {
    byCategory[c.category] = (byCategory[c.category] || 0) + 1;
  });

  const byIssue = {};
  complaints.forEach((c) => {
    const key = `${c.issue} (${c.category})`;
    byIssue[key] = (byIssue[key] || 0) + 1;
  });

  // Daily counts for the last 14 days
  const days = [];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    const count = complaints.filter((c) => {
      const created = new Date(c.createdAt);
      return created >= d && created < next;
    }).length;
    days.push({ date: d.toISOString().slice(0, 10), count });
  }

  const resolved = complaints.filter((c) => c.status === 'resolved');
  const resolutionTimes = resolved
    .map((c) => (new Date(c.resolvedAt) - new Date(c.createdAt)) / (1000 * 60 * 60 * 24))
    .filter((n) => Number.isFinite(n));

  return ok('OK', {
    analytics: {
      total: complaints.length,
      byStatus,
      byPriority,
      byCategory,
      byIssue,
      overTime: days,
      resolution: {
        resolved: resolved.length,
        rejected: complaints.filter((c) => c.status === 'rejected').length,
        resolutionRate: complaints.length
          ? Math.round((resolved.length / complaints.length) * 100)
          : 0,
        avgResolutionDays: resolutionTimes.length
          ? Number((resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length).toFixed(1))
          : 0,
      },
    },
  });
}

const ownedResolved = (token, id) => {
  const db = readDb();
  const userId = tokenUserId(token);
  const user = db.users.find(u => u._id === userId);
  if (!user || user.role !== 'student') throw fail(403, 'Students only');
  const complaint = db.complaints.find(c => c._id === id);
  if (!complaint) throw fail(404, 'Complaint not found');
  if (complaint.studentId !== userId) throw fail(403, 'Not authorized');
  if (complaint.status !== 'resolved') throw fail(400, 'Complaint must be resolved');
  return { db, complaint };
};

export async function submitFeedback(token, id, { rating, comment = '' } = {}) {
  await delay();
  if (!Number.isInteger(rating) || rating < 1 || rating > 5 || typeof comment !== 'string' || comment.length > 500)
    throw fail(400, 'Rating must be 1–5 and comment at most 500 characters');
  const { db, complaint } = ownedResolved(token, id);
  if (complaint.feedbackRating != null) throw fail(400, 'Feedback already submitted');
  complaint.feedbackRating = rating;
  complaint.feedbackComment = comment.trim();
  complaint.updatedAt = new Date().toISOString();
  writeDb(db);
  return ok('Feedback saved', { complaint });
}

export async function reopenComplaint(token, id, { reason } = {}) {
  await delay();
  if (typeof reason !== 'string' || !reason.trim() || reason.trim().length > 500)
    throw fail(400, 'Reopen reason must be 1–500 characters');
  const { db, complaint } = ownedResolved(token, id);
  complaint.status = 'pending';
  complaint.resolvedAt = null;
  complaint.reopenedAt = new Date().toISOString();
  complaint.reopenReason = reason.trim();
  complaint.feedbackRating = null;
  complaint.feedbackComment = '';
  complaint.updatedAt = new Date().toISOString();
  writeDb(db);
  return ok('Complaint reopened', { complaint });
}
