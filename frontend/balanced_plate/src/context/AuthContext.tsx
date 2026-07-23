import React, { createContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import api from "../api/axios";
import type { User, LoginCredentials, LoginResponse, AuthContextType, SignupCredentials, SignupResponse, OnboardingData } from '../api/types'
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../api/constants";

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (typeof error === 'object' && error && 'response' in error) {
    const response = (error as { response?: { data?: any } }).response;
    const data = response?.data;
    if (data) {
      // 1. If message is a string
      if (typeof data.message === 'string') {
        return data.message;
      }
      
      // 2. If message is an object (like a dict of field errors)
      if (data.message && typeof data.message === 'object') {
        const msgObj = data.message;
        const fieldError = msgObj.email || msgObj.password || msgObj.phone_number || msgObj.detail || msgObj.message;
        if (fieldError) {
          return Array.isArray(fieldError) ? fieldError[0] : String(fieldError);
        }
        // Fallback to the first available key in the message object
        const firstKey = Object.keys(msgObj)[0];
        if (firstKey) {
          const val = msgObj[firstKey];
          return Array.isArray(val) ? val[0] : String(val);
        }
      }

      // 3. If detail is a string
      if (typeof data.detail === 'string') {
        return data.detail;
      }

      // 4. If errors object is present (e.g. QuerySetException)
      if (data.errors && typeof data.errors === 'object') {
        const firstErrorKey = Object.keys(data.errors)[0];
        const firstError = data.errors[firstErrorKey];
        return Array.isArray(firstError) ? firstError[0] : String(firstError);
      }

      // 5. If data itself is a dictionary of field errors
      const firstKey = Object.keys(data)[0];
      if (firstKey && firstKey !== 'status') {
        const val = data[firstKey];
        return Array.isArray(val) ? val[0] : String(val);
      }
    }
  }
  return error instanceof Error ? error.message : defaultMessage;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const setAuthStatus = useCallback((status: boolean) => {
    setIsAuthenticated(status);
  }, []);

  const loadCurrentUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/accounts/me/');
      setUser(data);
      setIsAuthenticated(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<LoginResponse>('/auth/login/', credentials);
      if (response.status === 200) {
        const { user: userData, token } = response.data;

        localStorage.setItem(ACCESS_TOKEN, token.access);
        localStorage.setItem(REFRESH_TOKEN, token.refresh);

        setUser(userData);
        setIsAuthenticated(true);
        setError(null);
      } else {
        setError('Login failed');
        setIsAuthenticated(false);
      }
      
      return response.data;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Login failed. Please try again.');
      setError(errorMessage);
      setIsAuthenticated(false);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const SignUp = async (credential:SignupCredentials):Promise<SignupResponse> =>{
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<SignupResponse>('/accounts/', credential);
      if (response.status === 201) {
        
        return response.data;
      } else {
        setError("Signup Failed");
        setIsAuthenticated(false);
        throw new Error('SignUp failed');
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'SignUp failed. Please try again.');
      setError(errorMessage);
      setIsAuthenticated(false);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const forgetPassword = async (email: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/email/verify/', { email });
      const msg: string = response.data?.message ||'OTP sent to your email.';
      return msg;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to send password reset email. Please try again.');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const otpVerify = async (email: string, otpCode: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post(`/auth/otp/verify/?email=${encodeURIComponent(email)}`, { otp: Number(otpCode) });
      const msg: string = response.data?.message || 'OTP verified.';
      return msg;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to verify OTP. Please try again.');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAccount = async (email: string, otpCode: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/signup/verify-otp/', {
        email,
        otp: Number(otpCode),
      });
      const msg: string = response.data?.message || 'Email verified successfully.';
      return msg;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to verify your account. Please try again.');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendAccountVerificationOtp = async (email: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/signup/resend-otp/', {
        email,
        purpose: 'signup',
      });
      const msg: string = response.data?.message || 'Verification OTP sent to your email.';
      return msg;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to resend verification code. Please try again.');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string, password: string, confirmPassword: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.patch(`/accounts/password/reset/?email=${encodeURIComponent(email)}`, {
        password,
        confirm_password: confirmPassword,
      });
      const msg: string = response.data?.message || 'Password changed successfully';
      return msg;
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to reset password. Please try again.');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await api.post('/auth/logout/');
    } catch {
      // Silently handle logout errors - we'll clear local state anyway
    }

    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  }, []);

  const clearError = () => {
    setError(null);
  };

  const completeOnboarding = async (data: OnboardingData): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.patch<User>('/accounts/me/complete-onboarding/', {
        dietary_goal: data.dietary_goal,
        dietary_preference: data.dietary_preference,
        health_conditions: data.health_conditions,
      });
      setUser(response.data);
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to save preferences. Please try again.');
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    forgetPassword,
    otpVerify,
    verifyAccount,
    resendAccountVerificationOtp,
    resetPassword,
    SignUp,
    isLoading,
    isAuthenticated,
    login,
    logout,
    error,
    clearError,
    loadCurrentUser,
    setAuthStatus,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
