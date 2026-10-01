import { ROOM_PATTERN } from './constants.js';

/** Simple client-side validation helpers. Return an error message or null. */

export const validateLogin = ({ email, password }) => {
  if (!email) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  if (!password) return 'Password is required.';
  return null;
};

export const validateRegister = ({ name, email, password, confirmPassword, hostel, room }) => {
  if (!name || name.trim().length < 2) return 'Full name must be at least 2 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')) return 'Enter a valid email address.';
  if (!password || password.length < 8)
    return 'Password must be at least 8 characters long.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  if (!hostel) return 'Please select your hostel.';
  if (!room) return 'Room number is required.';
  if (!ROOM_PATTERN.test(room)) return 'Room number can only contain letters, numbers and dashes.';
  return null;
};

export const validateComplaint = ({ category, issue, hostel, room, description }) => {
  if (!category) return 'Please select a category.';
  if (!issue) return 'Please select a specific issue.';
  if (!hostel) return 'Please select your hostel.';
  if (!room) return 'Room number is required.';
  if (!description || description.trim().length < 10)
    return 'Please describe the problem (at least 10 characters).';
  return null;
};
