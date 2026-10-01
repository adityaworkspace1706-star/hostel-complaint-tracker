// ---------------------------------------------------------------------------
// Full API integration tests — exercises the real Express app against a
// dedicated test database (never the dev DB). Skips automatically when
// MongoDB is not reachable so `npm test` still passes everywhere.
// ---------------------------------------------------------------------------
import './helpers/env.js';
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { seed, MANAGER_EMAIL, MANAGER_PASSWORD } from '../utils/seedManager.js';

const TEST_MONGO_URI =
  process.env.TEST_MONGO_URI || 'mongodb://127.0.0.1:27017/hostelcare_api_test';

let mongoAvailable = false;
let server = null;
let baseUrl = '';

const state = { complaintIds: [] };

const api = async (path, { method = 'GET', token, body } = {}) => {
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = { raw: text };
  }
  return { status: res.status, body: parsed, headers: res.headers };
};

/** Skips the test when MongoDB is not running. */
const it = (name, fn) =>
  test(name, async (t) => {
    if (!mongoAvailable) return t.skip('MongoDB is not available');
    return fn(t);
  });

before(async () => {
  try {
    await mongoose.connect(TEST_MONGO_URI, { serverSelectionTimeoutMS: 2500 });
    await mongoose.connection.db.dropDatabase();
    mongoAvailable = true;
  } catch (error) {
    console.log(`api.test: MongoDB unavailable (${error.message}) — integration tests skipped`);
    return;
  }
  const { default: app } = await import('../server.js');
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (mongoAvailable) {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
  }
});

// ---- auth ------------------------------------------------------------------

it('register returns { user, token } and always forces the student role', async () => {
  const res = await api('/api/auth/register', {
    method: 'POST',
    body: {
      name: '  Test Student ',
      email: ' Student@Example.com ',
      password: 'password123',
      hostel: 'A Block',
      room: '201',
      role: 'manager', // must be ignored
    },
  });
  assert.equal(res.status, 201);
  const { user, token } = res.body.data;
  assert.ok(token, 'token must be present');
  assert.equal(user.role, 'student');
  assert.equal(user.email, 'student@example.com');
  assert.equal(user.name, 'Test Student');
  assert.equal(user.password, undefined);
  assert.equal(user.hostel, 'A Block');
  assert.ok(user.createdAt);

  state.student = { token, email: user.email };
  state.studentName = user.name;
  state.studentId = user._id;
});

it('register rejects duplicates and invalid payloads', async () => {
  const duplicate = await api('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Someone Else',
      email: state.student.email,
      password: 'password123',
      hostel: 'A Block',
      room: '1',
    },
  });
  assert.equal(duplicate.status, 409);

  const badHostel = await api('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'X Y',
      email: 'other@example.com',
      password: 'password123',
      hostel: 'Z Block',
      room: '1',
    },
  });
  assert.equal(badHostel.status, 400);
  assert.match(badHostel.body.message, /hostel/i);

  const badRoom = await api('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'X Y',
      email: 'other@example.com',
      password: 'password123',
      hostel: 'A Block',
      room: 'room 9',
    },
  });
  assert.equal(badRoom.status, 400);
  assert.match(badRoom.body.message, /Room number/);
});

it('login returns { user, token } and rejects bad credentials', async () => {
  const bad = await api('/api/auth/login', {
    method: 'POST',
    body: { email: state.student.email, password: 'wrong-password' },
  });
  assert.equal(bad.status, 401);
  assert.equal(bad.body.message, 'Invalid email or password');

  const ok = await api('/api/auth/login', {
    method: 'POST',
    body: { email: state.student.email, password: 'password123' },
  });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.data.token);
  assert.equal(ok.body.data.user.email, state.student.email);
  state.student.token = ok.body.data.token;
});

