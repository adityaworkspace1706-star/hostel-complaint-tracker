import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  FilePlus2,
  Inbox,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch.js';
import { complaintService } from '../../services/api.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { ComplaintTable } from '../../components/Complaints/ComplaintTable.jsx';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { data: complaints, loading, error, refetch } = useFetch(() =>
    complaintService.getMy().then((res) => res.complaints)
  );

  const stats = useMemo(() => {
    const s = { total: complaints?.length ?? 0, pending: 0, in_progress: 0, resolved: 0 };
    (complaints || []).forEach((c) => {
      if (s[c.status] !== undefined) s[c.status] += 1;
    });
    return s;
  }, [complaints]);

  const recent = useMemo(
    () =>
      [...(complaints || [])]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
    [complaints]
  );

  const openCount = stats.total - stats.resolved;

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Dashboard"
        description="A quick overview of your complaints and their status."
        actions={
          <Button icon={FilePlus2} onClick={() => navigate('/student/complaints/new')}>
            New Complaint
          </Button>
        }
      />

      {error ? (
        <Card>
          <ErrorState message={error.message} onRetry={refetch} />
        </Card>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard label="Total Complaints" value={stats.total} icon={ClipboardList} tone="indigo" loading={loading} />
            <StatCard label="Pending" value={stats.pending} icon={Clock} tone="amber" loading={loading} />
            <StatCard label="In Progress" value={stats.in_progress} icon={PlayCircle} tone="blue" loading={loading} />
            <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} tone="emerald" loading={loading} />
          </div>

          {/* Welcome banner when there are no complaints yet */}
          {!loading && !error && complaints?.length === 0 && (
            <Card className="mt-6 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-8 sm:px-8">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                      <Sparkles className="h-6 w-6 text-white" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-white">Found a problem? Report it in under a minute.</h2>
                      <p className="text-sm text-indigo-100">
                        Pick a category, choose the issue, and we&apos;ll handle the rest.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    icon={FilePlus2}
                    onClick={() => navigate('/student/complaints/new')}
                    className="shrink-0"
                  >
                    Create Your First Complaint
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Recent complaints */}
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Recent complaints</h2>
              <Link to="/student/complaints" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                View all
              </Link>
            </div>
            {loading ? (
              <Card className="p-16">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
                  Loading your complaints…
                </div>
              </Card>
            ) : recent.length > 0 ? (
              <ComplaintTable
                complaints={recent}
                onView={(id) => navigate(`/student/complaints/${id}`)}
              />
            ) : (
              <Card>
                <EmptyState
                  icon={Inbox}
                  title="No complaints yet"
                  description="When you report a problem, it will show up here."
                >
                  <Button icon={FilePlus2} onClick={() => navigate('/student/complaints/new')}>
                    Create Your First Complaint
                  </Button>
                </EmptyState>
              </Card>
            )}
          </div>

          {!loading && openCount > 0 && (
            <p className="mt-6 text-center text-xs text-slate-400">
              You have {openCount} open {openCount === 1 ? 'complaint' : 'complaints'} being processed.
            </p>
          )}
        </>
      )}
    </div>
  );
}
