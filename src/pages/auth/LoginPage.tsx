// FILE: src/pages/auth/LoginPage.tsx
// PURPOSE: Login page with email/password form
// API: POST /api/v2/auth/login, GET /api/v2/auth/check

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { loginSchema, type LoginInput } from '../../features/auth/schemas';
import { useLogin } from '../../features/auth/hooks';
import { Button, Input } from '../../components/ui';
import PublicHeader from '../../components/layout/PublicHeader';

/**
 * PageStructure:
 * - PublicHeader (same as homepage)
 * - AuthShell (centered container)
 * - LoginForm with email, password fields
 * - Links to Forgot Password and Signup
 * 
 * APIs: POST /api/v2/auth/login, GET /api/v2/auth/check
 * 
 * Responsive: Compact centered card, full width on small screens
 */

const LoginPage: React.FC = () => {
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await loginMutation.mutateAsync(data);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Public Header */}
      <PublicHeader />
      
      {/* Login Content */}
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-[var(--brand-50)] to-[var(--surface)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[var(--bg)] rounded-xl shadow-[var(--shadow-card)] p-8">
          {/* Brand Block */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
              Welcome Back
            </h1>
            <p className="text-[var(--muted)]">Login to your account</p>
            {/* TODO-DESIGN: Add logo image here */}
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              fullWidth
            />

            <div className="text-right">
              <Link
                to="/auth/reset"
                className="text-sm text-[var(--brand-500)] hover:text-[var(--brand-600)]"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={isSubmitting || loginMutation.isPending}
            >
              Login
            </Button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--muted)]">
              Don't have an account?{' '}
              <Link
                to="/auth/signup"
                className="text-[var(--brand-500)] hover:text-[var(--brand-600)] font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LoginPage;
