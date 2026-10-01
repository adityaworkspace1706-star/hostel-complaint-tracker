import { ChevronRight } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge.jsx';
import { PriorityBadge } from '../ui/PriorityBadge.jsx';
import { ComplaintCard } from './ComplaintCard.jsx';
import { formatDate, studentNameOf } from '../../utils/format.js';

/**
 * Responsive complaint list: table on desktop, cards on mobile.
 * showStudent adds the student column (manager view).
 */
export const ComplaintTable = ({ complaints, onView, showStudent = false }) => {
  if (!complaints.length) return null;

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 md:block">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead>
            <tr className="bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <th className="px-4 py-3 font-semibold">Complaint</th>
              {showStudent && <th className="px-4 py-3 font-semibold">Student</th>}
              <th className="px-4 py-3 font-semibold">Room</th>
              <th className="px-4 py-3 font-semibold">Priority</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {complaints.map((c) => (
              <tr
                key={c._id}
                onClick={() => onView(c._id)}
                className="cursor-pointer transition hover:bg-indigo-50/40"
              >
                <td className="px-4 py-3.5">
                  <p className="font-semibold text-slate-900">{c.complaintId}</p>
                  <p className="text-xs text-slate-500">
                    {c.issue} · {c.category}
                  </p>
                </td>
                {showStudent && (
                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-700">{studentNameOf(c)}</p>
                  </td>
                )}
                <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
                  {c.hostel} · {c.room || '—'}
                </td>
                <td className="px-4 py-3.5">
                  <PriorityBadge priority={c.priority} />
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-slate-500">
                  {formatDate(c.createdAt)}
                </td>
                <td className="px-4 py-3.5 text-right">
                  <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {complaints.map((c) => (
          <ComplaintCard
            key={c._id}
            complaint={c}
            showStudent={showStudent}
            onClick={() => onView(c._id)}
          />
        ))}
      </div>
    </>
  );
};
