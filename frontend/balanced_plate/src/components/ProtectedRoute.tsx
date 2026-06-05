import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/api/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { loadCurrentUser, setAuthStatus, user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'ok' | 'redirect'>('loading');
  const location = useLocation();

  useEffect(() => {
    const init = async () => {
      const access = localStorage.getItem(ACCESS_TOKEN);
      const refresh = localStorage.getItem(REFRESH_TOKEN);

      if (!access || !refresh) {
        setAuthStatus(false);
        setStatus('redirect');
        return;
      }

      if (user) {
        setStatus('ok');
        return;
      }

      try {
        await loadCurrentUser();
        setStatus('ok');
      } catch {
        setAuthStatus(false);
        setStatus('redirect');
      }
    };

    init();
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'redirect') {
    return <Navigate to="/login" replace />;
  }

  // Redirect to onboarding if user hasn't completed it
  // (but don't redirect if they're already on the onboarding page)
  if (
    user &&
    user.onboarding_completed === false &&
    location.pathname !== '/onboarding'
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;