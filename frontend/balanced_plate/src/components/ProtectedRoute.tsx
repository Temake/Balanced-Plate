import React, { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import { useAuth } from '../hooks/useAuth';
import api from '@/api/axios';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/api/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const {
    isAuthenticated,
    loadCurrentUser,
    setAuthStatus,
    logout,
    user,
  } = useAuth();

  const [isChecking, setIsChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  interface JWTPayload {
    exp: number;
    user_id: number;
  }

  const isTokenExpired = useCallback((token: string): boolean => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return true;
    }
  }, []);

  const refreshAccessToken = useCallback(async (refreshToken: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/token/refresh/', {
        refresh: refreshToken,
      });

      if (response.data?.access) {
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const handleLogout = async () => {
      setAuthStatus(false);
      await logout();
      if (isMounted) {
        setShouldRedirect(true);
        setIsChecking(false);
      }
    };

    const verifyAuthentication = async () => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);

      if (!accessToken || !refreshToken) {
        await handleLogout();
        return;
      }

      if (isTokenExpired(accessToken)) {
        const refreshed = await refreshAccessToken(refreshToken);
        if (!refreshed) {
          await handleLogout();
          return;
        }
      }

      setAuthStatus(true);

      if (!user) {
        try {
          await loadCurrentUser();
        } catch (error) {
          console.error('Failed to load user after token validation:', error);
          await handleLogout();
          return;
        }
      }

      if (isMounted) {
        setIsChecking(false);
      }
    };

    verifyAuthentication();

    return () => {
      isMounted = false;
    };
  }, [
    loadCurrentUser,
    logout,
    refreshAccessToken,
    setAuthStatus,
    user,
    isTokenExpired,
  ]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (shouldRedirect || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;