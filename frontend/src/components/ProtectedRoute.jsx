import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ROLES } from '../utils/constants.js';

/**
 * Route guard.
 *  - Not logged in  -> redirect to /login (remembering where they came from)
 *  - Wrong role     -> redirect to that role's own dashboard
 */
export const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === ROLES.MANAGER ? '/manager' : '/student'}
        replace
      />
    );
  }

  return children;
};
