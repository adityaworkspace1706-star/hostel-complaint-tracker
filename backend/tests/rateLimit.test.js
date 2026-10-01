import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import './helpers/env.js';

// Force a tiny rate-limit budget BEFORE the app (and the limiter) is imported.
process.env.AUTH_RATE_LIMIT = '3';

let server = null;
let baseUrl = '';

const post = async (path, body, raw = false) =>
  fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: raw ? body : JSON.stringify(body),
  });

before(async () => {
  const { default: app } = await import('../server.js');
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
});

// These tests run in order inside one parent test: the rate limiter counts
// requests per IP across them.
test('app behaviour without a database', async (t) => {
  await t.test('serves the root route', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    assert.match(await res.text(), /HostelCare API/);
  });

  await t.test('unknown routes return a JSON 404 envelope', async () => {
    const res = await fetch(`${baseUrl}/api/definitely-not-a-route`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /Route not found/);
  });

  await t.test('protected routes reject missing tokens', async () => {
    const res = await fetch(`${baseUrl}/api/complaints/my`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /no token/);
  });

  await t.test('malformed JSON bodies return a clean 400', async () => {
    const res = await post('/api/auth/login', '{not json', true);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /Invalid JSON/);
  });

  await t.test('5xx errors never leak raw internal messages', async () => {
    // bufferCommands is off and there is no connection, so the controller's
    // User.findOne fails — the client must see a generic message only.
    const credentials = { email: 'someone@example.com', password: 'password123' };
    for (let i = 0; i < 3; i += 1) {
      const res = await post('/api/auth/login', credentials);
      assert.equal(res.status, 500);
      const text = await res.text();
      assert.equal(JSON.parse(text).message, 'Internal server error');
      assert.ok(!/buffer|Mongoose|Cannot call|stack/i.test(text), `leaked details: ${text}`);
    }
  });

  await t.test('auth routes are rate limited after the configured budget', async () => {
    const res = await post('/api/auth/login', {
      email: 'someone@example.com',
      password: 'password123',
    });
    assert.equal(res.status, 429);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /Too many requests/);
    assert.equal(res.headers.get('ratelimit-limit'), '3');
  });
});
