import { ChevronRight, MapPin } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge.jsx';
import { PriorityBadge } from '../ui/PriorityBadge.jsx';
import { formatDate, studentNameOf, timeAgo } from '../../utils/format.js';

/** Card layout for complaints — used on mobile instead of the table. */
export const ComplaintCard = ({ complaint, onClick, showStudent = false }) => (
  <button
    onClick={onClick}
    className="w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-200/70 transition hover:ring-indigo-300 active:scale-[0.99]"
  >
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-bold text-slate-900">{complaint.complaintId}</p>
      <StatusBadge status={complaint.status} />
    </div>
    <p className="mt-1.5 text-sm font-medium text-slate-800">{complaint.issue}</p>
    <p className="text-xs text-slate-500">{complaint.category}</p>

    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
      {showStudent && <span className="font-medium text-slate-600">{studentNameOf(complaint)}</span>}
      <span className="inline-flex items-center gap-1">
        <MapPin className="h-3.5 w-3.5" />
        {complaint.hostel} · {complaint.room || '—'}
      </span>
      <span>{timeAgo(complaint.createdAt)}</span>
      <span className="ml-auto flex items-center gap-2">
        <PriorityBadge priority={complaint.priority} />
        <ChevronRight className="h-4 w-4 text-slate-300" />
      </span>
    </div>
    <p className="mt-2 text-[11px] text-slate-400">{formatDate(complaint.createdAt)}</p>
  </button>
);
