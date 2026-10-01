import { LayoutDashboard, ClipboardList, Users, BarChart3, User, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '../components/Layout/DashboardLayout.jsx';

const NAV_ITEMS = [
  { to: '/manager', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  // highlights on detail pages too, but not on /manager/complaints/new (none exists today)
  { to: '/manager/complaints', label: 'All Complaints', icon: ClipboardList },
  { to: '/manager/students', label: 'Students', icon: Users, exact: true },
  { to: '/manager/analytics', label: 'Analytics', icon: BarChart3, exact: true },
  { to: '/profile', label: 'Profile', icon: User, exact: true },
];

export const ManagerLayout = () => (
  <DashboardLayout navItems={NAV_ITEMS} roleLabel="Manager" roleIcon={ShieldCheck} />
);
