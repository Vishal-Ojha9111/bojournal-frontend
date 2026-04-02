// FILE: src/features/auth/api.ts
// PURPOSE: API functions for authentication endpoints
// API: POST /api/v2/auth/signup, POST /api/v2/auth/verify, POST /api/v2/auth/login, etc.

import apiClient from '../../lib/apiClient';
import type {
  SignupInput,
  OtpInput,
  LoginInput,
  ResetPasswordRequestInput,
  UpdatePasswordInput,
  User,
} from './schemas';

/**
 * Sign up a new user
 * Sends OTP to email
 */
export const signup = async (data: SignupInput) => {
  const response = await apiClient.post('/auth/signup', data);
  return response.data;
};

/**
 * Verify OTP
 * For signup or password reset
 */
export const verifyOtp = async (data: OtpInput) => {
  const response = await apiClient.post('/auth/verify', data);
  return response.data;
};

/**
 * Resend OTP
 * Same endpoint as signup, server detects existing pending signup
 */
export const resendOtp = async (email: string) => {
  const response = await apiClient.post('/auth/signup', { email });
  return response.data;
};

/**
 * Login user
 */
export const login = async (data: LoginInput) => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
};

/**
 * Logout user
 */
export const logout = async () => {
  const response = await apiClient.get('/auth/logout');
  return response.data;
};

/**
 * Check authentication status
 * Returns user info if authenticated
 */
export const checkAuth = async (): Promise<{ status: boolean; user: User }> => {
  const response = await apiClient.get('/auth/authcheck');
  return response.data;
};

/**
 * Refresh access token
 * Called automatically by axios interceptor
 */
export const refreshToken = async () => {
  const response = await apiClient.post('/auth/refresh');
  return response.data;
};

/**
 * Request password reset
 * Sends OTP to email
 */
export const requestPasswordReset = async (data: ResetPasswordRequestInput) => {
  const response = await apiClient.post('/auth/resetpassword', data);
  return response.data;
};

/**
 * Update password after OTP verification
 */
export const updatePassword = async (data: UpdatePasswordInput) => {
  const response = await apiClient.post('/auth/updatepassword', data);
  return response.data;
};

export const authApi = {
  signup,
  verifyOtp,
  resendOtp,
  login,
  logout,
  checkAuth,
  refreshToken,
  requestPasswordReset,
  updatePassword,
};

export default authApi;
