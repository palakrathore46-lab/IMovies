// src/components/ProtectedRoute.jsx - Route wrapper to guard authenticated and admin pages
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // Show a loading spinner while checking auth state from localStorage / API
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading authentication...</span>
        </div>
      </div>
    );
  }

  // If user is not logged in, redirect to login page (preserve current route in state)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If page requires admin rights and current user is not admin, redirect to home
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
