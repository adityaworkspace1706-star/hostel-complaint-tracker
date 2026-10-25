import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch.js';
import { useToast } from '../../hooks/useToast.js';
import { complaintService } from '../../services/api.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { ComplaintDetailsView } from '../../components/Complaints/ComplaintDetailsView.jsx';

export default function StudentComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [saving, setSaving] = useState(false);
  const submitFeedback = async () => { setSaving(true); try { await complaintService.feedback(id, { rating, comment: feedbackComment }); showToast('Feedback submitted'); await refetch(); } catch(e) { showToast(e.message, 'error'); } finally { setSaving(false); } };
  const reopen = async () => { setSaving(true); try { await complaintService.reopen(id, { reason: reopenReason }); showToast('Complaint reopened'); setReopenReason(''); await refetch(); } catch(e) { showToast(e.message, 'error'); } finally { setSaving(false); } };

  const { data: complaint, loading, error, refetch } = useFetch(
    () => complaintService.getById(id).then((res) => res.complaint),
    [id]
  );

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await complaintService.remove(id);
      showToast('Complaint deleted');
      navigate('/student/complaints', { replace: true });
    } catch (err) {
      showToast(err.message, 'error');
      setDeleting(false);
      setConfirmOpen(false);
    }
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

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title={complaint.complaintId}
        description="Complaint details and status timeline."
        backTo="/student/complaints"
        actions={
          complaint.status === 'pending' ? (
            <Button
              variant="dangerOutline"
              icon={Trash2}
              onClick={() => setConfirmOpen(true)}
            >
              Delete
            </Button>
          ) : null
        }
      />

      <ComplaintDetailsView complaint={complaint} />
      {complaint.status === 'resolved' && <Card className="mt-6 p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">Resolution feedback</h2>
        {complaint.feedbackRating == null ? <div className="space-y-3">
          <label className="block text-sm">Rating (1–5 stars)</label>
          <select aria-label="Resolution rating" className="rounded-lg border p-2" value={rating} onChange={e => setRating(Number(e.target.value))}>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n} star{n !== 1 ? 's' : ''}</option>)}</select>
          <textarea aria-label="Feedback comment" className="block w-full rounded-lg border p-3" maxLength={500} placeholder="Optional feedback" value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)} />
          <Button disabled={saving} onClick={submitFeedback}>Submit feedback</Button>
        </div> : <p className="text-sm text-emerald-700">Your feedback: {complaint.feedbackRating}/5 stars</p>}
        <div className="border-t pt-4 space-y-3">
          <h3 className="font-semibold">Issue still unresolved?</h3>
          <textarea aria-label="Reason for reopening" className="block w-full rounded-lg border p-3" maxLength={500} placeholder="Explain why the issue needs attention again" value={reopenReason} onChange={e => setReopenReason(e.target.value)} />
          <Button disabled={saving || !reopenReason.trim()} onClick={reopen}>Reopen complaint</Button>
        </div>
      </Card>}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete this complaint?"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              Delete complaint
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-500">
          This will permanently remove <span className="font-semibold text-slate-800">{complaint.complaintId}</span>.
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