it('seed creates a manager that can actually log in (single hash)', async () => {
  const first = await seed();
  assert.equal(first.created, true);

  // Idempotent: running twice does not duplicate or break the account
  const second = await seed();
  assert.equal(second.created, false);
  assert.equal(second.repaired, false);

  // Reproduce the old double-hash bug, then verify seed() repairs it
  const manager = await User.findOne({ email: MANAGER_EMAIL }).select('+password');
  assert.ok(manager, 'manager must exist after seeding');
  manager.password = await bcrypt.hash(MANAGER_PASSWORD, 10); // script-side hash…
  await manager.save(); // …then the model hook hashes again = old bug
  const repaired = await seed();
  assert.equal(repaired.repaired, true);

  const login = await api('/api/auth/login', {
    method: 'POST',
    body: { email: MANAGER_EMAIL, password: MANAGER_PASSWORD },
  });
  assert.equal(login.status, 200);
  assert.equal(login.body.data.user.role, 'manager');
  state.manager = { token: login.body.data.token };
});

// ---- complaints ------------------------------------------------------------

it('create auto-derives priority and returns a populated complaint', async () => {
  const res = await api('/api/complaints', {
    method: 'POST',
    token: state.student.token,
    body: {
      category: 'Plumbing',
      issue: 'Water leakage',
      description: 'Water is leaking under the washbasin and damaging the floor.',
      hostel: 'A Block',
      room: '201',
      priority: 'low', // must be ignored — priority is derived
      images: ['data:image/png;base64,AAAA'],
    },
  });
  assert.equal(res.status, 201);
  const complaint = res.body.data.complaint;
  assert.equal(complaint.complaintId, 'CMP-0001');
  assert.equal(complaint.priority, 'high'); // derived from issue, not 'low'
  assert.equal(complaint.status, 'pending');
  assert.equal(complaint.studentName, state.studentName);
  assert.equal(complaint.studentId.name, state.studentName); // populated object
  assert.deepEqual(complaint.images, ['data:image/png;base64,AAAA']);

  state.c1 = complaint;
  state.complaintIds.push(complaint.complaintId);
});

it('create enforces whitelists and authentication', async () => {
  const badIssue = await api('/api/complaints', {
    method: 'POST',
    token: state.student.token,
    body: {
      category: 'Plumbing',
      issue: 'Fan not working',
      description: 'This issue does not belong to the category at all.',
      hostel: 'A Block',
      room: '201',
    },
  });
  assert.equal(badIssue.status, 400);
  assert.match(badIssue.body.message, /valid issue/);

  const unauthenticated = await api('/api/complaints', {
    method: 'POST',
    body: {
      category: 'Plumbing',
      issue: 'Water leakage',
      description: 'Water leaking badly under the sink right now.',
      hostel: 'A Block',
      room: '201',
    },
  });
  assert.equal(unauthenticated.status, 401);
});

it('list endpoints return { complaints } with student info', async () => {
  const mine = await api('/api/complaints/my', { token: state.student.token });
  assert.equal(mine.status, 200);
  assert.ok(Array.isArray(mine.body.data.complaints));
  assert.equal(mine.body.data.complaints.length, 1);
  assert.equal(mine.body.data.complaints[0].studentName, state.studentName);

  const asStudent = await api('/api/complaints/all', { token: state.student.token });
  assert.equal(asStudent.status, 403);

  const asManager = await api('/api/complaints/all', { token: state.manager.token });
  assert.equal(asManager.status, 200);
  assert.ok(Array.isArray(asManager.body.data.complaints));
  const listed = asManager.body.data.complaints[0];
  assert.equal(listed.studentId.name, state.studentName);
  assert.equal(listed.studentId.email, state.student.email);
  assert.equal(listed.studentName, state.studentName);
});

