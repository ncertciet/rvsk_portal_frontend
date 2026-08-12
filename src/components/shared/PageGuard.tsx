import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface Props {
  module: string;
  pageId: string;
  children: React.ReactNode;
}

/**
 * Route guard that checks page-level access from the user's JWT claims.
 * If the user doesn't have access to the specified module+page, redirects to dashboard.
 * 
 * Super_Admin and RVSK_Admin always pass through (they have all access).
 * If no access map exists in user profile (legacy/migration), allows access.
 */
export default function PageGuard({ module, pageId, children }: Props) {
  const user = useSelector((state: RootState) => state.auth.user);

  // No user = not authenticated (ProtectedRoute handles this)
  if (!user) return <Navigate to="/login" replace />;

  // Super admins always have full access
  if (user.role === 'Super_Admin' || user.role === 'RVSK_Admin') {
    return <>{children}</>;
  }

  // If no access map (legacy token or migration), allow access
  if (!user.access) {
    return <>{children}</>;
  }

  const pages = user.access[module] || [];

  // Check if user has wildcard or specific page access
  if (pages.includes('*') || pages.includes(pageId)) {
    return <>{children}</>;
  }

  // Access denied — redirect to dashboard
  return <Navigate to="/rvsk/dashboard" replace />;
}
