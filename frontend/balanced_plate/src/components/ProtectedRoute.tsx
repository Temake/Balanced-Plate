import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import { useAuth } from '../hooks/useAuth';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/api/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface JWTPayload {
  exp: number;
  user_id: number;
}

// Check if token is expired or will expire within buffer time (30 seconds)
const isTokenExpired = (token: string, bufferSeconds = 30): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < (currentTime + bufferSeconds);
  } catch {
    return true;
  }
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const {
    isAuthenticated,
    loadCurrentUser,
    setAuthStatus,
    user,
  } = useAuth();

  const [authState, setAuthState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized.current) return;
    
    const verifyAuth = async () => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN);

      // No tokens - redirect to login
      if (!accessToken || !refreshToken) {
        setAuthStatus(false);
        setAuthState('unauthenticated');
        return;
      }

      // Token is valid (not expired) - proceed with auth
      // Note: Token refresh is handled by axios interceptor if needed during API calls
      if (!isTokenExpired(accessToken)) {
        setAuthStatus(true);
        
        // Load user if not already loaded
        if (!user) {
          try {
            await loadCurrentUser();
          } catch {
            // If loading user fails, the axios interceptor will handle token refresh
            // If refresh also fails, it will redirect to login
            setAuthStatus(false);
            setAuthState('unauthenticated');
            return;
          }
        }
        
        setAuthState('authenticated');
        return;
      }

      // Token is expired - let the first API call trigger refresh via interceptor
      // Set auth to true optimistically, axios will handle refresh or redirect
      setAuthStatus(true);
      
      if (!user) {
        try {
          await loadCurrentUser();
          setAuthState('authenticated');
        } catch {
          setAuthStatus(false);
          setAuthState('unauthenticated');
        }
      } else {
        setAuthState('authenticated');
      }
    };

    hasInitialized.current = true;
    verifyAuth();
  }, [loadCurrentUser, setAuthStatus, user]);

  // Reset initialization flag when user changes (e.g., after logout)
  useEffect(() => {
    if (!isAuthenticated && authState === 'authenticated') {
      hasInitialized.current = false;
      setAuthState('unauthenticated');
    }
  }, [isAuthenticated, authState]);

  if (authState === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (authState === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;