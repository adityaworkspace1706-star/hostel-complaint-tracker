import {
  AlertTriangle,
  Building2,
  Calendar,
  Check,
  Circle,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  RefreshCcw,
  Tag,
  User,
  UserCheck,
} from 'lucide-react';
import { Card } from '../ui/Card.jsx';
import { StatusBadge } from '../ui/StatusBadge.jsx';
import { PriorityBadge } from '../ui/PriorityBadge.jsx';
import { Avatar } from '../ui/Avatar.jsx';
import { STATUS_META, STATUS_FLOW } from '../../utils/constants.js';
import { formatDateTime, studentNameOf } from '../../utils/format.js';

const TIMELINE_ICONS = [Circle, RefreshCcw, Check];

/** Two-column detail grid used by both student and manager views. */
export const ComplaintDetailsView = ({ complaint, showStudentInfo = false }) => (
  <div className="grid gap-6 lg:grid-cols-3">
    <div className="space-y-6 lg:col-span-2">
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900">{complaint.complaintId}</h2>
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
        <p className="mt-2 text-sm text-slate-500">
          {complaint.category} · {complaint.issue}
        </p>

        <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          <DetailItem icon={Tag} label="Category" value={complaint.category} />
          <DetailItem icon={AlertTriangle} label="Issue" value={complaint.issue} />
          <DetailItem icon={Building2} label="Hostel" value={complaint.hostel} />
          <DetailItem icon={MapPin} label="Room" value={complaint.room || '—'} />
          <DetailItem icon={Calendar} label="Created" value={formatDateTime(complaint.createdAt)} />
          <DetailItem icon={RefreshCcw} label="Last updated" value={formatDateTime(complaint.updatedAt)} />
          {complaint.resolvedAt && (
            <DetailItem icon={Check} label="Resolved on" value={formatDateTime(complaint.resolvedAt)} />
          )}
          <DetailItem icon={UserCheck} label="Assigned to" value={complaint.assignedTo || 'Not assigned yet'} />
          {showStudentInfo && (
            <DetailItem icon={User} label="Student" value={`${studentNameOf(complaint)} (Room ${complaint.hostel} · ${complaint.room})`} />
          )}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Description</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{complaint.description}</p>
        </div>

        {complaint.images?.length > 0 && (
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
              <ImageIcon className="h-3.5 w-3.5" /> Attached image
            </p>
            <img
              src={complaint.images[0]}
              alt="Complaint attachment"
              className="max-h-64 rounded-xl object-cover shadow-sm ring-1 ring-slate-200"
            />
          </div>
        )}
      </Card>

      <StatusTimeline complaint={complaint} />
    </div>

    <div className="space-y-6">
      {showStudentInfo && (
        <Card className="p-5">
          <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">Student</p>
          <div className="mt-3 flex items-center gap-3">
            <Avatar name={studentNameOf(complaint)} size="lg" />
            <div>
              <p className="text-sm font-semibold text-slate-900">{studentNameOf(complaint)}</p>
              <p className="text-xs text-slate-500">
                {complaint.hostel} · Room {complaint.room}
              </p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-5">
        <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
          <MessageSquare className="h-3.5 w-3.5" /> Manager comment
        </p>
        {complaint.managerComment ? (
          <p className="mt-3 text-sm leading-relaxed text-slate-700">{complaint.managerComment}</p>
        ) : (
          <p className="mt-3 text-sm text-slate-400 italic">No comment from the manager yet.</p>
        )}
      </Card>
    </div>
  </div>
);

const DetailItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-2.5">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="text-sm font-medium break-words text-slate-800">{value}</p>
    </div>
  </div>
);

/** Visual status flow: Pending → In Progress → Resolved (rejected is terminal). */
export const StatusTimeline = ({ complaint }) => {
  if (complaint.status === 'rejected') {
    return (
      <Card className="border-red-200 p-5 ring-red-100">
        <p className="flex items-center gap-2 text-sm font-semibold text-red-600">
          <AlertTriangle className="h-4 w-4" /> This complaint was rejected
        </p>
        {complaint.managerComment && (
          <p className="mt-2 text-sm text-slate-600">{complaint.managerComment}</p>
        )}
      </Card>
    );
  }

  const currentIndex = STATUS_FLOW.indexOf(complaint.status);
  const isResolved = complaint.status === 'resolved';

  return (
    <Card className="p-6">
      <p className="mb-5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
        Status timeline
      </p>
      <ol className="relative flex items-start justify-between">
        <div className="absolute top-4 right-[16%] left-[16%] h-0.5 bg-slate-100" />
        {STATUS_FLOW.map((status, index) => {
          const reached = index <= currentIndex;
          const Icon = TIMELINE_ICONS[index];
          return (
            <li key={status} className="relative z-10 flex w-1/3 flex-col items-center gap-2 text-center">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white ${
                  reached ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <p className={`text-xs font-semibold ${reached ? 'text-slate-900' : 'text-slate-400'}`}>
                  {STATUS_META[status].label}
                </p>
                {isResolved && index === 2 && (
                  <p className="mt-0.5 text-[11px] text-emerald-600">
                    {formatDateTime(complaint.resolvedAt)}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {isResolved && (
        <p className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <Check className="h-4 w-4" /> This complaint has been resolved.
        </p>
      )}
    </Card>
  );
};
