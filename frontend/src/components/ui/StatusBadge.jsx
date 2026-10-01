import { STATUS_META } from '../../utils/constants.js';

/** Color-coded status badge: Pending=amber, In Progress=blue, Resolved=green, Rejected=red. */
export const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || {
    label: status || '—',
    dot: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${meta.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};
