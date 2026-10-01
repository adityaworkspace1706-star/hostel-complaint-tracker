import { GraduationCap, LayoutDashboard, PlusCircle, ClipboardList, User } from 'lucide-react';
import { DashboardLayout } from '../components/Layout/DashboardLayout.jsx';

const NAV_ITEMS = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/student/complaints/new', label: 'Create Complaint', icon: PlusCircle, exact: true },
  {
    to: '/student/complaints',
    label: 'My Complaints',
    icon: ClipboardList,
    exclude: ['/student/complaints/new'],
  },
  { to: '/profile', label: 'Profile', icon: User, exact: true },
];

export const StudentLayout = () => (
  <DashboardLayout navItems={NAV_ITEMS} roleLabel="Student" roleIcon={GraduationCap} />
);
