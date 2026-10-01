import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
        <Compass className="h-8 w-8 text-indigo-600" />
      </span>
      <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900">Page not found</h1>
      <p className="mt-3 max-w-sm text-sm text-slate-500">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
      >
        <Home className="h-4 w-4" /> Back to home
      </Link>
    </div>
  );
}
