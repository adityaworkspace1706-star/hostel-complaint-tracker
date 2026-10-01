import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/** Page header with optional back link and action buttons. */
export const PageHeader = ({ title, description, backTo, actions }) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0">
      {backTo && (
        <Link
          to={backTo}
          className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      )}
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
);
