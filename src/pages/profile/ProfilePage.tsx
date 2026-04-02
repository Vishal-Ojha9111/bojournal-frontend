// FILE: src/pages/profile/ProfilePage.tsx
// PURPOSE: User profile page with avatar upload and account information
// API: GET /api/v2/auth/user/, PATCH /api/v2/auth/user/update

import React, { useState, useRef } from 'react';
import { Card, Button, Input, Skeleton } from '../../components/ui';
import { useUpdateProfile, useUploadProfilePicture, useProfilePictureUrl } from '../../features/profile/hooks';
import { useSubscriptionStatus } from '../../features/payment/hooks';
import { useCurrentUser } from '../../features/auth/hooks';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, type UpdateProfileInput } from '../../features/profile/schemas';

const ProfilePage: React.FC = () => {
  // Use useCurrentUser instead of useProfile - it calls /auth/check which exists
  const { user: profile, isLoading: isLoadingProfile } = useCurrentUser();
  const { data: subscriptionData } = useSubscriptionStatus();
  const updateProfile = useUpdateProfile();
  const uploadProfilePicture = useUploadProfilePicture();
  const { data: profilePictureData, refetch: refetchProfilePicture } = useProfilePictureUrl();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
    },
  });

  // Update form when profile data loads
  React.useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
      });
    }
  }, [profile, reset]);

  const onSubmitName = async (data: UpdateProfileInput) => {
    await updateProfile.mutateAsync(data);
    setIsEditingName(false);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload image
    uploadProfilePicture.mutate(file, {
      onSuccess: () => {
        setPreviewImage(null);
        // Refetch profile picture URL if it failed before
        refetchProfilePicture();
      },
      onError: () => {
        setPreviewImage(null);
      },
    });
  };

  // Get profile picture URL - use from user object or fallback to fetched URL
  const profilePictureUrl = React.useMemo(() => {
    if (previewImage) return previewImage;
    if (profile?.profile_picture_url) return profile.profile_picture_url;
    if (profilePictureData?.url) return profilePictureData.url;
    return null;
  }, [previewImage, profile?.profile_picture_url, profilePictureData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDaysRemaining = () => {
    if (!subscriptionData?.data.days_remaining) return null;
    const days = subscriptionData.data.days_remaining;
    if (days < 0) return 'Expired';
    if (days === 0) return 'Expires today';
    if (days === 1) return '1 day remaining';
    return `${days} days remaining`;
  };

  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <Skeleton variant="rectangular" height={40} />
        <Card variant="elevated">
          <div className="space-y-4">
            <Skeleton variant="circular" width={120} height={120} />
            <Skeleton variant="rectangular" height={60} />
            <Skeleton variant="rectangular" height={60} />
          </div>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--muted)]">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)]">Profile</h1>
        <p className="text-[var(--muted)] mt-1">
          Manage your account information and subscription
        </p>
      </div>

      {/* Profile Picture Card */}
      <Card variant="elevated">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-6">
          Profile Picture
        </h2>
        
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--brand-500)] to-[var(--brand-600)] flex items-center justify-center overflow-hidden">
              {profilePictureUrl ? (
                <img
                  src={profilePictureUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-white">
                  {profile.first_name.charAt(0)}{profile.last_name.charAt(0)}
                </span>
              )}
            </div>
            
            {uploadProfilePicture.isPending && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm text-[var(--muted)] mb-4">
              JPG, PNG or GIF. Max size 5MB.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadProfilePicture.isPending}
            >
              {uploadProfilePicture.isPending ? 'Uploading...' : 'Change Picture'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Information Card */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[var(--text)]">
            Account Information
          </h2>
          {!isEditingName && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingName(true)}
            >
              Edit
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmitName)} className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              First Name
            </label>
            {isEditingName ? (
              <Input
                {...register('first_name')}
                error={errors.first_name?.message}
                disabled={updateProfile.isPending}
              />
            ) : (
              <p className="text-[var(--text)] py-2">{profile.first_name}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Last Name
            </label>
            {isEditingName ? (
              <Input
                {...register('last_name')}
                error={errors.last_name?.message}
                disabled={updateProfile.isPending}
              />
            ) : (
              <p className="text-[var(--text)] py-2">{profile.last_name}</p>
            )}
          </div>

          {/* Email (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-2">
              Email
            </label>
            <p className="text-[var(--muted)] py-2">{profile.email}</p>
            <p className="text-xs text-[var(--muted)] mt-1">
              Email cannot be changed. Contact support if needed.
            </p>
          </div>

          {/* Account Status */}
          {profile.subscription_start_date && (
            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-2">
                Subscription Start Date
              </label>
              <p className="text-[var(--muted)] py-2">
                {formatDate(profile.subscription_start_date)}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {isEditingName && (
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                disabled={!isDirty || updateProfile.isPending}
              >
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  reset();
                  setIsEditingName(false);
                }}
                disabled={updateProfile.isPending}
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      </Card>

      {/* Subscription Card */}
      <Card variant="elevated">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-6">
          Subscription
        </h2>

        {subscriptionData?.data.has_active_subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div>
                <p className="font-medium text-[var(--success)]">Active Subscription</p>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Expires on {subscriptionData.data.subscription_expires_at 
                    ? formatDate(subscriptionData.data.subscription_expires_at)
                    : 'N/A'
                  }
                </p>
                <p className="text-sm font-medium text-[var(--text)] mt-1">
                  {getDaysRemaining()}
                </p>
              </div>
              <div className="text-green-600 dark:text-green-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <Link to="/app/subscription">
              <Button variant="secondary" className="w-full">
                Manage Subscription
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="font-medium text-orange-700 dark:text-orange-400">
                No Active Subscription
              </p>
              <p className="text-sm text-[var(--muted)] mt-1">
                Subscribe to unlock all features
              </p>
            </div>

            <Link to="/plans">
              <Button variant="primary" className="w-full">
                View Plans
              </Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;

