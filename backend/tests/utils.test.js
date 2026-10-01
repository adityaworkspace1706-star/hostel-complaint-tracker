import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatComplaintId,
  nextComplaintIdFromIds,
  nextComplaintIdFromMax,
  parseComplaintId,
} from '../utils/complaintId.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';

test('complaint IDs are formatted as CMP-0001', () => {
  assert.equal(formatComplaintId(1), 'CMP-0001');
  assert.equal(formatComplaintId(42), 'CMP-0042');
  assert.equal(parseComplaintId('CMP-0042'), 42);
  assert.equal(parseComplaintId('garbage'), null);
  assert.equal(parseComplaintId(undefined), null);
});

test('first complaint starts at CMP-0001', () => {
  assert.equal(nextComplaintIdFromMax(undefined), 'CMP-0001');
  assert.equal(nextComplaintIdFromMax(0), 'CMP-0001');
  assert.equal(nextComplaintIdFromIds([]), 'CMP-0001');
});

test('deleting a complaint never causes a duplicate ID', () => {
  // Old count-based logic: 3 docs → CMP-0004 → collides with existing CMP-0004.
  const existing = ['CMP-0002', 'CMP-0003', 'CMP-0004'];
  assert.equal(nextComplaintIdFromIds(existing), 'CMP-0005');
  assert.ok(!existing.includes(nextComplaintIdFromIds(existing)));

  // Gaps are skipped forward, never backwards.
  assert.equal(nextComplaintIdFromIds(['CMP-0001', 'CMP-0003']), 'CMP-0004');
});

test('malformed IDs are ignored when computing the next ID', () => {
  assert.equal(nextComplaintIdFromIds(['garbage', null, 'CMP-0007']), 'CMP-0008');
  assert.equal(nextComplaintIdFromMax(9999), 'CMP-10000');
});

test('pagination is opt-in via page/limit query params', () => {
  assert.equal(parsePagination({}), null);
  assert.deepEqual(parsePagination({ page: '2', limit: '5' }), { page: 2, limit: 5, skip: 5 });
  // Invalid values fall back to safe defaults
  assert.deepEqual(parsePagination({ page: 'abc' }), { page: 1, limit: 20, skip: 0 });
  assert.deepEqual(parsePagination({ page: '0', limit: '-3' }), { page: 1, limit: 20, skip: 0 });
  // Limit is capped
  assert.equal(parsePagination({ limit: '5000' }).limit, 100);
});

test('pagination metadata reports totals', () => {
  assert.deepEqual(buildPaginationMeta({ page: 2, limit: 10, total: 35 }), {
    page: 2,
    limit: 10,
    total: 35,
    totalPages: 4,
  });
  assert.equal(buildPaginationMeta({ page: 1, limit: 10, total: 0 }).totalPages, 1);
});
