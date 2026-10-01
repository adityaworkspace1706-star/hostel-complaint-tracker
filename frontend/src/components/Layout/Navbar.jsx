import { Link } from 'react-router-dom';
import { Menu, X, Building2 } from 'lucide-react';
import { useState } from 'react';

const NAV_LINKS = [
  { label: 'About', to: '/#about' },
  { label: 'Features', to: '/#features' },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sm">
            <Building2 className="h-5 w-5 text-white" />
          </span>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Hostel<span className="text-indigo-600">Care</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            Register
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pt-2 pb-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2 border-t border-slate-100 pt-3">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg px-4 py-2 text-center text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-200"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
