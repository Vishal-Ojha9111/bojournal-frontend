// FILE: src/pages/auth/SignupPage.tsx
// PURPOSE: Signup page with form and OTP popup
// API: POST /api/v2/auth/signup, POST /api/v2/auth/verify

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useParams } from 'react-router-dom';
import { signupSchema, type SignupInput } from '../../features/auth/schemas';
import { useSignup, useVerifyOtp, useResendOtp } from '../../features/auth/hooks';
import { Button, Input, Modal } from '../../components/ui';
import PublicHeader from '../../components/layout/PublicHeader';

/**
 * PageStructure:
 * - PublicHeader (same as homepage)
 * - AuthShell (centered container max-w-2xl)
 * - Brand block with logo
 * - SignupForm with fields: first_name, last_name, email, password, referral_code
 * - OTP Popup (overlay modal) with 6-digit input
 * 
 * APIs: POST /api/v2/auth/signup, POST /api/v2/auth/verify
 * 
 * Responsive: Card centered; 90% width on mobile, max-w-2xl on desktop
 * OTP popup: centered overlay on desktop, full-screen on mobile
 */

const SignupPage: React.FC = () => {
  const { referral_code } = useParams<{ referral_code?: string }>();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [otp, setOtp] = useState('');

  const signupMutation = useSignup();
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      referral_code: referral_code || '',
    },
  });

  const onSubmit = async (data: SignupInput) => {
    try {
      await signupMutation.mutateAsync(data);
      setUserEmail(data.email);
      setShowOtpModal(true);
    } catch {
      // Error handled by mutation
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      return;
    }

    try {
      await verifyOtpMutation.mutateAsync({
        email: userEmail,
        otp,
      });
      setShowOtpModal(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleResendOtp = () => {
    resendOtpMutation.mutate(userEmail);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Public Header */}
      <PublicHeader />
      
      {/* Signup Content */}
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[var(--brand-50)] to-[var(--surface)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Card */}
        <div className="bg-[var(--bg)] rounded-xl shadow-[var(--shadow-card)] p-8 md:p-10">
          {/* Brand Block */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-2">
              BO Journal
            </h1>
            <p className="text-[var(--muted)]">Create your account</p>
            {/* TODO-DESIGN: Add logo image here */}
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="First Name"
                {...register('first_name')}
                error={errors.first_name?.message}
                required
                placeholder="John"
                fullWidth
              />

              <Input
                label="Last Name"
                {...register('last_name')}
                error={errors.last_name?.message}
                required
                placeholder="Doe"
                fullWidth
              />
            </div>

            <Input
              label="Email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              required
              placeholder="john.doe@example.com"
              fullWidth
            />

            <Input
              label="Password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
              required
              placeholder="••••••••"
              helperText="At least 8 characters with uppercase, lowercase, and number"
              fullWidth
            />

            {referral_code && (
              <Input
                label="Referral Code"
                {...register('referral_code')}
                error={errors.referral_code?.message}
                disabled
                fullWidth
              />
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting || signupMutation.isPending}
            >
              Sign Up
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--muted)]">
              Already have an account?{' '}
              <Link
                to="/auth/login"
                className="text-[var(--brand-500)] hover:text-[var(--brand-600)] font-medium"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Verify Your Email"
        size="sm"
      >
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div>
            <p className="text-sm text-[var(--muted)] mb-4">
              We've sent a 6-digit code to <strong>{userEmail}</strong>
            </p>

            <Input
              label="Enter OTP"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              required
              fullWidth
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={verifyOtpMutation.isPending}
              disabled={otp.length !== 6}
            >
              Verify
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendOtpMutation.isPending}
              className="text-sm text-[var(--brand-500)] hover:text-[var(--brand-600)]"
            >
              {resendOtpMutation.isPending ? 'Sending...' : 'Resend OTP'}
            </button>
          </div>
        </form>
      </Modal>
      </div>
    </div>
  );
};

export default SignupPage;
