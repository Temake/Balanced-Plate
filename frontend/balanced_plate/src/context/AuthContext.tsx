import React, { createContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";
import type { User,LoginCredentials,LoginResponse,AuthContextType,SignupCredentials,SignupResponse} from '../api/types'
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../api/constants";

interface JWTPayload {
  exp: number;
  user_id: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);


  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      console.error('Error decoding token:', error);
      return true;
    }
  };

  // Token refresh function
  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN);
      if (!refreshTokenValue) {
        console.log('No refresh token found');
        return false;
      }

      const response = await api.post('/auth/token/refresh/', {
        refresh: refreshTokenValue
      });

      if (response.data.access) {
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  };

  // Updated auth check function
  const checkAuthStatus = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

  
    if (isTokenExpired(token)) {
      console.log('Access token expired, attempting refresh');
      const refreshSuccess = await refreshToken();
      
      if (refreshSuccess) {
       
        try {
          const response = await api.get('/accounts/me/');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to get user data after refresh:', error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } else {
      
      try {
        const response = await api.get('/accounts/me/');
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        setIsAuthenticated(false);
      }
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<LoginResponse>('/auth/login/', credentials);
      if (response.status == 200){
        const { user: userData, token } = response.data;

        localStorage.setItem(ACCESS_TOKEN, token.access);
        localStorage.setItem(REFRESH_TOKEN, token.refresh);

        setUser(userData);
        setIsAuthenticated(true);
        setError(null);
      }
      else {
        const message = 'Login failed';
        console.log(response.status);
        setError(message);
        setIsAuthenticated(false);
      }
      
      return response.data;
    } catch (error:unknown) {
      let errorMessage = 'Login failed. Please try again.';
      
      if (typeof error === 'object' && error && 'response' in error) {
        const response = (error as { response?: { data?: { detail?: string; message?: string } } }).response;
        errorMessage = response?.data?.message || response?.data?.detail || errorMessage;
      }
      
      setError(errorMessage);
      setIsAuthenticated(false);
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const SignUp = async (credential:SignupCredentials):Promise<SignupResponse> =>{
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post<SignupResponse>('/accounts/', credential);
      if (response.status == 201){
        const { user: userData, token } = response.data;

        localStorage.setItem(ACCESS_TOKEN, token.access);
        localStorage.setItem(REFRESH_TOKEN, token.refresh);

        setUser(userData);
        setIsAuthenticated(true);
        return response.data;
      }
      else {
        setError("Signup Failed");
        setIsAuthenticated(false);
        console.error('SignUp failed:', response);
        throw new Error('SignUp failed');
      }
    } catch (error: unknown) {
      let errorMessage = 'SignUp failed. Please try again.';

      if (typeof error === 'object' && error && 'response' in error) {
        const response = (error as { response?: { data?: { detail?: string; message?: {phone_number:string,password:string,email:string} } } }).response;
        errorMessage = response?.data?.message?.phone_number || response?.data?.message?.password || response?.data?.message?.email || errorMessage;
        errorMessage = errorMessage[0];
      }
      setError(errorMessage);
      setIsAuthenticated(false);
      throw error;
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
      let errorMessage = 'Failed to send password reset email. Please try again.';

      if (typeof error === 'object' && error && 'response' in error) {
        const response = (error as { response?: { data?: { detail?: string; message?: string } } }).response;
        errorMessage = response?.data?.message || response?.data?.detail || errorMessage;
      }

      setError(errorMessage);
      console.error('Forgot Password error:', error);
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
      let errorMessage = 'Failed to verify OTP. Please try again.';

      if (typeof error === 'object' && error && 'response' in error) {
        const response = (error as { response?: { data?: { message?: string } } }).response;
        errorMessage = response?.data?.message || errorMessage;
      }

      setError(errorMessage);
      console.error('OTP verification error:', error);
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
      let errorMessage = 'Failed to reset password. Please try again.';
      if (typeof error === 'object' && error && 'response' in error) {
        const resp = (error as { response?: { data?: { detail?: string; message?: string } } }).response;
        errorMessage = resp?.data?.message || resp?.data?.detail || errorMessage;
      }
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    
    try {
      await api.post('/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(REFRESH_TOKEN);
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    forgetPassword,
    otpVerify,
    resetPassword,
    SignUp,
    isLoading,
    isAuthenticated: isAuthenticated ?? false,
    login,
    logout,
    error,
    clearError,
  
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;