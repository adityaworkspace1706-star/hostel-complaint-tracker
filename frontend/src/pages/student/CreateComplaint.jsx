import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Info } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { ComplaintForm } from '../../components/Complaints/ComplaintForm.jsx';
import { complaintService } from '../../services/api.js';
import { useToast } from '../../hooks/useToast.js';

export default function CreateComplaint() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const result = await complaintService.create(values);
      showToast(`${result.complaint.complaintId} submitted successfully`);
      navigate('/student/complaints', { replace: true });
    } catch (err) {
      showToast(err.message, 'error');
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Create Complaint"
        description="Select a category and specific issue — priority is assigned automatically."
      />

      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-start gap-3 rounded-xl bg-blue-50 px-4 py-3.5 text-sm text-blue-800 ring-1 ring-blue-600/10">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Only predefined categories and issues are accepted. When you pick an issue, the
            system assigns a default priority — managers can adjust it if needed.
          </p>
        </div>

        <ComplaintForm onSubmit={handleSubmit} submitting={submitting} />

        <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ClipboardList className="h-3.5 w-3.5" />
          After submission you&apos;ll be taken to My Complaints to track it.
        </p>
      </div>
    </div>
  );
}
