import {
  COMPLAINT_CATEGORIES,
  EMAIL_PATTERN,
  HOSTELS,
  MAX_DESCRIPTION_LENGTH,
  MAX_IMAGES_PER_COMPLAINT,
  MIN_DESCRIPTION_LENGTH,
  MIN_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  PRIORITIES,
  ROOM_PATTERN,
  STATUSES,
  isValidCategory,
  isValidIssue,
} from '../constants/complaints.js';

// ---------------------------------------------------------------------------
// Pure input-validation helpers — no Express dependency so they can be unit
// tested directly. Every function returns an error message string on failure
// and `null` when the input is valid.
// ---------------------------------------------------------------------------

export const validateRegisterData = ({ name, email, password, hostel, room } = {}) => {
  if (typeof name !== 'string' || name.trim().length < MIN_NAME_LENGTH) {
    return `Full name must be at least ${MIN_NAME_LENGTH} characters.`;
  }
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
    return 'Enter a valid email address.';
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
  }
  if (!HOSTELS.includes(hostel)) return 'Please select a valid hostel.';
  if (typeof room !== 'string' || !ROOM_PATTERN.test(room)) {
    return 'Room number can only contain letters, numbers and dashes.';
  }
  return null;
};

export const validateLoginData = ({ email, password } = {}) => {
  if (typeof email !== 'string' || !email.trim()) return 'Email is required.';
  if (typeof password !== 'string' || !password) return 'Password is required.';
  return null;
};

/** `role` decides which profile fields a user is allowed to change. */
export const validateProfileData = ({ name, email, hostel, room } = {}, role) => {
  if (name !== undefined && (typeof name !== 'string' || name.trim().length < MIN_NAME_LENGTH)) {
    return `Full name must be at least ${MIN_NAME_LENGTH} characters.`;
  }
  if (email !== undefined && (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim()))) {
    return 'Enter a valid email address.';
  }
  if (role === 'student') {
    if (hostel !== undefined && hostel !== '' && !HOSTELS.includes(hostel)) {
      return 'Please select a valid hostel.';
    }
    if (room !== undefined && room !== '' && (typeof room !== 'string' || !ROOM_PATTERN.test(room))) {
      return 'Room number can only contain letters, numbers and dashes.';
    }
  }
  return null;
};

const checkDescription = (description) => {
  if (typeof description !== 'string' || description.trim().length < MIN_DESCRIPTION_LENGTH) {
    return `Please describe the problem (at least ${MIN_DESCRIPTION_LENGTH} characters).`;
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`;
  }
  return null;
};

/** Full validation for creating a complaint (category/issue/hostel whitelists). */
export const validateComplaintData = ({ category, issue, hostel, room, description, images } = {}) => {
  if (!isValidCategory(category)) return 'Please select a valid complaint category.';
  if (!isValidIssue(category, issue)) return 'Please select a valid issue for the chosen category.';
  if (!HOSTELS.includes(hostel)) return 'Please select a valid hostel.';
  if (typeof room !== 'string' || !ROOM_PATTERN.test(room)) {
    return 'Room number can only contain letters, numbers and dashes.';
  }
  const descriptionError = checkDescription(description);
  if (descriptionError) return descriptionError;
  if (images !== undefined) {
    if (!Array.isArray(images) || images.length > MAX_IMAGES_PER_COMPLAINT) {
      return `At most ${MAX_IMAGES_PER_COMPLAINT} images can be attached.`;
    }
    if (images.some((img) => typeof img !== 'string' || !img.startsWith('data:image/'))) {
      return 'Images must be valid image data.';
    }
  }
  return null;
};

const STUDENT_EDITABLE_FIELDS = ['category', 'issue', 'description', 'hostel', 'room'];

/**
 * Role-aware validation for complaint updates.
 *
 * Managers may change status / priority / comment / assignment.
 * Students may only edit their own pending complaint's content — priority and
 * status are explicitly NOT student-editable (priority is auto-derived).
 *
 * `existing` is the current complaint document (used to validate an issue
 * against its category when the body only changes the issue).
 */
export const validateComplaintUpdateData = (body = {}, { role, existing = {} } = {}) => {
  if (role === 'manager') {
    if (body.status !== undefined && !STATUSES.includes(body.status)) {
      return 'Invalid complaint status.';
    }
    if (body.priority !== undefined && !PRIORITIES.includes(body.priority)) {
      return 'Invalid priority.';
    }
    if (
      body.managerComment !== undefined &&
      (typeof body.managerComment !== 'string' || body.managerComment.length > 1000)
    ) {
      return 'Comment must be 1000 characters or fewer.';
    }
    if (
      body.assignedTo !== undefined &&
      (typeof body.assignedTo !== 'string' || body.assignedTo.length > 100)
    ) {
      return 'Invalid assignee.';
    }
    return null;
  }

  // Students: reject manager-only fields outright so the rule is visible to
  // API consumers instead of being silently dropped.
  if (body.status !== undefined) {
    return 'Only a manager can change the status of a complaint.';
  }
  if (body.priority !== undefined) {
    return 'Priority is assigned automatically and can only be changed by a manager.';
  }
  if (body.managerComment !== undefined) {
    return 'Only a manager can comment on a complaint.';
  }
  if (body.assignedTo !== undefined) {
    return 'Only a manager can assign a complaint.';
  }
  for (const key of Object.keys(body)) {
    if (!STUDENT_EDITABLE_FIELDS.includes(key)) {
      return `Field "${key}" cannot be edited.`;
    }
  }

  const category = body.category !== undefined ? body.category : existing.category;
  if (body.category !== undefined && !isValidCategory(body.category)) {
    return 'Please select a valid complaint category.';
  }
  if (body.issue !== undefined && !isValidIssue(category, body.issue)) {
    return 'Please select a valid issue for the chosen category.';
  }
  if (body.hostel !== undefined && !HOSTELS.includes(body.hostel)) {
    return 'Please select a valid hostel.';
  }
  if (body.room !== undefined && (typeof body.room !== 'string' || !ROOM_PATTERN.test(body.room))) {
    return 'Room number can only contain letters, numbers and dashes.';
  }
  if (body.description !== undefined) {
    const descriptionError = checkDescription(body.description);
    if (descriptionError) return descriptionError;
  }
  return null;
};

/** Exposed for tests / introspection. */
export const CATEGORY_ISSUE_WHITELIST = COMPLAINT_CATEGORIES;
