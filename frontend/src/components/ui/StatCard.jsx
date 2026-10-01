import { Card } from './Card.jsx';
import { Spinner } from './Spinner.jsx';

const TONES = {
  indigo: { bg: 'bg-indigo-50 text-indigo-600' },
  amber: { bg: 'bg-amber-50 text-amber-600' },
  blue: { bg: 'bg-blue-50 text-blue-600' },
  emerald: { bg: 'bg-emerald-50 text-emerald-600' },
  red: { bg: 'bg-red-50 text-red-600' },
  slate: { bg: 'bg-slate-100 text-slate-600' },
};

/** Dashboard KPI card. */
export const StatCard = ({ label, value, icon: Icon, tone = 'indigo', sub, loading = false }) => {
  const { bg } = TONES[tone] || TONES.indigo;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-500">{label}</p>
          {loading ? (
            <div className="mt-2">
              <Spinner className="h-5 w-5" label="" />
            </div>
          ) : (
            <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
          )}
          {sub && <p className="mt-1 truncate text-xs text-slate-400">{sub}</p>}
        </div>
        {Icon && (
          <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </Card>
  );
};
