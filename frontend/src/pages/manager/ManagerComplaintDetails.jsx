import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  CheckCircle2,
  MessageSquare,
  RefreshCcw,
  ShieldAlert,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { useAuth } from '../../hooks/useAuth.js';
import { complaintService, managerService } from '../../services/api.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { Textarea } from '../../components/ui/Textarea.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { ComplaintDetailsView } from '../../components/Complaints/ComplaintDetailsView.jsx';
import { PRIORITIES } from '../../utils/constants.js';

export default function ManagerComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user: currentUser } = useAuth();

  const [actionModal, setActionModal] = useState(null); // 'resolve' | 'reject' | null
  const [modalComment, setModalComment] = useState('');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const { data: complaint, loading, error, refetch } = useFetch(
    () => complaintService.getById(id).then((res) => res.complaint),
    [id]
  );
  const { data: managers } = useFetch(() => managerService.getManagers().then((res) => res.managers));

  const managerOptions = useMemo(() => managers || [], [managers]);

  const update = async (payload, successMessage) => {
    setBusy(true);
    try {
      await complaintService.update(id, payload);
      showToast(successMessage);
      await refetch();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleStatus = async (status, message) => {
    setActionModal(null);
    const payload = { status };
    if (status === 'rejected' && modalComment.trim()) payload.managerComment = modalComment.trim();
    if (status === 'resolved' && modalComment.trim()) payload.managerComment = modalComment.trim();
    await update(payload, message);
  };

  const handleComment = async () => {
    if (!comment.trim()) {
      showToast('Please write a comment first.', 'error');
      return;
    }
    await update({ managerComment: comment.trim() }, 'Comment saved');
    setComment('');
  };

  if (loading) {
    return (
      <Card className="p-16">
        <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          Loading complaint…
        </div>
      </Card>
    );
  }

  if (error || !complaint) {
    return (
      <Card>
        <ErrorState message={error?.message || 'Complaint not found'} onRetry={refetch} />
      </Card>
    );
  }

  const isResolved = complaint.status === 'resolved';
  const isRejected = complaint.status === 'rejected';

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title={complaint.complaintId}
        description="Review the complaint and take action."
        backTo="/manager/complaints"
        actions={<StatusBadge status={complaint.status} />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ComplaintDetailsView complaint={complaint} showStudentInfo />
        </div>

        {/* Action panel */}
        <Card className="h-fit p-5">
          <h2 className="text-sm font-bold text-slate-900">Manager actions</h2>

          {/* Status */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">Status</p>
            <div className="flex flex-wrap gap-2">
              {!isResolved && !isRejected && (
                <>
                  {complaint.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={RefreshCcw}
                      disabled={busy}
                      onClick={() => update({ status: 'in_progress' }, 'Complaint moved to In Progress')}
                    >
                      Start progress
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={CheckCircle2}
                    className="text-emerald-700 ring-emerald-200 hover:bg-emerald-50"
                    disabled={busy}
                    onClick={() => {
                      setModalComment(complaint.managerComment || '');
                      setActionModal('resolve');
                    }}
                  >
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="dangerOutline"
                    icon={XCircle}
                    disabled={busy}
                    onClick={() => {
                      setModalComment(complaint.managerComment || '');
                      setActionModal('reject');
                    }}
                  >
                    Reject
                  </Button>
                </>
              )}
              {(isResolved || isRejected) && (
                <Button
                  size="sm"
                  variant="secondary"
                  icon={RefreshCcw}
                  disabled={busy}
                  onClick={() => update({ status: 'pending' }, 'Complaint reopened')}
                >
                  Reopen
                </Button>
              )}
            </div>
          </div>

          {/* Priority override */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">Priority</p>
            <Select
              value={complaint.priority}
              disabled={busy}
              onChange={(e) => update({ priority: e.target.value }, `Priority set to ${e.target.value}`)}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </Select>
            <p className="mt-1.5 text-xs text-slate-400">
              Override the auto-assigned priority when needed.
            </p>
          </div>

          {/* Assign */}
          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">Assign</p>
            <div className="flex gap-2">
              <Select
                value={complaint.assignedTo}
                disabled={busy}
                onChange={(e) => update({ assignedTo: e.target.value }, `Assigned to ${e.target.value || 'no one'}`)}
                className="flex-1"
                placeholder="Unassigned"
              >
                {managerOptions.map((m) => (
                  <option key={m._id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </Select>
              <Button
                size="sm"
                variant="secondary"
                icon={UserCheck}
                disabled={busy}
                onClick={() => update({ assignedTo: currentUser?.name }, 'Assigned to you')}
              >
                Me
              </Button>
            </div>
          </div>

          {/* Comment */}
          <div className="mt-5 border-t border-slate-100 pt-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-slate-400 uppercase">
              <MessageSquare className="h-3.5 w-3.5" /> Manager comment
            </p>
            <Textarea
              rows={3}
              placeholder="Add an update for the student…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button size="sm" className="mt-2 w-full" disabled={busy} onClick={handleComment}>
              Save comment
            </Button>
          </div>
        </Card>
      </div>

      {/* Resolve / Reject modals */}
      <Modal
        open={actionModal !== null}
        onClose={() => setActionModal(null)}
        title={actionModal === 'resolve' ? 'Resolve complaint' : 'Reject complaint'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setActionModal(null)}>
              Cancel
            </Button>
            {actionModal === 'resolve' ? (
              <Button
                loading={busy}
                onClick={() => handleStatus('resolved', 'Complaint marked as resolved')}
              >
                Resolve
              </Button>
            ) : (
              <Button
                variant="danger"
                loading={busy}
                icon={ShieldAlert}
                onClick={() => handleStatus('rejected', 'Complaint rejected')}
              >
                Reject
              </Button>
            )}
          </>
        }
      >
        <p className="text-sm text-slate-500">
          {actionModal === 'resolve'
            ? 'Marking this complaint as resolved will record the resolution time.'
            : 'Rejecting sends the complaint back to the student. Add a reason so they understand why.'}
        </p>
        <Textarea
          className="mt-4"
          rows={3}
          label="Comment (optional)"
          placeholder="Add a comment for the student…"
          value={modalComment}
          onChange={(e) => setModalComment(e.target.value)}
        />
      </Modal>
    </div>
  );
}
