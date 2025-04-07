import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import Spinner from './Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'manager' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, loading } = useAuthContext();
  const location = useLocation();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('Not authenticated, redirecting to login');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('user:', user);
    console.log('localStorage token:', localStorage.getItem('token'));
    console.log('localStorage user:', localStorage.getItem('user'));
    
    // Check if we have token and user in localStorage but not in state
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      console.log('Found token and user in localStorage but not in state, attempting to recover');
      try {
        // Try to parse user data
        const userData = JSON.parse(userStr);
        if (userData && userData.id) {
          console.log('Successfully parsed user data, not redirecting to login');
          // Don't redirect, let the AuthContext useEffect handle the recovery
          return (
            <div className="min-h-screen flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          );
        }
      } catch (e) {
        console.error('Error parsing user data from localStorage:', e);
      }
    }
    
    // Clear any potentially corrupted auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check role-based access if requiredRole is specified
  if (requiredRole && user?.role !== requiredRole) {
    // For admin-only routes, redirect to unauthorized page
    if (requiredRole === 'admin') {
      return <Navigate to="/unauthorized" replace />;
    }
    
    // For manager-only routes, allow access to admins too
    if (requiredRole === 'manager' && user?.role !== 'admin') {
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
