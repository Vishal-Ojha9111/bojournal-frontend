// FILE: src/pages/auth/ResetPasswordPage.tsx
// PURPOSE: Password reset page with OTP flow
// API: POST /api/v2/auth/resetpassword, POST /api/v2/auth/verify, POST /api/v2/auth/updatepassword

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import {
  resetPasswordRequestSchema,
  updatePasswordSchema,
  type ResetPasswordRequestInput,
} from '../../features/auth/schemas';
import {
  useRequestPasswordReset,
  useVerifyOtp,
  useUpdatePassword,
  useResendOtp,
} from '../../features/auth/hooks';
import { Button, Input, Modal } from '../../components/ui';
import PublicHeader from '../../components/layout/PublicHeader';

/**
 * PageStructure:
 * - PublicHeader (same as homepage)
 * - AuthShell
 * - ResetForm with email input
 * - OTP Popup (appears on success)
 * - NewPassword Popup (appears after OTP verification)
 * 
 * APIs: POST /api/v2/auth/resetpassword, POST /api/v2/auth/verify, POST /api/v2/auth/updatepassword
 * 
 * Responsive: Popups overlay behave like Signup OTP popup
 */

type Step = 'email' | 'otp' | 'newPassword';

const ResetPasswordPage: React.FC = () => {
  const [step, setStep] = useState<Step>('email');
  const [userEmail, setUserEmail] = useState('');
  const [otp, setOtp] = useState('');

  const requestResetMutation = useRequestPasswordReset();
  const verifyOtpMutation = useVerifyOtp();
  const updatePasswordMutation = useUpdatePassword();
  const resendOtpMutation = useResendOtp();

  const emailForm = useForm<ResetPasswordRequestInput>({
    resolver: zodResolver(resetPasswordRequestSchema),
  });

  const passwordForm = useForm<{ new_password: string }>({
    resolver: zodResolver(
      updatePasswordSchema.pick({ new_password: true })
    ),
  });

  const handleEmailSubmit = async (data: ResetPasswordRequestInput) => {
    try {
      await requestResetMutation.mutateAsync(data);
      setUserEmail(data.email);
      setStep('otp');
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
        action: 'password_reset',
      });
      setStep('newPassword');
    } catch {
      // Error handled by mutation
    }
  };

  const handlePasswordSubmit = async (data: { new_password: string }) => {
    try {
      await updatePasswordMutation.mutateAsync({
        email: userEmail,
        otp,
        new_password: data.new_password,
      });
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
      
      {/* Reset Password Content */}
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[var(--brand-50)] to-[var(--surface)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[var(--bg)] rounded-xl shadow-[var(--shadow-card)] p-8">
          {/* Brand Block */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
              Reset Password
            </h1>
            <p className="text-[var(--muted)]">
              {step === 'email' && 'Enter your email to receive OTP'}
              {step === 'otp' && 'Verify OTP sent to your email'}
              {step === 'newPassword' && 'Create a new password'}
            </p>
            {/* TODO-DESIGN: Add logo image here */}
          </div>

          {/* Email Form */}
          {step === 'email' && (
            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-5">
              <Input
                label="Email"
                type="email"
                {...emailForm.register('email')}
                error={emailForm.formState.errors.email?.message}
                required
                placeholder="john.doe@example.com"
                fullWidth
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={requestResetMutation.isPending}
              >
                Send OTP
              </Button>
            </form>
          )}

          {/* Login Link */}
          <div className="mt-6 text-center">
            <Link
              to="/auth/login"
              className="text-sm text-[var(--brand-500)] hover:text-[var(--brand-600)]"
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <Modal
        isOpen={step === 'otp'}
        onClose={() => setStep('email')}
        title="Verify OTP"
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

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={verifyOtpMutation.isPending}
            disabled={otp.length !== 6}
          >
            Verify
          </Button>

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

      {/* New Password Modal */}
      <Modal
        isOpen={step === 'newPassword'}
        onClose={() => setStep('email')}
        title="Create New Password"
        size="sm"
      >
        <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-6">
          <Input
            label="New Password"
            type="password"
            {...passwordForm.register('new_password')}
            error={passwordForm.formState.errors.new_password?.message}
            required
            placeholder="••••••••"
            helperText="At least 8 characters with uppercase, lowercase, and number"
            fullWidth
            autoFocus
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={updatePasswordMutation.isPending}
          >
            Update Password
          </Button>
        </form>
      </Modal>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
