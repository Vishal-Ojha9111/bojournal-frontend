// FILE: src/features/auth/schemas.ts
// PURPOSE: Zod schemas for auth-related data validation
// API: N/A (validation schemas)

import { z } from 'zod';

/**
 * Signup schema
 */
export const signupSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(150, 'First name must be less than 150 characters')
    .regex(/^[^\s]+$/, 'First name must be a single word'),
  last_name: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(150, 'Last name must be less than 150 characters')
    .regex(/^[^\s]+$/, 'Last name must be a single word'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  referral_code: z.string().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;

/**
 * OTP verification schema
 */
export const otpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only numbers'),
  action: z.enum(['signup', 'password_reset']).optional(),
});

export type OtpInput = z.infer<typeof otpSchema>;

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Reset password request schema
 */
export const resetPasswordRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address'),
});

export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;

/**
 * Update password schema
 */
export const updatePasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

/**
 * User response schema
 */
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  name: z.string().optional(),
  profile_picture: z.string().nullable().optional(),
  profile_picture_url: z.string().nullable().optional(),
  first_opening_balance: z.number().optional(),
  first_opening_balance_date: z.string().nullable().optional(),
  is_subscribed: z.boolean().optional(),
  subscription_start: z.string().nullable().optional(),
  subscription_end: z.string().nullable().optional(),
  register_types: z.array(z.object({
    id: z.number(),
    register_name: z.string(),
    debit: z.string(),
    credit: z.string(),
  })).optional(),
  referral_code: z.string().optional(),
  subscription_active: z.boolean().optional(),
  subscription_start_date: z.string().nullable().optional(),
  subscription_end_date: z.string().nullable().optional(),
  otp_verification: z.boolean().optional(),
});

export type User = z.infer<typeof userSchema>;

/**
 * Auth check response schema
 */
export const authCheckResponseSchema = z.object({
  status: z.literal('success'),
  data: z.object({
    user: userSchema,
  }),
});

export type AuthCheckResponse = z.infer<typeof authCheckResponseSchema>;
