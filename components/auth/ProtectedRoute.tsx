import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import Spinner from '../ui/Spinner'; // Corrected path

interface ProtectedRouteProps {
  // children?: React.ReactNode; // Outlet is preferred for nested routes
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = () => {
  const { state } = useAppContext();
  const location = useLocation();

  if (state.isAuthLoading) {
    // Show a loading spinner or a blank page while checking auth status
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" label="Verificando autenticação" />
      </div>
    );
  }

  if (!state.isAuthenticated) {
    // Redirect them to the /home page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/home" state={{ from: location }} replace />;
  }

  return <Outlet />; // Render the child route component
};

export default ProtectedRoute;