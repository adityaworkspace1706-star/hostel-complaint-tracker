import { Navigate, Outlet, Link } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { ROLES } from '../utils/constants.js';

/** Centered card layout for login/register. Redirects logged-in users home. */
export const AuthLayout = () => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={user.role === ROLES.MANAGER ? '/manager' : '/student'} replace />;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-10">
      {/* Decorative background */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-indigo-100/70 to-transparent"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md">
              <Building2 className="h-6 w-6 text-white" />
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Hostel<span className="text-indigo-600">Care</span>
            </span>
          </Link>
        </div>

        <div className="animate-fade-in-up rounded-2xl bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200/70 sm:p-8">
          <Outlet />
        </div>

        <p className="mt-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
        </p>
      </div>
    </div>
  );
};