it('detail endpoint enforces ownership and returns { complaint }', async () => {
  // Second student with their own complaint
  const register2 = await api('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Second Student',
      email: 'student2@example.com',
      password: 'password123',
      hostel: 'B Block',
      room: '105',
    },
  });
  assert.equal(register2.status, 201);
  state.student2 = { token: register2.body.data.token };

  const create2 = await api('/api/complaints', {
    method: 'POST',
    token: state.student2.token,
    body: {
      category: 'Electrical',
      issue: 'Fan not working',
      description: 'The ceiling fan in my room has stopped working completely.',
      hostel: 'B Block',
      room: '105',
    },
  });
  assert.equal(create2.status, 201);
  state.c2 = create2.body.data.complaint;
  state.complaintIds.push(state.c2.complaintId);

  // Own complaint
  const own = await api(`/api/complaints/${state.c1._id}`, { token: state.student.token });
  assert.equal(own.status, 200);
  assert.equal(own.body.data.complaint.complaintId, 'CMP-0001');

  // Someone else's complaint
  const foreign = await api(`/api/complaints/${state.c2._id}`, { token: state.student.token });
  assert.equal(foreign.status, 403);

  // Manager can view any
  const managerView = await api(`/api/complaints/${state.c2._id}`, {
    token: state.manager.token,
  });
  assert.equal(managerView.status, 200);
  assert.equal(managerView.body.data.complaint.studentName, 'Second Student');

  // Malformed id → clean 400 (no raw CastError text), unknown id → 404
  const malformed = await api('/api/complaints/not-an-id', { token: state.student.token });
  assert.equal(malformed.status, 400);
  assert.equal(malformed.body.message, 'Invalid value provided');

  const missing = await api(`/api/complaints/${new mongoose.Types.ObjectId()}`, {
    token: state.student.token,
  });
  assert.equal(missing.status, 404);
});

it('students can edit only their own pending complaint content', async () => {
  const priorityAttempt = await api(`/api/complaints/${state.c1._id}`, {
    method: 'PUT',
    token: state.student.token,
    body: { priority: 'critical' },
  });
  assert.equal(priorityAttempt.status, 400);
  assert.match(priorityAttempt.body.message, /manager/i);

  const statusAttempt = await api(`/api/complaints/${state.c1._id}`, {
    method: 'PUT',
    token: state.student.token,
    body: { status: 'resolved' },
  });
  assert.equal(statusAttempt.status, 400);

  const commentAttempt = await api(`/api/complaints/${state.c1._id}`, {
    method: 'PUT',
    token: state.student.token,
    body: { managerComment: 'nice try' },
  });
  assert.equal(commentAttempt.status, 400);

  const contentEdit = await api(`/api/complaints/${state.c1._id}`, {
    method: 'PUT',
    token: state.student.token,
    body: { description: 'Updated description: still leaking, please send help.' },
  });
  assert.equal(contentEdit.status, 200);
  assert.match(contentEdit.body.data.complaint.description, /Updated description/);
  assert.equal(contentEdit.body.data.complaint.priority, 'high'); // unchanged
});

it('resolvedAt is set on resolve and cleared on reopen', async () => {
  const start = await api(`/api/complaints/${state.c1._id}`, {
    method: 'PUT',
    token: state.manager.token,
    body: { status: 'in_progress' },
  });
  assert.equal(start.status, 200);
  assert.equal(start.body.data.complaint.status, 'in_progress');

  // Once in_progress the student can no longer edit
  const lateEdit = await api(`/api/complaints/${state.c1._id}`, {
    method: 'PUT',
    token: state.student.token,
    body: { description: 'Trying to edit after work started on this complaint.' },
  });
  assert.equal(lateEdit.status, 400);

  const invalidStatus = await api(`/api/complaints/${state.c1._id}`, {
    method: 'PUT',
    token: state.manager.token,
    body: { status: 'banana' },
  });
  assert.equal(invalidStatus.status, 400);

  const resolved = await api(`/api/complaints/${state.c1._id}`, {
    method: 'PUT',
    token: state.manager.token,
    body: { status: 'resolved', managerComment: 'Fixed the leak.' },
  });
  assert.equal(resolved.status, 200);
  assert.ok(resolved.body.data.complaint.resolvedAt, 'resolvedAt must be recorded');

  const reopened = await api(`/api/complaints/${state.c1._id}`, {
    method: 'PUT',
    token: state.manager.token,
    body: { status: 'pending' },
  });
  assert.equal(reopened.status, 200);
  assert.equal(reopened.body.data.complaint.status, 'pending');
  assert.equal(
    reopened.body.data.complaint.resolvedAt,
    null,
    'resolvedAt must be cleared when reopened'
  );

  const priorityOverride = await api(`/api/complaints/${state.c1._id}`, {
    method: 'PUT',
    token: state.manager.token,
    body: { priority: 'critical' },
  });
  assert.equal(priorityOverride.status, 200);
  assert.equal(priorityOverride.body.data.complaint.priority, 'critical');
});

