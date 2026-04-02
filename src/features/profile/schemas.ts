// FILE: src/features/profile/schemas.ts
// PURPOSE: Zod validation schemas and TypeScript types for user profile
// API: /api/v2/auth/user/

import { z } from 'zod';
import type { SubscriptionPlan } from '../payment/schemas';

/**
 * User Profile Schema (from API response)
 */
export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture_key?: {
    key: string;
  } | null;
  profile_picture_url?: string | null;
  subscription_active: boolean;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
  subscription_plan?: SubscriptionPlan | null;
  created_at: string;
  updated_at: string;
}

export interface AuthCheckResponse {
  status: boolean;
  user: UserProfile;
}

/**
 * Update Profile Input Schema
 * Only first_name, last_name, and profile_picture_key can be updated
 */
export const updateProfileSchema = z.object({
  first_name: z
    .string()
    .min(1, 'First name is required')
    .max(150, 'First name must be 150 characters or less')
    .optional(),
  last_name: z
    .string()
    .min(1, 'Last name is required')
    .max(150, 'Last name must be 150 characters or less')
    .optional(),
  profile_picture_key: z
    .object({
      key: z.string(),
    })
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

/**
 * Profile Picture Upload Response
 */
export interface ProfilePictureUploadResponse {
  status: boolean;
  upload_url: string;
  file_key: string;
  file_url: string;
}

/**
 * Profile Picture URL Response
 */
export interface ProfilePictureUrlResponse {
  status: boolean;
  url: string;
  expires_in: number;
}

/**
 * Update Profile API Response
 */
export interface UpdateProfileResponse {
  status: boolean;
  message: string;
  user: UserProfile;
}

