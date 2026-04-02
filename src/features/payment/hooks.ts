// FILE: src/features/payment/hooks.ts
// PURPOSE: React Query hooks for payment and subscription operations
// API: /api/v2/payment/

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { paymentApi } from './api';
import type { CreateOrderInput, RazorpayOrderResponse, VerifyPaymentInput } from './schemas';
import { getErrorMessage } from '../../lib/apiClient';

/**
 * Razorpay types
 */
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

/**
 * Query keys for payment-related queries
 */
export const paymentQueryKeys = {
  plans: ['payment', 'plans'] as const,
  history: ['payment', 'history'] as const,
  status: ['payment', 'status'] as const,
};

/**
 * Hook to get all subscription plans
 * NOTE: Does not require authentication
 */
export const usePlans = () => {
  return useQuery({
    queryKey: paymentQueryKeys.plans,
    queryFn: () => paymentApi.getPlans(),
    staleTime: 10 * 60 * 1000, // 10 minutes (plans rarely change)
  });
};

/**
 * Hook to create Razorpay order
 */
export const useCreateOrder = () => {
  return useMutation({
    mutationFn: (data: CreateOrderInput) => paymentApi.createOrder(data),
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || 'Failed to create order');
    },
  });
};

export const useGetOrderdetails = () => {
  return useMutation({
    mutationFn: (orderId: string) => paymentApi.getOrderdetails(orderId),
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || 'Failed to fetch order details');
    },
  });
}

/**
 * Hook to verify payment
 */
export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VerifyPaymentInput) => paymentApi.verifyPayment(data),
    onSuccess: (data) => {
      // Invalidate subscription status and payment history
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.status });
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.history });
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
      toast.success(data.message || 'Payment verified successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || 'Payment verification failed');
    },
  });
};

/**
 * Hook to get payment history
 */
export const usePaymentHistory = () => {
  return useQuery({
    queryKey: paymentQueryKeys.history,
    queryFn: () => paymentApi.getPaymentHistory(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to get subscription status
 */
export const useSubscriptionStatus = (order_id: string) => {
  return useQuery({
    queryKey: paymentQueryKeys.status,
    queryFn: () => paymentApi.getSubscriptionStatus(order_id),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Hook to initialize Razorpay checkout
 * Returns a function that opens the Razorpay payment modal
 */
export const useRazorpayCheckout = (orderData: RazorpayOrderResponse | null ) => {
  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();

  const openCheckout = async (
    userDetails: {
      name: string;
      email: string;
    }
  ) => {
    try {
      // Step 1: Create order (order already created)

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData?.order.key,
        amount: orderData?.order.amount,
        currency: orderData?.order.currency,
        name: 'BO Journal',
        description: 'Subscription Payment',
        order_id: orderData?.order.order_id,
        prefill: {
          name: userDetails.name,
          email: userDetails.email,
        },
        theme: {
          color: '#3b82f6', // var(--brand-500)
        },
        handler: async (response: RazorpayResponse) => {
          // Step 3: Verify payment
          await verifyPayment.mutateAsync({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
          },
        },
      };

      // Check if Razorpay is loaded
      if (typeof window.Razorpay === 'undefined') {
        toast.error('Payment gateway not loaded. Please refresh the page.');
        return;
      }
      console.log(options)
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Checkout error:', error);
    }
  };

  return {
    openCheckout,
    isLoading: createOrder.isPending || verifyPayment.isPending,
  };
};

export const useCancelOrder = () => {
  return useMutation({
    mutationFn: (orderId: string) => paymentApi.CancelOrder(orderId),
    onSuccess: (data) => {
      toast.success(data.message || 'Order cancelled successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || 'Failed to cancel order');
    },
  });
}

