// FILE: src/features/payment/schemas.ts
// PURPOSE: Zod validation schemas and TypeScript types for payment and subscription plans
// API: /api/v2/payment/

import { z } from 'zod';

/**
 * Subscription Plan Schema
 */
export interface SubscriptionPlan {
  id: number;
  plan_id: string;
  name: string;
  price: number;
  duration_days: number;
  duration_months: number;
  duration_years: number;
  savings: number;
  active: boolean;
  limited: boolean;
  description: string;
}

/**
 * Plans List Response (from API)
 * API returns: { message, plans }
 */
export interface PlansListResponse {
  message: string;
  plans: SubscriptionPlan[];
}

/**
 * Razorpay Order Response
 */
export interface RazorpayOrderResponse {
  message: string;
  order: {
    id: number;
    order_id: string;
    amount: number;
    discount: number;
    currency: string;
    plan: SubscriptionPlan;
    name: string;
    key: string;
    description: string;
  };
}

/**
 * Create Order Input
 */
export const createOrderSchema = z.object({
  plan_id: z.number().min(1, 'Plan ID is required'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

/**
 * Verify Payment Input
 */
export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1, 'Order ID is required'),
  razorpay_payment_id: z.string().min(1, 'Payment ID is required'),
  razorpay_signature: z.string().min(1, 'Signature is required'),
});

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

/**
 * Verify Payment Response
 */
export interface VerifyPaymentResponse {
  status: string;
  message: string;
  data: {
    payment_id: string;
    order_id: string;
    subscription_expires_at: string;
  };
}

/**
 * Payment History Item
 */
export interface PaymentHistoryItem {
  
  id: number,
  order_id: string,
  amount: number,
  status: 'created' | 'paid',
  expired: boolean,
  plan: SubscriptionPlan,
  currency: string,
  payment_id: string | null,
  created_at: string
}

/**
 * Payment History Response
 */
export interface PaymentHistoryResponse {
  message: string;
  history: PaymentHistoryItem[];
}

/**
 * Subscription Status Response
 */
export interface SubscriptionStatusResponse {
  status: string;
  data: {
    has_active_subscription: boolean;
    subscription_expires_at: string | null;
    days_remaining: number | null;
  };
}



