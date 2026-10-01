// ---------------------------------------------------------------------------
// Canonical complaint domain rules for the API.
//
// This mirrors frontend/src/utils/constants.js so that mock mode and the real
// backend enforce the exact same whitelists and derive the exact same
// auto-priority for every category + issue pair.
// ---------------------------------------------------------------------------

export const PRIORITIES = ['low', 'medium', 'high', 'critical'];
export const STATUSES = ['pending', 'in_progress', 'resolved', 'rejected'];
export const HOSTELS = ['A Block', 'B Block', 'C Block', 'D Block'];

export const ROOM_PATTERN = /^[A-Za-z0-9-]{1,10}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_NAME_LENGTH = 2;
export const MIN_PASSWORD_LENGTH = 8;
export const MIN_DESCRIPTION_LENGTH = 10;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_IMAGES_PER_COMPLAINT = 3;

// category -> { issue: autoPriority }
export const COMPLAINT_CATEGORIES = {
  Electrical: {
    issues: {
      'Fan not working': 'medium',
      'Fan making noise': 'low',
      'Light not working': 'medium',
      'Switch not working': 'medium',
      'Socket not working': 'medium',
      'Tube light flickering': 'low',
      'AC not working': 'high',
      'AC remote not working': 'low',
      'Geyser not working': 'high',
    },
  },
  Plumbing: {
    issues: {
      'Tap leaking': 'medium',
      'Washbasin blocked': 'high',
      'Toilet blocked': 'high',
      'Flush not working': 'medium',
      'Shower not working': 'medium',
      'Water leakage': 'high',
      'No water supply': 'high',
      'Drainage problem': 'high',
    },
  },
  Carpentry: {
    issues: {
      'Door not closing': 'medium',
      'Door lock damaged': 'critical',
      'Window damaged': 'medium',
      'Bed damaged': 'medium',
      'Chair damaged': 'low',
      'Table damaged': 'low',
      'Cupboard damaged': 'low',
      'Drawer damaged': 'low',
    },
  },
  'Civil / Room': {
    issues: {
      'Wall damage': 'medium',
      'Ceiling damage': 'high',
      'Floor tile damaged': 'low',
      'Wall paint damaged': 'low',
      'Ceiling leakage': 'high',
    },
  },
  Housekeeping: {
    issues: {
      'Room not cleaned': 'medium',
      'Bathroom not cleaned': 'medium',
      'Dustbin not emptied': 'low',
      'Common area dirty': 'low',
      'Garbage collection issue': 'medium',
    },
  },
  'Internet / Wi-Fi': {
    issues: {
      'Wi-Fi not working': 'high',
      'Slow internet': 'medium',
      'Cannot connect to Wi-Fi': 'medium',
      'LAN port not working': 'medium',
    },
  },
  'Common Facilities': {
    issues: {
      'Lift not working': 'critical',
      'Water cooler not working': 'medium',
      'Washing machine not working': 'medium',
      'Common light not working': 'low',
      'Common fan not working': 'low',
    },
  },
};

export const CATEGORY_NAMES = Object.keys(COMPLAINT_CATEGORIES);

export const isValidCategory = (category) =>
  typeof category === 'string' && Object.hasOwn(COMPLAINT_CATEGORIES, category);

export const isValidIssue = (category, issue) =>
  isValidCategory(category) &&
  typeof issue === 'string' &&
  Object.hasOwn(COMPLAINT_CATEGORIES[category].issues, issue);

/** Auto-assigned priority for a category + issue combo (null if unknown). */
export const getPriorityForIssue = (category, issue) => {
  if (!isValidIssue(category, issue)) return null;
  return COMPLAINT_CATEGORIES[category].issues[issue];
};
