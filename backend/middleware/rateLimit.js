import rateLimit from 'express-rate-limit';

// ---------------------------------------------------------------------------
// Rate limiting for authentication routes (brute-force protection).
//
// express-rate-limit was already a dependency but never mounted anywhere.
// The window/limit can be tuned via AUTH_RATE_LIMIT (requests per 15 min).
// ---------------------------------------------------------------------------

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: Number(process.env.AUTH_RATE_LIMIT) || 50,
  standardHeaders: 'draft-6',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please wait a few minutes and try again.',
  },
});
