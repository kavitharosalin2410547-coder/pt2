import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingState } from '../common/LoadingState';
import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return <LoadingState label="Checking session" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
