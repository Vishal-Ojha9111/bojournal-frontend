// FILE: src/pages/subscription/SubscriptionPage.tsx
// PURPOSE: Subscription management page - shows current subscription and available plans
// API: GET /api/v2/payment/status, GET /api/v2/payment/plans

import React from 'react';
import { Card, Button, Skeleton } from '../../components/ui';
import { useProfile } from '../../features/profile/hooks';
import { formatPrice } from '../../lib/currency';
import { usePaymentHistory } from '../../features/payment/hooks';
import { Link } from 'react-router';

const SubscriptionPage: React.FC = () => {
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const { data: paymentHistoryData } = usePaymentHistory();

  const paymentHistory = paymentHistoryData || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const toLocalTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8 2xl:mx-48 lg:mx-24 md:mx-12 sm:mx-4 my-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--text)]">Subscription</h1>
        <p className="text-[var(--muted)] mt-1">
          Manage your subscription and view available plans
        </p>
      </div>

      {/* Current Subscription Card */}
      <Card variant="elevated">
        <h2 className="text-xl font-semibold text-[var(--text)] mb-4">
          Current Subscription
        </h2>

        {isLoadingProfile ? (
          <Skeleton variant="rectangular" height={120} />
        ) : profile?.subscription_active ? (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="flex items-start gap-4">
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
                  ✅ Active Subscription
                </h3>
                <div className="space-y-2 text-sm text-[var(--text)]">
                  {profile?.subscription_start_date && (
                    <p>
                      <span className="font-medium">Started on:</span>{' '}
                      <span className='text-lg font-bold'>{formatDate(profile.subscription_start_date)}</span>
                    </p>
                  )}
                  {profile?.subscription_end_date && (
                    <p>
                      <span className="font-medium">Expires on:</span>{' '}
                      <span className="text-lg font-bold">{formatDate(profile.subscription_end_date)}</span>
                    </p>
                  )}
                  {profile?.subscription_plan && (
                    <div>

                    <p>
                      <span className="font-medium">Plan name:</span>{' '}
                      <span className="text-lg font-bold">{profile.subscription_plan?.name}</span>
                    </p>
                    <p>
                      <span className="font-medium">Plan ID:</span>{' '}
                      <span className="text-lg font-bold">{profile.subscription_plan?.plan_id}</span>
                    </p>
                    <p>
                      <span className="font-medium">Plan duration:</span>{' '}
                      <span className="text-lg font-bold">{`${profile.subscription_plan?.duration_days} days ${profile.subscription_plan?.duration_months} months ${profile.subscription_plan?.duration_years} years`}</span>
                    </p>
                    <p>
                      <span className="font-medium">Price:</span>{' '}
                      <span className="text-lg font-bold">{formatPrice(profile.subscription_plan?.price, 'INR')}</span>
                    </p>
                    <p>
                      <span className="font-medium">Saved:</span>{' '}
                      <span className="text-lg font-bold">{formatPrice(profile.subscription_plan?.savings, 'INR')}</span>
                    </p>
                  </div>
                  )}
                </div>
                <p className="mt-3 text-lg font-bold text-[var(--text)]">
                  Thank you for your support! 🎉
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-300 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-900 mb-2">
                  ⚠️ No Active Subscription
                </h3>
                <p className="text-sm text-orange-800 dark:text-white">
                  Subscribe to a plan below to unlock all features and start tracking your finances.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* History Section */}
      <Card variant="elevated" className="bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-2">
          Subscription History
        </h3>
        <div className="space-y-2">
          {paymentHistory.map((item) => (
            <Card key={item.id} className="flex justify-between max-[510px]:flex-col max-[510px]:gap-2 items-center p-4 border border-[var(--border)]">
              <span>{item.plan.name}</span>
              <span className="font-semibold">{formatPrice(item.amount, 'INR')}</span>
              <span className="text-sm text-[var(--muted)]">{toLocalTime(item.created_at)}</span>
              <span className={`text-md font-bold ${item.status === 'created' ? 'text-yellow-500' : item.status === 'paid' ? 'text-green-500' : 'text-red-500'}`}>
                {item.expired ? 'Expired' : item.status === 'paid' ? 'Paid' : item.status === 'created' ? 'Created' : 'Failed'}
              </span>
              <button className="text-sm text-[var(--text)] font-bold bg-orange-500 px-4 py-2 rounded-lg disabled:opacity-50" disabled={item.expired || item.status === 'paid'}>Retry</button>
            </Card>
          ))}
        </div>
      </Card>
      {/* Explore Plans Button */}
      <Link to="/plans" className='text-center flex justify-center'>
        <Button variant="primary" className="mx-auto block h-16 px-8 rounded-full text-lg font-semibold">
          Explore plans
        </Button>
      </Link>
    </div>
  );
};

export default SubscriptionPage;
