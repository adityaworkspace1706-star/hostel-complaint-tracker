import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  CheckCircle2,
  ClipboardList,
  Clock,
  Inbox,
  PlayCircle,
  TrendingUp,
} from 'lucide-react';
import { useFetch } from '../../hooks/useFetch.js';
import { complaintService, managerService } from '../../services/api.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { ComplaintTable } from '../../components/Complaints/ComplaintTable.jsx';
import { BarChart } from '../../components/Charts/BarChart.jsx';
import { shortDay } from '../../utils/format.js';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const { data: complaints, loading, error, refetch } = useFetch(() =>
    complaintService.getAll().then((res) => res.complaints)
  );
  const { data: analytics } = useFetch(() => managerService.getAnalytics().then((res) => res.analytics));

  const stats = useMemo(() => {
    const s = { total: complaints?.length ?? 0, pending: 0, in_progress: 0, resolved: 0, critical: 0 };
    (complaints || []).forEach((c) => {
      if (s[c.status] !== undefined) s[c.status] += 1;
      if (c.priority === 'critical' && c.status !== 'resolved' && c.status !== 'rejected') {
        s.critical += 1;
      }
    });
    return s;
  }, [complaints]);

  const sorted = useMemo(
    () => [...(complaints || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [complaints]
  );
  const recent = sorted.slice(0, 5);
  const critical = useMemo(
    () => sorted.filter((c) => c.priority === 'critical' && c.status !== 'resolved' && c.status !== 'rejected'),
    [sorted]
  );

  const trend = analytics?.overTime || [];

  return (
    <div className="animate-fade-in-up">
      <PageHeader
        title="Dashboard"
        description="An overview of complaints across all hostels."
      />

      {error ? (
        <Card>
          <ErrorState message={error.message} onRetry={refetch} />
        </Card>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            <StatCard label="Total Complaints" value={stats.total} icon={ClipboardList} tone="indigo" loading={loading} />
            <StatCard label="Pending" value={stats.pending} icon={Clock} tone="amber" loading={loading} />
            <StatCard label="In Progress" value={stats.in_progress} icon={PlayCircle} tone="blue" loading={loading} />
            <StatCard label="Resolved" value={stats.resolved} icon={CheckCircle2} tone="emerald" loading={loading} />
            <StatCard label="Critical" value={stats.critical} icon={AlertOctagon} tone="red" loading={loading} />
          </div>

          {/* Critical complaints */}
          {!loading && critical.length > 0 && (
            <Card className="mt-6 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-red-100 bg-red-50/60 px-5 py-3.5">
                <AlertOctagon className="h-5 w-5 text-red-600" />
                <h2 className="text-sm font-bold text-red-700">
                  {critical.length} critical {critical.length === 1 ? 'complaint' : 'complaints'} need attention
                </h2>
              </div>
              <div className="p-4">
                <ComplaintTable
                  complaints={critical.slice(0, 4)}
                  showStudent
                  onView={(id) => navigate(`/manager/complaints/${id}`)}
                />
              </div>
            </Card>
          )}

          {/* Trend + recent */}
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-1">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <TrendingUp className="h-4 w-4 text-indigo-500" /> Complaint trends
                </h2>
                <Link to="/manager/analytics" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
                  Analytics
                </Link>
              </div>
              {trend.length ? (
                <BarChart data={trend.map((t) => ({ label: shortDay(t.date), value: t.count }))} height={170} />
              ) : (
                <p className="py-8 text-center text-sm text-slate-400">No trend data yet.</p>
              )}
            </Card>

            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">Recent complaints</h2>
                <Link to="/manager/complaints" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500">
                  View all
                </Link>
              </div>
              {loading ? (
                <Card className="p-16">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
                    Loading complaints…
                  </div>
                </Card>
              ) : recent.length > 0 ? (
                <ComplaintTable
                  complaints={recent}
                  showStudent
                  onView={(id) => navigate(`/manager/complaints/${id}`)}
                />
              ) : (
                <Card>
                  <EmptyState icon={Inbox} title="No complaints yet" description="New complaints will appear here." />
                </Card>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
