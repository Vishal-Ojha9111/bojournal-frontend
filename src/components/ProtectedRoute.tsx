// FILE: src/components/ProtectedRoute.tsx
// PURPOSE: Route wrapper that requires authentication
// API: GET /api/v2/auth/check (via useCurrentUser hook)

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../features/auth/hooks';
import { Skeleton } from './ui';

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute wrapper
 * - Checks if user is authenticated
 * - Shows loading state while checking
 * - Redirects to login if not authenticated (preserves intended location)
 * - Renders children if authenticated
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useCurrentUser();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="space-y-4 w-80">
          <Skeleton variant="rectangular" width="100%" height={24} />
          <Skeleton variant="rectangular" width="80%" height={16} />
          <Skeleton variant="rectangular" width="60%" height={16} />
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
