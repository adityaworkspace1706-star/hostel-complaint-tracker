import { PRIORITY_META } from '../../utils/constants.js';

/** Color-coded priority badge: Low=gray, Medium=amber, High=orange, Critical=red. */
export const PriorityBadge = ({ priority }) => {
  const meta = PRIORITY_META[priority] || {
    label: priority || '—',
    badge: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${meta.badge}`}
    >
      {meta.label}
    </span>
  );
};
