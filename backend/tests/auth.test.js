import './helpers/env.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { generateToken, toPublicUser } from '../controllers/authController.js';
import { authorizeManager, protect } from '../middleware/auth.js';

// JWT_EXPIRES_IN is forced here (helpers/env.js sets it too) so the assertion
// below is deterministic regardless of the developer's .env.
process.env.JWT_EXPIRES_IN = '2h';

test('generateToken signs with JWT_SECRET and honors JWT_EXPIRES_IN', () => {
  const token = generateToken('user-123');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  assert.equal(decoded.id, 'user-123');
  assert.equal(decoded.exp - decoded.iat, 2 * 60 * 60); // exactly 2h, not hardcoded 30d
});

test('generateToken produces tokens that fail verification with another secret', () => {
  const token = generateToken('user-123');
  assert.throws(() => jwt.verify(token, 'some-other-secret'));
});

test('toPublicUser never exposes the password hash', () => {
  const payload = toPublicUser({
    _id: '1',
    name: 'A',
    email: 'a@b.com',
    role: 'student',
    hostel: 'A Block',
    room: '1',
    createdAt: 'now',
    updatedAt: 'now',
    password: '$2b$10$secret-hash',
  });
  assert.equal(payload.password, undefined);
  assert.equal(payload.name, 'A');
});

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

test('protect rejects requests without a token', async () => {
  const res = mockRes();
  await protect({ headers: {} }, res, () => assert.fail('must not call next'));
  assert.equal(res.statusCode, 401);
  assert.match(res.body.message, /no token/);
});

test('protect rejects garbage and wrongly-signed tokens', async () => {
  for (const token of ['garbage', jwt.sign({ id: 'x' }, 'wrong-secret')]) {
    const res = mockRes();
    await protect({ headers: { authorization: `Bearer ${token}` } }, res, () =>
      assert.fail('must not call next')
    );
    assert.equal(res.statusCode, 401);
    assert.match(res.body.message, /token failed/);
  }
});

test('protect forwards infrastructure failures to the error handler (no fake 401)', async () => {
  // bufferCommands is disabled in helpers/env.js and there is no open
  // connection in this file, so the user lookup fails immediately.
  const token = generateToken(new mongoose.Types.ObjectId().toString());
  let forwarded = null;
  const res = mockRes();
  await protect({ headers: { authorization: `Bearer ${token}` } }, res, (err) => {
    forwarded = err;
  });
  assert.ok(forwarded instanceof Error);
  assert.equal(res.statusCode, null); // no response was sent directly
});

test('authorizeManager only lets managers through', () => {
  let called = false;
  authorizeManager({ user: { role: 'manager' } }, mockRes(), () => (called = true));
  assert.ok(called);

  const res = mockRes();
  authorizeManager({ user: { role: 'student' } }, res, () => assert.fail('must not call next'));
  assert.equal(res.statusCode, 403);
  assert.match(res.body.message, /managers/);
});
