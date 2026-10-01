// ---------------------------------------------------------------------------
// Centralized error handling.
//
// Controllers throw ApiError (or any Error) and call next(err). Everything is
// funneled through `errorHandler`, which:
//   • passes through safe, operational messages (4xx),
//   • logs unexpected 5xx errors server-side,
//   • NEVER leaks raw internal error messages or stack traces to the client.
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message) {
    return new ApiError(400, message);
  }

  static forbidden(message = 'Not authorized') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }
}

/** 404 for any request that did not match a route. */
export const notFoundHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/** Map well-known library errors to safe client-facing responses. */
const normalize = (err) => {
  // Mongoose schema validation
  if (err?.name === 'ValidationError') {
    const message = Object.values(err.errors || {})
      .map((e) => e.message)
      .join(' ');
    return { statusCode: 400, message: message || 'Invalid request data' };
  }
  // Bad ObjectId / invalid cast (e.g. /api/complaints/not-an-id)
  if (err?.name === 'CastError') {
    return { statusCode: 400, message: 'Invalid value provided' };
  }
  // Duplicate key (unique index)
  if (err?.code === 11000) {
    const fields = Object.keys(err.keyValue || {}).join(', ') || 'value';
    return { statusCode: 409, message: `${fields} already exists` };
  }
  // Malformed JSON body
  if (err?.type === 'entity.parse.failed') {
    return { statusCode: 400, message: 'Invalid JSON in request body' };
  }
  if (err?.type === 'entity.too.large') {
    return { statusCode: 413, message: 'Request payload too large' };
  }

  const statusCode = err?.statusCode || err?.status || 500;
  return { statusCode, message: err?.message };
};

export const errorHandler = (err, req, res, _next) => {
  const { statusCode, message } = normalize(err);

  if (statusCode >= 500) {
    // Log the real error server-side, send a generic message to the client.
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }

  return res.status(statusCode).json({ success: false, message });
};
