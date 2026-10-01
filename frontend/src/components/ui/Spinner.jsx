import { Loader2 } from 'lucide-react';

export const Spinner = ({ className = 'h-5 w-5', label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-2 text-sm text-slate-400" role="status">
    <Loader2 className={`animate-spin text-indigo-600 ${className}`} />
    {label && <span>{label}</span>}
  </div>
);

/** Full-height centered spinner for page loads. */
export const PageLoader = ({ label = 'Loading…' }) => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      <p className="text-sm font-medium text-slate-400">{label}</p>
    </div>
  </div>
);
