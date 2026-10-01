import { ApiError } from './errorHandler.js';
import {
  validateComplaintData,
  validateLoginData,
  validateProfileData,
  validateRegisterData,
} from '../utils/validation.js';

// ---------------------------------------------------------------------------
// Validation middleware. Each validator is a pure function returning an error
// message (or null); failures are passed to the centralized error handler as
// a 400 ApiError so clients always get the standard response envelope.
// ---------------------------------------------------------------------------

export const validate = (validator) => (req, _res, next) => {
  const message = validator(req);
  if (message) return next(ApiError.badRequest(message));
  return next();
};

export const validateRegister = validate((req) => validateRegisterData(req.body));
export const validateLogin = validate((req) => validateLoginData(req.body));
export const validateProfile = validate((req) => validateProfileData(req.body, req.user?.role));
export const validateComplaintCreate = validate((req) => validateComplaintData(req.body));
