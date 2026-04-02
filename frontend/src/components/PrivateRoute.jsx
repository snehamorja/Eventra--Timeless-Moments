import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PrivateRoute = () => {
  const token = localStorage.getItem('access_token');
  const location = useLocation();

  if (token) return <Outlet />;

  // Save pending navigation so we can resume after login
  try {
    const pending = { to: location.pathname, state: location.state || null };
    localStorage.setItem('pendingNavigation', JSON.stringify(pending));
  } catch (e) {
    // ignore serialization errors
  }

  return <Navigate to="/login" replace />;
};

export default PrivateRoute;
