import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Button, Skeleton } from '../../components/ui';
import { useRazorpayCheckout, useVerifyPayment, useCancelOrder, useGetOrderdetails } from '../../features/payment/hooks';
import { useProfile } from '../../features/profile/hooks';
import type { RazorpayOrderResponse } from '../../features/payment/schemas';


const PaymentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get('order_id');

  const navigate = useNavigate();
  const [order, setOrder] = useState<RazorpayOrderResponse | null>(null);
  const [result, setResult] = useState<{ success: boolean; message?: string } | null>(null);

  // UI state enum for full-page layouts
  type UIState = 'loading' | 'details' | 'in_progress' | 'paid' | 'cancelled' | 'failed';
  const [uiState, setUiState] = useState<UIState>('loading');

  const getOrder = useGetOrderdetails();
  const cancelOrder = useCancelOrder();
  const { data: profile } = useProfile();
  const { openCheckout, isLoading: checkoutLoading } = useRazorpayCheckout(order);

  const handleGetOrder = async () => {
    if (!orderIdFromUrl) return;
    setUiState('loading');
    try {
      const orderData = await getOrder.mutateAsync(orderIdFromUrl);
      // Order shape may be wrapped as { order: { ... } } or returned directly
      if (!orderData.order){
        console.log("no order")
        setResult({ success: false, message: orderData.message || 'Invalid order data received from server' });
        setUiState('details');
      }
      setOrder(orderData);
      setResult(null);
      setUiState('details');
    } catch (err) {
      console.error('create order error', err);
      setResult({ success: false, message: 'Failed to create order' });
    }
  };

  // Redirect to plans page if no plan_id is available
  useEffect(() => {
    if (!orderIdFromUrl) {
      // Immediately send user back to plans -- this page requires payment details
      navigate('/plans');
      return;
    }
    if (order === null) {
      // Start by creating order for the plan
      handleGetOrder();
    }
  }, [orderIdFromUrl, navigate]);




  // Full-page layout per UI state
  const FullPageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  );


  // loading state
  if ( uiState === 'loading') {
    return (
      <FullPageWrapper>
        <Card variant="elevated" padding="lg" className="text-center">
          <Skeleton variant="rectangular" height={12} className="mx-auto mb-6 w-24" />
          <h2 className="text-2xl font-semibold mb-2">Preparing payment</h2>
          <p className="text-[var(--muted)] mb-6">Loading plans and payment details...</p>
          <div className="space-y-2">
            <Skeleton variant="rectangular" height={48} />
            <Skeleton variant="rectangular" height={48} />
          </div>
        </Card>
      </FullPageWrapper>
    );
  }

  // Payment details state: choose plan or show summary/create order
  if (uiState === 'details') {
    return (
      <FullPageWrapper>
        <Card variant="elevated" padding="lg">
          <h2 className="text-2xl font-semibold mb-2">Complete Payment</h2>
        
            <div>
              <p className="text-[var(--muted)] mb-4">You are about to pay for plan <strong>{order?.order?.plan?.name}</strong></p>
              {order ? (
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-sm text-[var(--muted)] mb-2">{order?.message}</div>
                    <div className="text-sm mb-1">Amount: {order?.order?.amount} {order?.order?.currency}</div>
                    <div className="text-sm mb-1">Description: {order?.order?.description}</div>
                    <div className="text-sm mb-1">Order ID: {order?.order?.order_id ?? order?.order?.id}</div>
                    <div className="text-sm">Plan: {order?.order?.plan?.name ?? order?.order?.plan?.plan_id}</div>
                  </div>
                  <div>
                  <Button
                    onClick={async () => {
                      if (!profile) {
                        // if user somehow lost session, send to login
                        navigate('/auth/login');
                        return;
                      }
                      setUiState('in_progress');
                      try {
                        await openCheckout({ name: profile.name || '', email: profile.email || '' });
                      } catch (err) {
                        console.error('checkout error', err);
                        setUiState('details');
                        setResult({ success: false, message: 'Payment failed to start' });
                      }
                    }}
                    disabled={checkoutLoading}
                  >
                    Pay Now
                  </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={async () => {
                        try {
                          await cancelOrder.mutateAsync(order.order.order_id);
                          setResult({ success: false, message: 'Order cancelled' });
                          setUiState('cancelled');
                        } catch (err) {
                          console.error('cancel error', err);
                        }
                      }}
                    >
                      Cancel Order
                    </Button>
                </div>
              </div>
              ) : (
                <h1>Invalid Data</h1>
              )}
            </div>
          
        </Card>
      </FullPageWrapper>
    );
  }

  // Payment in progress (after user started payment and we are waiting for verify)
  if ( uiState === 'in_progress') {
    return (
      <FullPageWrapper>
        <Card variant="elevated" padding="lg" className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Checking order</h2>
          <p className="text-[var(--muted)] mb-4">Verifying payment with the server. This may take a few seconds.</p>
          <Skeleton variant="rectangular" height={48} />
        </Card>
      </FullPageWrapper>
    );
  }

  // Paid state
  if (result && result.success && uiState === 'paid') {
    return (
      <FullPageWrapper>
        <Card variant="elevated" padding="lg" className="text-center border-[var(--success)]">
          <h2 className="text-2xl font-semibold mb-2 text-[var(--success)]">Payment Successful</h2>
          <p className="text-[var(--muted)] mb-4">{result.message || 'Thank you! Your subscription is now active.'}</p>
          <CountdownRedirect to="/plans" seconds={10} />
        </Card>
      </FullPageWrapper>
    );
  }

  // Cancelled / failed state
  if (result && !result.success) {
    // Show cancelled or failed state.
    const title = result.message?.toLowerCase().includes('cancel') ? 'Payment Cancelled' : 'Payment Status';
    return (
      <FullPageWrapper>
        <Card variant="elevated" padding="lg" className="text-center">
          <h2 className="text-2xl font-semibold mb-2 text-[var(--error)]">{title}</h2>
          <p className="text-[var(--muted)] mb-4">{result.message || 'Payment was not completed.'}</p>
          <CountdownRedirect to="/plans" seconds={10} />
        </Card>
      </FullPageWrapper>
    );
  }

  // Fallback: render details
  return (
    <FullPageWrapper>
      <Card variant="elevated" padding="lg">
        <h2 className="text-2xl font-semibold mb-2">Complete Payment</h2>
        <p className="text-[var(--muted)]">Preparing payment...</p>
      </Card>
    </FullPageWrapper>
  );
};

export default PaymentPage;

// Small helper component that shows a countdown and redirects when it hits zero.
function CountdownRedirect({ to, seconds = 10 }: { to: string; seconds?: number }) {
  const [count, setCount] = useState<number>(seconds);
  const navigate = useNavigate();

  useEffect(() => {
    const iv = setInterval(() => setCount((c) => c - 1), 1000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (count <= 0) navigate(to);
  }, [count, navigate, to]);

  return (
    <div className="text-sm text-gray-700 mt-2">Redirecting to plans in {count} second{count === 1 ? '' : 's'}...</div>
  );
}
