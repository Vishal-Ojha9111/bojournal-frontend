// FILE: src/features/payment/api.ts
// PURPOSE: API functions for payment and subscription operations
// API: /api/v2/payment/

import apiClient from '../../lib/apiClient';
import type {
  PlansListResponse,
  RazorpayOrderResponse,
  CreateOrderInput,
  VerifyPaymentInput,
  VerifyPaymentResponse,
  PaymentHistoryResponse,
  SubscriptionStatusResponse,
  PaymentHistoryItem,
} from './schemas';

/**
 * Get all subscription plans
 * NOTE: This endpoint does NOT require authentication
 */
const getPlans = async (): Promise<PlansListResponse> => {
  const response = await apiClient.get<PlansListResponse>('/payment/plans');
  return response.data;
};

/**
 * Create Razorpay order for a plan
 */
const createOrder = async (data: CreateOrderInput): Promise<RazorpayOrderResponse> => {
  const response = await apiClient.get<RazorpayOrderResponse>(`/payment/createorder/${data.plan_id}/`);
  return response.data;
};

const getOrderdetails = async (orderId: string): Promise<RazorpayOrderResponse> => {
  const response = await apiClient.get<RazorpayOrderResponse>(`/payment/getorder/${orderId}/`);
  return response.data;
}
/**
 * Verify payment after Razorpay checkout
 */
const verifyPayment = async (data: VerifyPaymentInput): Promise<VerifyPaymentResponse> => {
  const response = await apiClient.post<VerifyPaymentResponse>('/payment/verify/', data);
  return response.data;
};

/**
 * Get payment history for current user
 */
const getPaymentHistory = async (): Promise<PaymentHistoryItem[]> => {
  const response = await apiClient.get<PaymentHistoryResponse>('/payment/history');
  return response.data.history;
};

/**
 * Get current subscription status
 */
const getSubscriptionStatus = async (order_id: string): Promise<SubscriptionStatusResponse> => {
  const response = await apiClient.get<SubscriptionStatusResponse>(`/payment/status/${order_id}/`);
  return response.data;
};

const CancelOrder = async (orderId: string): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>(`/payment/cancel/${orderId}/`);
  return response.data;
}

export const paymentApi = {
  getPlans,
  createOrder,
  getOrderdetails,
  verifyPayment,
  getPaymentHistory,
  getSubscriptionStatus,
  CancelOrder,
};

export default paymentApi;

