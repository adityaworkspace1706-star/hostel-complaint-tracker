import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateComplaintData,
  validateComplaintUpdateData,
  validateLoginData,
  validateProfileData,
  validateRegisterData,
} from '../utils/validation.js';
import { getPriorityForIssue, isValidIssue } from '../constants/complaints.js';

const validRegister = {
  name: 'Aarav Sharma',
  email: 'aarav@example.com',
  password: 'password123',
  hostel: 'A Block',
  room: '201',
};

test('register validation accepts a valid payload', () => {
  assert.equal(validateRegisterData(validRegister), null);
});

test('register validation enforces field rules', () => {
  assert.match(validateRegisterData({ ...validRegister, name: 'A' }), /at least 2 characters/);
  assert.match(validateRegisterData({ ...validRegister, email: 'not-an-email' }), /valid email/);
  assert.match(validateRegisterData({ ...validRegister, password: 'short' }), /at least 8 characters/);
  assert.match(validateRegisterData({ ...validRegister, hostel: 'Z Block' }), /valid hostel/);
  assert.match(validateRegisterData({ ...validRegister, room: '201!!' }), /Room number/);
  assert.match(validateRegisterData({ ...validRegister, room: undefined }), /Room number/);
});

test('login validation requires email and password', () => {
  assert.equal(validateLoginData({ email: 'a@b.com', password: 'x' }), null);
  assert.match(validateLoginData({ password: 'x' }), /Email is required/);
  assert.match(validateLoginData({ email: 'a@b.com' }), /Password is required/);
});

test('profile validation only checks hostel/room for students', () => {
  assert.equal(validateProfileData({ name: 'New Name' }, 'student'), null);
  assert.equal(validateProfileData({ name: 'New Name' }, 'manager'), null);
  assert.match(validateProfileData({ hostel: 'Z Block' }, 'student'), /valid hostel/);
  // Managers have no editable hostel/room fields — unknown values are ignored.
  assert.equal(validateProfileData({ hostel: 'whatever' }, 'manager'), null);
  assert.match(validateProfileData({ email: 'bad' }, 'student'), /valid email/);
});

test('complaint creation enforces category/issue/hostel whitelists', () => {
  const valid = {
    category: 'Plumbing',
    issue: 'Water leakage',
    hostel: 'A Block',
    room: '201',
    description: 'Water is leaking under the washbasin.',
  };
  assert.equal(validateComplaintData(valid), null);
  assert.match(validateComplaintData({ ...valid, category: 'Gambling' }), /valid complaint category/);
  // Issue must belong to the selected category
  assert.match(validateComplaintData({ ...valid, issue: 'Fan not working' }), /valid issue/);
  assert.match(validateComplaintData({ ...valid, hostel: 'E Block' }), /valid hostel/);
  assert.match(validateComplaintData({ ...valid, room: 'room 1' }), /Room number/);
  assert.match(validateComplaintData({ ...valid, description: 'too short' }), /at least 10 characters/);
  assert.match(
    validateComplaintData({ ...valid, images: ['not-an-image'] }),
    /valid image data/
  );
});

test('priority is derived from the issue mapping (auto-prioritization)', () => {
  assert.equal(getPriorityForIssue('Electrical', 'Fan not working'), 'medium');
  assert.equal(getPriorityForIssue('Plumbing', 'Water leakage'), 'high');
  assert.equal(getPriorityForIssue('Common Facilities', 'Lift not working'), 'critical');
  assert.equal(getPriorityForIssue('Housekeeping', 'Dustbin not emptied'), 'low');
  assert.equal(getPriorityForIssue('Electrical', 'Unknown issue'), null);
  assert.equal(getPriorityForIssue('Nope', 'anything'), null);
  assert.ok(isValidIssue('Carpentry', 'Door lock damaged'));
  assert.ok(!isValidIssue('Carpentry', 'Lift not working'));
});

test('managers can change status and priority, invalid values rejected', () => {
  const opts = { role: 'manager' };
  assert.equal(validateComplaintUpdateData({ status: 'resolved', priority: 'critical' }, opts), null);
  assert.equal(validateComplaintUpdateData({ managerComment: 'ok', assignedTo: 'Staff' }, opts), null);
  assert.match(validateComplaintUpdateData({ status: 'banana' }, opts), /Invalid complaint status/);
  assert.match(validateComplaintUpdateData({ priority: 'urgent' }, opts), /Invalid priority/);
});

test('students cannot change priority, status, comments or assignment', () => {
  const opts = { role: 'student', existing: { category: 'Plumbing' } };
  assert.match(
    validateComplaintUpdateData({ priority: 'critical' }, opts),
    /only be changed by a manager/i
  );
  assert.match(validateComplaintUpdateData({ status: 'resolved' }, opts), /Only a manager/);
  assert.match(validateComplaintUpdateData({ managerComment: 'hi' }, opts), /Only a manager/);
  assert.match(validateComplaintUpdateData({ assignedTo: 'me' }, opts), /Only a manager/);
  assert.match(validateComplaintUpdateData({ secretField: 1 }, opts), /cannot be edited/);
});

test('student content edits are validated against whitelists', () => {
  const opts = { role: 'student', existing: { category: 'Plumbing' } };
  assert.equal(validateComplaintUpdateData({ description: 'A brand new description' }, opts), null);
  // Issue-only update is checked against the complaint's existing category
  assert.equal(validateComplaintUpdateData({ issue: 'No water supply' }, opts), null);
  assert.match(validateComplaintUpdateData({ issue: 'Fan not working' }, opts), /valid issue/);
  assert.match(validateComplaintUpdateData({ category: 'Nope' }, opts), /valid complaint category/);
  assert.match(validateComplaintUpdateData({ room: 'bad room' }, opts), /Room number/);
});
