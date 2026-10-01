import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Building2, LogOut, Menu, ShieldCheck, User, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { Avatar } from '../ui/Avatar.jsx';

/**
 * Shared authenticated dashboard shell: sidebar + topbar + outlet.
 *
 * Nav item matching:
 *  - `exact: true`   -> active only when the path matches exactly
 *  - `exclude: [...]`-> never active on those sub-paths (e.g. "/student/complaints"
 *                       should not light up on "/student/complaints/new")
 *  - otherwise       -> active on the path and everything under it
 */
export const DashboardLayout = ({ navItems, roleLabel, roleIcon: RoleIcon = ShieldCheck }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  const isItemActive = (item) => {
    if (item.exclude?.some((path) => location.pathname.startsWith(path))) return false;
    if (item.exact) return location.pathname === item.to;
    return location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600">
              <Building2 className="h-5 w-5 text-white" />
            </span>
            <div>
              <p className="text-sm leading-tight font-bold text-slate-900">HostelCare</p>
              <p className="text-[11px] font-medium text-slate-400">Complaint Tracker</p>
            </div>
          </div>
          <button
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu
          </p>
          {navItems.map((item) => {
            const active = isItemActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <Avatar name={user?.name} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              <RoleIcon className="h-3.5 w-3.5" />
              {roleLabel}
            </span>
          </div>

          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-slate-100 sm:pr-3"
            >
              <Avatar name={user?.name} size="sm" />
              <span className="hidden text-sm font-medium text-slate-700 sm:block">
                {user?.name}
              </span>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                <div className="absolute right-0 z-40 mt-2 w-52 animate-fade-in-up rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200">
                  <div className="border-b border-slate-100 px-3 py-2.5">
                    <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                    <p className="truncate text-xs text-slate-400">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate('/profile');
                    }}
                    className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" /> Profile
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
