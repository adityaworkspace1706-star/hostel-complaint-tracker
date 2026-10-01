// ---------------------------------------------------------------------------
// Centralized application constants for the Hostel Complaint Tracker.
// Categories, issues and the auto-priority mapping live ONLY here so they can
// be tweaked in one place without touching any page component.
// ---------------------------------------------------------------------------

export const ROLES = {
  STUDENT: 'student',
  MANAGER: 'manager',
};

export const COMPLAINT_STATUSES = ['pending', 'in_progress', 'resolved', 'rejected'];

export const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export const HOSTELS = ['A Block', 'B Block', 'C Block', 'D Block'];

export const ROOM_PATTERN = /^[A-Za-z0-9-]{1,10}$/;

// category -> { icon, issues: { issue: autoPriority } }
export const COMPLAINT_CATEGORIES = {
  Electrical: {
    icon: 'Zap',
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
    icon: 'Droplets',
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
    icon: 'Hammer',
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
    icon: 'Building2',
    issues: {
      'Wall damage': 'medium',
      'Ceiling damage': 'high',
      'Floor tile damaged': 'low',
      'Wall paint damaged': 'low',
      'Ceiling leakage': 'high',
    },
  },
  Housekeeping: {
    icon: 'Sparkles',
    issues: {
      'Room not cleaned': 'medium',
      'Bathroom not cleaned': 'medium',
      'Dustbin not emptied': 'low',
      'Common area dirty': 'low',
      'Garbage collection issue': 'medium',
    },
  },
  'Internet / Wi-Fi': {
    icon: 'Wifi',
    issues: {
      'Wi-Fi not working': 'high',
      'Slow internet': 'medium',
      'Cannot connect to Wi-Fi': 'medium',
      'LAN port not working': 'medium',
    },
  },
  'Common Facilities': {
    icon: 'Building',
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

/** Issues available for a given category (for dropdowns). */
export const getIssuesForCategory = (category) =>
  category && COMPLAINT_CATEGORIES[category]
    ? Object.keys(COMPLAINT_CATEGORIES[category].issues)
    : [];

/** Auto-assigned priority for a category + issue combo. */
export const getPriorityForIssue = (category, issue) => {
  if (!category || !COMPLAINT_CATEGORIES[category]) return null;
  return COMPLAINT_CATEGORIES[category].issues[issue] ?? null;
};

// ---- Display metadata (badge styles etc.) --------------------------------

export const STATUS_META = {
  pending: {
    label: 'Pending',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },
  in_progress: {
    label: 'In Progress',
    dot: 'bg-blue-500',
    badge: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  },
  resolved: {
    label: 'Resolved',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  },
  rejected: {
    label: 'Rejected',
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 ring-red-600/20',
  },
};

export const PRIORITY_META = {
  low: {
    label: 'Low',
    badge: 'bg-slate-100 text-slate-600 ring-slate-500/20',
    bar: 'bg-slate-400',
  },
  medium: {
    label: 'Medium',
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    bar: 'bg-amber-400',
  },
  high: {
    label: 'High',
    badge: 'bg-orange-50 text-orange-700 ring-orange-600/20',
    bar: 'bg-orange-400',
  },
  critical: {
    label: 'Critical',
    badge: 'bg-red-50 text-red-700 ring-red-600/20',
    bar: 'bg-red-500',
  },
};

export const STATUS_FLOW = ['pending', 'in_progress', 'resolved'];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'priority', label: 'Priority (critical first)' },
];
