// FILE: src/features/profile/api.ts
// PURPOSE: API functions for user profile operations
// API: /api/v2/auth/user/

import apiClient from '../../lib/apiClient';
import type {
  UserProfile,
  UpdateProfileInput,
  UpdateProfileResponse,
  ProfilePictureUploadResponse,
  ProfilePictureUrlResponse,
  AuthCheckResponse,
} from './schemas';

/**
 * Get current user profile
 */
const getProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<AuthCheckResponse>('/auth/authcheck');
  return response.data.user;
};

/**
 * Update user profile (first_name, last_name, profile_picture_key only)
 */
const updateProfile = async (data: UpdateProfileInput): Promise<UpdateProfileResponse> => {
  const response = await apiClient.patch<UpdateProfileResponse>('/auth/user/update', data);
  return response.data;
};

/**
 * Get presigned URL for profile picture upload
 * @param fileName - Name of the file to upload
 */
const getProfilePictureUploadUrl = async (fileName: string): Promise<ProfilePictureUploadResponse> => {
  const response = await apiClient.get<ProfilePictureUploadResponse>(
    `/auth/user/profile-picture-upload-url?file_name=${encodeURIComponent(fileName)}&key=profile_picture`
  );
  return response.data;
};

/**
 * Upload profile picture to S3
 * @param uploadUrl - Presigned URL from getProfilePictureUploadUrl
 * @param file - File to upload
 */
const uploadProfilePictureToS3 = async (uploadUrl: string, file: File): Promise<void> => {
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });
};

/**
 * Get presigned URL for viewing profile picture
 */
const getProfilePictureUrl = async (): Promise<ProfilePictureUrlResponse> => {
  const response = await apiClient.get<ProfilePictureUrlResponse>('/auth/user/profile-picture-url');
  return response.data;
};

/**
 * Complete profile picture upload flow
 * 1. Get presigned upload URL
 * 2. Upload file to S3
 * 3. Update user profile with S3 key
 * @param file - File to upload
 */
const uploadProfilePicture = async (file: File): Promise<UpdateProfileResponse> => {
  // Step 1: Get presigned upload URL
  const uploadData = await getProfilePictureUploadUrl(file.name);
  
  // Step 2: Upload to S3
  await uploadProfilePictureToS3(uploadData.upload_url, file);
  
  // Step 3: Update profile with S3 key
  return updateProfile({
    profile_picture_key: {
      key: uploadData.file_key,
    },
  });
};

export const profileApi = {
  getProfile,
  updateProfile,
  getProfilePictureUploadUrl,
  uploadProfilePictureToS3,
  getProfilePictureUrl,
  uploadProfilePicture,
};

export default profileApi;