it('list endpoints support optional pagination', async () => {
  for (const payload of [
    {
      category: 'Housekeeping',
      issue: 'Room not cleaned',
      description: 'The room has not been cleaned for over a week now.',
      hostel: 'B Block',
      room: '105',
    },
    {
      category: 'Carpentry',
      issue: 'Door lock damaged',
      description: 'The main door lock is jammed and cannot be secured.',
      hostel: 'B Block',
      room: '105',
    },
  ]) {
    const created = await api('/api/complaints', {
      method: 'POST',
      token: state.student2.token,
      body: payload,
    });
    assert.equal(created.status, 201);
    state.complaintIds.push(created.body.data.complaintId);
  }
  // state.complaintIds is now CMP-0001..CMP-0004

  const page1 = await api('/api/complaints/all?page=1&limit=2', { token: state.manager.token });
  assert.equal(page1.status, 200);
  assert.equal(page1.body.data.complaints.length, 2);
  assert.deepEqual(page1.body.data.pagination, {
    page: 1,
    limit: 2,
    total: 4,
    totalPages: 2,
  });

  const page3 = await api('/api/complaints/all?page=3&limit=2', { token: state.manager.token });
  assert.equal(page3.body.data.complaints.length, 0);
  assert.equal(page3.body.data.pagination.totalPages, 2);

  const unpaginated = await api('/api/complaints/all', { token: state.manager.token });
  assert.equal(unpaginated.body.data.complaints.length, 4);
  assert.equal(unpaginated.body.data.pagination, undefined);

  const mine = await api('/api/complaints/my?page=1&limit=5', { token: state.student.token });
  assert.equal(mine.body.data.complaints.length, 1);
  assert.equal(mine.body.data.pagination.total, 1);
});

it('deleted complaints never cause a duplicate complaint ID', async () => {
  // CMP-0001..CMP-0004 exist; delete CMP-0001 then create — the next ID must
  // be CMP-0005 (a count-based generator would hand out CMP-0004 again).
  const del = await api(`/api/complaints/${state.c1._id}`, {
    method: 'DELETE',
    token: state.student.token,
  });
  assert.equal(del.status, 200);

  const created = await api('/api/complaints', {
    method: 'POST',
    token: state.student2.token,
    body: {
      category: 'Internet / Wi-Fi',
      issue: 'Slow internet',
      description: 'Internet speed drops drastically after 6 PM every day.',
      hostel: 'B Block',
      room: '105',
    },
  });
  assert.equal(created.status, 201);
  const complaint = created.body.data.complaint;
  assert.equal(complaint.complaintId, 'CMP-0005');
  assert.ok(!state.complaintIds.includes(complaint.complaintId));
  state.c5 = complaint;

  const all = await api('/api/complaints/all', { token: state.manager.token });
  const ids = all.body.data.complaints.map((c) => c.complaintId);
  assert.equal(new Set(ids).size, ids.length, 'complaint IDs must be unique');
  state.remainingCount = ids.length; // 4
});

// ---- profile ---------------------------------------------------------------

it('profile updates return { user } and do not log the user out', async () => {
  const updated = await api('/api/auth/profile', {
    method: 'PUT',
    token: state.student.token,
    body: {
      name: 'Renamed Student',
      email: 'student1.new@example.com',
      hostel: 'B Block',
      room: '222',
    },
  });
  assert.equal(updated.status, 200);
  const { user } = updated.body.data;
  assert.ok(user, 'data.user must be present (frontend stores result.user)');
  assert.equal(user.name, 'Renamed Student');
  assert.equal(user.email, 'student1.new@example.com');

  // Same token still works — no forced logout
  const me = await api('/api/auth/me', { token: state.student.token });
  assert.equal(me.status, 200);
  assert.equal(me.body.data.user.name, 'Renamed Student');
  state.studentName = 'Renamed Student';

  // Login with the new email works; old email is gone; duplicates rejected
  const newLogin = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'student1.new@example.com', password: 'password123' },
  });
  assert.equal(newLogin.status, 200);

  const oldLogin = await api('/api/auth/login', {
    method: 'POST',
    body: { email: state.student.email, password: 'password123' },
  });
  assert.equal(oldLogin.status, 401);
  state.student.email = 'student1.new@example.com';

  const duplicate = await api('/api/auth/profile', {
    method: 'PUT',
    token: state.student.token,
    body: { email: 'student2@example.com' },
  });
  assert.equal(duplicate.status, 409);
});

