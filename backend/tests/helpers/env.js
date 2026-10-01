// ---------------------------------------------------------------------------
// Test environment defaults. Every test file must import this FIRST (before
// anything that reads env vars), so results don't depend on the developer's
// local .env or shell.
// ---------------------------------------------------------------------------
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-at-least-16-chars-long';
process.env.JWT_EXPIRES_IN = '2h';
process.env.AUTH_RATE_LIMIT = process.env.AUTH_RATE_LIMIT || '1000';

import mongoose from 'mongoose';

// Fail fast instead of buffering queries for 10s when no connection is open
// (tests that never connect would otherwise hang).
mongoose.set('bufferCommands', false);
