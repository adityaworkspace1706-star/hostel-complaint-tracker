import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, errorHandler, notFoundHandler } from '../middleware/errorHandler.js';

const mockRes = () => {
  const res = { statusCode: null, body: null };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    res.body = payload;
    return res;
  };
  return res;
};

const req = { method: 'GET', originalUrl: '/api/test' };

test('ApiError carries a status code', () => {
  assert.equal(ApiError.badRequest('nope').statusCode, 400);
  assert.equal(ApiError.forbidden().statusCode, 403);
  assert.equal(ApiError.notFound().statusCode, 404);
  assert.equal(ApiError.conflict('dup').statusCode, 409);
  assert.ok(ApiError.badRequest('x').isOperational);
});

test('operational 4xx errors pass their message through', () => {
  const res = mockRes();
  errorHandler(ApiError.badRequest('Invalid complaint status'), req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { success: false, message: 'Invalid complaint status' });
});

test('unexpected 5xx errors are logged but never leaked to the client', () => {
  const res = mockRes();
  const logged = [];
  const originalError = console.error;
  console.error = (...args) => logged.push(args);
  try {
    errorHandler(new Error('MongoServerError: connection reset at /etc/secrets'), req, res, () => {});
  } finally {
    console.error = originalError;
  }

  assert.equal(res.statusCode, 500);
  assert.deepEqual(res.body, { success: false, message: 'Internal server error' });
  assert.ok(!JSON.stringify(res.body).includes('connection reset'));
  assert.equal(logged.length, 1); // real error stays server-side
});

test('mongoose CastError (bad ObjectId) becomes a clean 400', () => {
  const err = Object.assign(new Error('Cast to ObjectId failed for value "nope"'), {
    name: 'CastError',
    path: '_id',
  });
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { success: false, message: 'Invalid value provided' });
});

test('mongoose duplicate key becomes a 409', () => {
  const err = Object.assign(new Error('E11000 duplicate key'), {
    code: 11000,
    keyValue: { complaintId: 'CMP-0001' },
  });
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.equal(res.statusCode, 409);
  assert.match(res.body.message, /complaintId already exists/);
});

test('mongoose validation errors become a 400 with field messages', () => {
  const err = Object.assign(new Error('Validation failed'), {
    name: 'ValidationError',
    errors: { email: { message: 'Path `email` is required.' } },
  });
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.match(res.body.message, /email/);
});

test('malformed JSON bodies become a 400', () => {
  const err = Object.assign(new SyntaxError('Unexpected token b in JSON'), {
    type: 'entity.parse.failed',
    status: 400,
  });
  const res = mockRes();
  errorHandler(err, req, res, () => {});
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.body, { success: false, message: 'Invalid JSON in request body' });
});

test('unknown routes fall through to a 404 ApiError', () => {
  let forwarded = null;
  notFoundHandler({ method: 'GET', originalUrl: '/api/nope' }, null, (err) => {
    forwarded = err;
  });
  assert.ok(forwarded instanceof ApiError);
  assert.equal(forwarded.statusCode, 404);
  assert.match(forwarded.message, /\/api\/nope/);
});
