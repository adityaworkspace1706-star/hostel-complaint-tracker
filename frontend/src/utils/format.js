/** Formatting helpers shared across the app. */

/**
 * Display name of a complaint's student.
 *
 * The mock API stores a flat `studentName`, while the real API returns a
 * populated `studentId` object — this helper understands both shapes so pages
 * work with VITE_USE_MOCK on or off.
 */
export const studentNameOf = (complaint) => {
  const student = complaint?.studentId;
  if (student && typeof student === 'object' && student.name) return student.name;
  if (complaint?.studentName) return complaint.studentName;
  return '—';
};

export const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const timeAgo = (value) => {
  if (!value) return '—';
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || '?';

export const titleCase = (str = '') =>
  str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const formatNumber = (n) => Number(n ?? 0).toLocaleString('en-US');

/** Build a small sparkline/trend dataset label for chart x-axis. */
export const shortDay = (value) => {
  const d = new Date(value);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};
