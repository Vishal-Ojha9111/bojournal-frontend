// FILE: src/App.tsx
// PURPOSE: Main application component with routing and providers
// API: N/A (routing and providers)

import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queries';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import SignupPage from './pages/auth/SignupPage';
import LoginPage from './pages/auth/LoginPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard Pages
import DashboardPage from './pages/dashboard/DashboardPage';

// Transaction Pages
import { TransactionsPage } from './pages/transactions/TransactionsPage';
import { CreateTransactionPage } from './pages/transactions/CreateTransactionPage';

// Register Pages
import { RegistersPage } from './pages/registers/RegistersPage';

// Journal Pages
import { JournalPage } from './pages/journal/JournalPage';

// Holidays Pages
import { HolidaysPage } from './pages/holidays/HolidaysPage';

// Profile Pages
import ProfilePage from './pages/profile/ProfilePage';

// Subscription Pages
import SubscriptionPage from './pages/subscription/SubscriptionPage';

// Import styles
import './index.css';
import './styles/vars.css';
import PlansPage from './pages/plans/PlansPage';
import PaymentPage from './pages/payment/Payment';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/signup/:referral_code" element={<SignupPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/reset" element={<ResetPasswordPage />} />
          <Route path="/plans" element={<PlansPage />} />

          {/* Protected Routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            
            {/* Transaction Routes */}
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="transactions/create" element={<CreateTransactionPage />} />
            
            {/* Register Routes */}
            <Route path="registers" element={<RegistersPage />} />
            
            {/* Journal Routes */}
            <Route path="journal" element={<JournalPage />} />
            
            {/* Holidays Routes */}
            <Route path="holidays" element={<HolidaysPage />} />
            
            {/* Profile Routes */}
            <Route path="profile" element={<ProfilePage />} />
            
            {/* Subscription Routes */}
            <Route path="subscription" element={<SubscriptionPage />} />

            {/* Payment Routes */}
            <Route path="payment" element={<PaymentPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </QueryClientProvider>
  );
}

export default App;
