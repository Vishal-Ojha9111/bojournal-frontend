// FILE: src/pages/plans/PlansPage.tsx
// PURPOSE: Subscription plans page with Razorpay payment integration
// API: GET /api/v2/payment/plans, POST /api/v2/payment/create-order, POST /api/v2/payment/verify

import React, {useState} from 'react';
import { Card, Button, Skeleton } from '../../components/ui';
import { usePlans, useCreateOrder } from '../../features/payment/hooks';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../../features/profile/hooks';
import type { SubscriptionPlan } from '../../features/payment/schemas';
import PublicHeader from '../../components/layout/PublicHeader';
import { formatPrice } from '../../lib/currency';

const PlansPage: React.FC = () => {
  const { data: plansData, isLoading: isLoadingPlans } = usePlans();
  const { data: profile } = useProfile();
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const navigate = useNavigate();
  const createOrder = useCreateOrder();

  const plans = plansData?.plans || [];


  const handlePlanSelect = async (plan: SubscriptionPlan) => {
    if (!profile) {
      alert('Please login to continue');
      return;
    }
    setIsProcessingPayment(true);
    const order = await createOrder.mutateAsync({ plan_id: plan.id });
  navigate(`/app/payment/?order_id=${order.order.order_id}`);
  };

  const getPlanFeatures = (plan: SubscriptionPlan) => {
    const baseFeatures = [
      'Unlimited transactions',
      'Multiple registers',
      'Daily journal entries',
      'Receipt file upload',
      'Transaction filters & search',
      'Export to CSV',
    ];

    if (plan.duration_months > 1 || plan.duration_years >= 1) {
      return [...baseFeatures, `✨ Save ${formatPrice(plan.savings, 'INR')} vs monthly`];
    }

    return baseFeatures;
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
          {/* Public Header */}
          <PublicHeader />
    <div className="max-w-6xl m-8 space-y-8">
      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[var(--text)]">Choose Your Plan</h1>
        <p className="text-[var(--muted)] mt-2 text-lg">
          Select the perfect plan for your business needs
        </p>
      </div>      

      {/* Plans Grid */}
      {isLoadingPlans ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} variant="rectangular" height={400} />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.plan_id}
              variant="elevated"
              className={`relative ${
                plan.duration_years >= 1
                  ? 'border-2 border-[var(--brand-500)] shadow-xl'
                  : ''
              }`}
            >
              {plan.duration_years >= 1 && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-[var(--brand-500)] to-[var(--brand-600)] text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                    Best Value
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-[var(--text)] mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-4xl font-bold text-[var(--brand-500)]">
                    {formatPrice(plan.price, 'INR')}
                  </span>
                  <span className="text-[var(--muted)]">
                    / {plan.duration_months >= 1 ? `${plan.duration_months} month${plan.duration_months > 1 ? 's' : ''}` : 'year'}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted)] mt-2">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {getPlanFeatures(plan).map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-[var(--text)]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.duration_years >= 1 ? 'primary' : 'secondary'}
                className="w-full"
                onClick={() => handlePlanSelect(plan)}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? 'Processing...' : 'Subscribe Now'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* FAQ or Info Section */}
      <Card variant="elevated" className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">
          Secure Payment with Razorpay
        </h3>
        <div className="space-y-2 text-sm text-[var(--muted)]">
          <p>✓ Your payment information is secure and encrypted</p>
          <p>✓ Supports Credit/Debit Cards, UPI, Net Banking, and Wallets</p>
          <p>✓ Instant activation after successful payment</p>
          <p>✓ Cancel anytime, no questions asked</p>
        </div>
      </Card>
    </div>
    </div>
  );
};

export default PlansPage;

