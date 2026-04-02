// FILE: src/features/profile/hooks.ts
// PURPOSE: React Query hooks for user profile operations
// API: /api/v2/auth/user/

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { profileApi } from './api';
import type { UpdateProfileInput } from './schemas';
import { queryKeys } from '../../lib/queries';
import { getErrorMessage } from '../../lib/apiClient';

/**
 * Hook to get current user profile
 */
export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: () => profileApi.getProfile(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => profileApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || 'Failed to update profile');
    },
  });
};

/**
 * Hook to get profile picture URL
 */
export const useProfilePictureUrl = () => {
  return useQuery({
    queryKey: ['profile', 'picture-url'],
    queryFn: () => profileApi.getProfilePictureUrl(),
    staleTime: 9 * 60 * 1000, // 9 minutes (URL expires in 10)
    retry: false, // Don't retry if user has no profile picture
  });
};

/**
 * Hook to upload profile picture
 */
export const useUploadProfilePicture = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadProfilePicture(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile });
      queryClient.invalidateQueries({ queryKey: ['profile', 'picture-url'] });
      toast.success('Profile picture updated successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || 'Failed to upload profile picture');
    },
  });
};

