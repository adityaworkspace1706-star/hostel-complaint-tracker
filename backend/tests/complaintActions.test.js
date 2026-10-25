import test from 'node:test';
import assert from 'node:assert/strict';
import { validateFeedback, validateReopen, canStudentActOnResolution } from '../utils/complaintActions.js';

test('accepts valid feedback and optional comment', () => {
  assert.equal(validateFeedback({ rating: 1 }), null);
  assert.equal(validateFeedback({ rating: 5, comment: 'Fixed!' }), null);
});
test('rejects invalid rating and oversized comment', () => {
  for (const rating of [0, 6, 2.5, '5', null, undefined]) {
    assert.ok(validateFeedback({ rating }));
  }
  assert.ok(validateFeedback({ rating: 4, comment: 'x'.repeat(501) }));
});
test('reopen requires a nonblank reason up to 500 characters', () => {
  assert.equal(validateReopen({ reason: 'Issue persists' }), null);
  for (const reason of ['', '   ', null, 'x'.repeat(501)]) assert.ok(validateReopen({ reason }));
});
test('only owner of a resolved complaint is eligible', () => {
  const complaint = { studentId: 'abc', status: 'resolved' };
  assert.equal(canStudentActOnResolution(complaint, 'abc'), true);
  assert.equal(canStudentActOnResolution(complaint, 'def'), false);
  assert.equal(canStudentActOnResolution({ ...complaint, status: 'pending' }, 'abc'), false);
});
