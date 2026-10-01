import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { ROLES } from './utils/constants.js';

import Landing from './pages/Landing.jsx';
import { AuthLayout } from './layouts/AuthLayout.jsx';
import Login from './pages/auth/Login.jsx';
import Register from './pages/auth/Register.jsx';

import { StudentLayout } from './layouts/StudentLayout.jsx';
import StudentDashboard from './pages/student/StudentDashboard.jsx';
import CreateComplaint from './pages/student/CreateComplaint.jsx';
import MyComplaints from './pages/student/MyComplaints.jsx';
import StudentComplaintDetails from './pages/student/StudentComplaintDetails.jsx';

import { ManagerLayout } from './layouts/ManagerLayout.jsx';
import ManagerDashboard from './pages/manager/ManagerDashboard.jsx';
import AllComplaints from './pages/manager/AllComplaints.jsx';
import ManagerComplaintDetails from './pages/manager/ManagerComplaintDetails.jsx';
import Students from './pages/manager/Students.jsx';
import Analytics from './pages/manager/Analytics.jsx';

import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

/** Scroll to top on navigation (respecting in-page anchors). */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ScrollManager />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Student */}
          <Route
            path="/student"
            element={
              <ProtectedRoute roles={[ROLES.STUDENT]}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="complaints/new" element={<CreateComplaint />} />
            <Route path="complaints" element={<MyComplaints />} />
            <Route path="complaints/:id" element={<StudentComplaintDetails />} />
          </Route>

          {/* Manager */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute roles={[ROLES.MANAGER]}>
                <ManagerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ManagerDashboard />} />
            <Route path="complaints" element={<AllComplaints />} />
            <Route path="complaints/:id" element={<ManagerComplaintDetails />} />
            <Route path="students" element={<Students />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>

          {/* Shared */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
