/** Validate student-only resolution actions without Express or MongoDB dependencies. */
export const validateFeedback = ({ rating, comment = '' } = {}) => {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return 'Rating must be an integer from 1 to 5';
  if (typeof comment !== 'string' || comment.length > 500) return 'Comment must be at most 500 characters';
  return null;
};
export const validateReopen = ({ reason } = {}) => {
  if (typeof reason !== 'string' || !reason.trim() || reason.trim().length > 500)
    return 'Reopen reason must be 1–500 characters';
  return null;
};
export const canStudentActOnResolution = (complaint, userId) =>
  String(complaint.studentId?._id ?? complaint.studentId) === String(userId) && complaint.status === 'resolved';
