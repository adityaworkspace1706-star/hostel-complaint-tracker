import { AlertTriangle } from 'lucide-react';
import { Button } from './Button.jsx';

/** Error state with optional retry. */
export const ErrorState = ({ title = 'Something went wrong', message, onRetry }) => (
  <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
      <AlertTriangle className="h-7 w-7 text-red-500" />
    </div>
    <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
    {message && <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>}
    {onRetry && (
      <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);
