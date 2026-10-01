import { useMemo } from 'react';
import { BarChart3, CheckCircle2, Clock, Percent, Timer } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch.js';
import { managerService } from '../../services/api.js';
import { PageHeader } from '../../components/ui/PageHeader.jsx';
import { Card } from '../../components/ui/Card.jsx';
import { StatCard } from '../../components/ui/StatCard.jsx';
import { ErrorState } from '../../components/ui/ErrorState.jsx';
import { BarChart } from '../../components/Charts/BarChart.jsx';
import { DonutChart } from '../../components/Charts/DonutChart.jsx';
import { HBarList } from '../../components/Charts/HBarList.jsx';
import { shortDay, titleCase } from '../../utils/format.js';

const STATUS_COLORS = {
  pending: '#f59e0b',
  in_progress: '#3b82f6',
  resolved: '#10b981',
  rejected: '#ef4444',
};
const PRIORITY_COLORS = {
  low: '#94a3b8',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

export default function Analytics() {
  const { data: analytics, loading, error, refetch } = useFetch(() =>
    managerService.getAnalytics().then((res) => res.analytics)
  );

  const byCategory = useMemo(
    () =>
      Object.entries(analytics?.byCategory || {})
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value),
    [analytics]
  );
  const byStatus = useMemo(
    () =>
      Object.entries(analytics?.byStatus || {})
        .map(([label, value]) => ({ label: titleCase(label), value, color: STATUS_COLORS[label] || '#94a3b8' }))
        .sort((a, b) => b.value - a.value),
    [analytics]
  );
  const byPriority = useMemo(
    () =>
      Object.entries(analytics?.byPriority || {})
        .map(([label, value]) => ({ label: titleCase(label), value, color: PRIORITY_COLORS[label] || '#94a3b8' }))
        .sort((a, b) => b.value - a.value),
    [analytics]
  );
  const topIssues = useMemo(
    () =>
      Object.entries(analytics?.byIssue || {})
        .map(([label, value]) => ({ label, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6),
    [analytics]
  );

  if (error) {
    return (
      <Card>
        <ErrorState message={error.message} onRetry={refetch} />
      </Card>
    );
  }

  const res = analytics?.resolution;

  return (
    <div className="animate-fade-in-up">
      <PageHeader title="Analytics" description="Complaint insights across all hostels." />

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total Complaints" value={analytics?.total ?? '—'} icon={BarChart3} tone="indigo" loading={loading} />
        <StatCard label="Resolved" value={res?.resolved ?? '—'} icon={CheckCircle2} tone="emerald" loading={loading} />
        <StatCard label="Resolution Rate" value={res ? `${res.resolutionRate}%` : '—'} icon={Percent} tone="blue" loading={loading} />
        <StatCard
          label="Avg. Resolution Time"
          value={res && res.avgResolutionDays > 0 ? `${res.avgResolutionDays}d` : '—'}
          icon={Timer}
          tone="amber"
          loading={loading}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Over time */}
        <Card className="p-5 lg:col-span-2">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">Complaints over time</h2>
          <p className="mb-5 text-xs text-slate-400">New complaints per day over the last 14 days</p>
          {loading ? (
            <div className="flex h-44 items-center justify-center text-sm text-slate-400">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
            </div>
          ) : (
            <BarChart
              data={(analytics?.overTime || []).map((t) => ({ label: shortDay(t.date), value: t.count }))}
              height={200}
            />
          )}
        </Card>

        {/* By category */}
        <Card className="p-5">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">Complaints by category</h2>
          <p className="mb-5 text-xs text-slate-400">Which areas generate the most complaints</p>
          {loading ? (
            <div className="flex h-44 items-center justify-center text-sm text-slate-400">Loading…</div>
          ) : byCategory.length ? (
            <HBarList data={byCategory} color="#6366f1" />
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">No data yet.</p>
          )}
        </Card>

        {/* By status */}
        <Card className="p-5">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">Complaints by status</h2>
          <p className="mb-5 text-xs text-slate-400">Where complaints currently stand</p>
          {loading ? (
            <div className="flex h-44 items-center justify-center text-sm text-slate-400">Loading…</div>
          ) : byStatus.length ? (
            <DonutChart data={byStatus} centerValue={analytics?.total} centerLabel="Total" />
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">No data yet.</p>
          )}
        </Card>

        {/* By priority */}
        <Card className="p-5">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">Complaints by priority</h2>
          <p className="mb-5 text-xs text-slate-400">Workload by urgency</p>
          {loading ? (
            <div className="flex h-44 items-center justify-center text-sm text-slate-400">Loading…</div>
          ) : byPriority.length ? (
            <HBarList data={byPriority} color="#f97316" />
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">No data yet.</p>
          )}
        </Card>

        {/* Top issues */}
        <Card className="p-5">
          <h2 className="mb-1 text-sm font-semibold text-slate-900">Most common issues</h2>
          <p className="mb-5 text-xs text-slate-400">Issues reported most frequently</p>
          {loading ? (
            <div className="flex h-44 items-center justify-center text-sm text-slate-400">Loading…</div>
          ) : topIssues.length ? (
            <HBarList data={topIssues} color="#8b5cf6" />
          ) : (
            <p className="py-10 text-center text-sm text-slate-400">No data yet.</p>
          )}
        </Card>
      </div>

      {/* Resolution stats */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Resolution statistics
          </h2>
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-slate-400">Loading…</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Resolved', value: res?.resolved ?? 0, color: 'text-emerald-600' },
                { label: 'Rejected', value: res?.rejected ?? 0, color: 'text-red-600' },
                { label: 'Resolution rate', value: `${res?.resolutionRate ?? 0}%`, color: 'text-blue-600' },
                { label: 'Avg. resolution time', value: res?.avgResolutionDays ? `${res.avgResolutionDays} days` : '—', color: 'text-amber-600' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/60">
                  <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Clock className="h-4 w-4 text-indigo-500" /> Response snapshot
          </h2>
          <p className="text-sm leading-relaxed text-slate-500">
            With <span className="font-semibold text-slate-800">{analytics?.total ?? 0}</span> total complaints and a{' '}
            <span className="font-semibold text-slate-800">{res?.resolutionRate ?? 0}%</span> resolution rate, the hostel
            team closes most issues within {res?.avgResolutionDays ? `${res.avgResolutionDays} days` : 'a short time'} on average.
          </p>
          <div className="mt-5 space-y-3">
            {byStatus.slice(0, 3).map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="flex-1 text-sm text-slate-600">{s.label}</span>
                <span className="text-sm font-semibold text-slate-900">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
