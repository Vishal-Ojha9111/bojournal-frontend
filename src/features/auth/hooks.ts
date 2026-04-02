// FILE: src/features/auth/hooks.ts
// PURPOSE: React Query hooks for authentication
// API: All auth endpoints via authApi

import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { queryKeys } from '../../lib/queries';
import authApi from './api';
import type {
  SignupInput,
  OtpInput,
  LoginInput,
  ResetPasswordRequestInput,
  UpdatePasswordInput,
} from './schemas';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../lib/apiClient';
import { setStoredUser, clearStoredUser } from '../../lib/userStorage';

/**
 * Hook to check authentication status
 */
export const useAuthCheck = () => {
  return useQuery({
    queryKey: queryKeys.auth.check,
    queryFn: async () => {
      const response = await authApi.checkAuth();
      // Store/update user data in localStorage whenever we get fresh data
      if (response?.user) {
        setStoredUser(response.user);
      }
      return response;
    },
    retry: false,
    staleTime: 0, // Always refetch when component mounts
    refetchOnMount: 'always', // Always refetch on mount
  });
};

/**
 * Hook to signup
 */
export const useSignup = () => {
  return useMutation({
    mutationFn: (data: SignupInput) => authApi.signup(data),
    onSuccess: () => {
      toast.success('OTP sent to your email');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Hook to verify OTP
 */
export const useVerifyOtp = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: OtpInput) => authApi.verifyOtp(data),
    onSuccess: async (response) => {
      // Store user data in localStorage if signup was successful
      if (response?.user) {
        setStoredUser(response.user);
      }
      
      // Invalidate auth check to refetch user data
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.check });
      
      if (response.data?.action === 'password_reset') {
        toast.success('OTP verified. You can now update your password.');
      } else {
        toast.success('Account verified successfully!');
        navigate('/app/dashboard');
      }
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Hook to resend OTP
 */
export const useResendOtp = () => {
  return useMutation({
    mutationFn: (email: string) => authApi.resendOtp(email),
    onSuccess: () => {
      toast.success('OTP resent to your email');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Hook to login
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: async (response) => {
      // Store user data in localStorage
      if (response?.user) {
        setStoredUser(response.user);
      }
      
      // Refetch auth check immediately to get user data
      await queryClient.refetchQueries({ queryKey: queryKeys.auth.check });
      toast.success('Login successful!');
      // Navigate to dashboard
      navigate('/app/dashboard', { replace: true });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Hook to logout
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear user data from localStorage
      clearStoredUser();
      
      // Clear all cached data
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate('/auth/login');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Hook to request password reset
 */
export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (data: ResetPasswordRequestInput) => authApi.requestPasswordReset(data),
    onSuccess: () => {
      toast.success('OTP sent to your email');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Hook to update password
 */
export const useUpdatePassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: UpdatePasswordInput) => authApi.updatePassword(data),
    onSuccess: () => {
      toast.success('Password updated successfully! Please login.');
      navigate('/auth/login');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Hook to get current user
 * Returns user data from auth check query
 */
export const useCurrentUser = () => {
  const { data, isLoading, error } = useAuthCheck();
  
  return {
    user: data?.user || null,
    isLoading,
    error,
    isAuthenticated: !!data?.user,
  };
};

/**
 * Hook to access stored user data from localStorage
 * This provides immediate access to user data including registers
 * without needing to wait for API calls
 */
export const useStoredUser = () => {
  const [storedUser, setStoredUserState] = React.useState(() => {
    try {
      const stored = localStorage.getItem('bo_journal_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Update when localStorage changes (e.g., from another tab)
  React.useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('bo_journal_user');
        setStoredUserState(stored ? JSON.parse(stored) : null);
      } catch {
        setStoredUserState(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    user: storedUser,
    registers: storedUser?.register_types || [],
    getRegisterName: (registerId: number) => {
      const register = storedUser?.register_types?.find((r: { id: number; register_name: string }) => r.id === registerId);
      return register?.register_name || null;
    },
    hasStoredData: !!storedUser,
  };
};