// ---- manager endpoints -----------------------------------------------------

it('students endpoint returns { students } with complaint stats', async () => {
  const res = await api('/api/students', { token: state.manager.token });
  assert.equal(res.status, 200);
  const { students } = res.body.data;
  assert.ok(Array.isArray(students));
  assert.equal(students.length, 2);

  const second = students.find((s) => s.email === 'student2@example.com');
  assert.ok(second.stats);
  assert.equal(second.stats.total, state.remainingCount);
  assert.equal(typeof second.stats.pending, 'number');
  assert.equal(typeof second.stats.inProgress, 'number');
  assert.equal(second.password, undefined);

  const first = students.find((s) => s.email === state.student.email);
  assert.equal(first.stats.total, 0); // their only complaint was deleted

  const paged = await api('/api/students?page=1&limit=1', { token: state.manager.token });
  assert.equal(paged.body.data.students.length, 1);
  assert.deepEqual(paged.body.data.pagination, { page: 1, limit: 1, total: 2, totalPages: 2 });

  const asStudent = await api('/api/students', { token: state.student.token });
  assert.equal(asStudent.status, 403);
});

it('managers endpoint returns { managers }', async () => {
  const res = await api('/api/students/managers', { token: state.manager.token });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.data.managers));
  assert.equal(res.body.data.managers.length, 1);
  assert.equal(res.body.data.managers[0].email, MANAGER_EMAIL);
});

it('analytics returns the { analytics } shape the dashboard consumes', async () => {
  const res = await api('/api/analytics', { token: state.manager.token });
  assert.equal(res.status, 200);
  const { analytics } = res.body.data;
  assert.ok(analytics, 'data.analytics must be present');
  assert.equal(analytics.total, 4);
  assert.ok(analytics.byStatus.pending > 0);
  assert.equal(typeof analytics.byPriority, 'object');
  assert.ok(Object.keys(analytics.byCategory).length > 0);
  assert.ok(Object.keys(analytics.byIssue).some((k) => k.includes(' (')), 'issue (category) format');
  assert.equal(analytics.overTime.length, 14);
  assert.equal(typeof analytics.resolution.resolutionRate, 'number');
  assert.equal(typeof analytics.resolution.avgResolutionDays, 'number');
  assert.equal(typeof analytics.totalStudents, 'number');

  const asStudent = await api('/api/analytics', { token: state.student.token });
  assert.equal(asStudent.status, 403);
});

it('delete rules: owner-pending for students, anything for managers', async () => {
  // Put student2's first complaint in progress
  const c2 = await api('/api/complaints/all', { token: state.manager.token });
  const target = c2.body.data.complaints.find((c) => c.complaintId === 'CMP-0002');
  const start = await api(`/api/complaints/${target._id}`, {
    method: 'PUT',
    token: state.manager.token,
    body: { status: 'in_progress' },
  });
  assert.equal(start.status, 200);

  // Owner cannot delete a non-pending complaint
  const notPending = await api(`/api/complaints/${target._id}`, {
    method: 'DELETE',
    token: state.student2.token,
  });
  assert.equal(notPending.status, 400);

  // Non-owner cannot delete someone else's complaint
  const foreign = await api(`/api/complaints/${target._id}`, {
    method: 'DELETE',
    token: state.student.token,
  });
  assert.equal(foreign.status, 403);

  // Manager can delete any complaint
  const managerDelete = await api(`/api/complaints/${target._id}`, {
    method: 'DELETE',
    token: state.manager.token,
  });
  assert.equal(managerDelete.status, 200);
});
