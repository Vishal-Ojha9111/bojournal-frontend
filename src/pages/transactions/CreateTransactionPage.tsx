// FILE: src/pages/transactions/CreateTransactionPage.tsx
// PURPOSE: Standalone page for creating a new transaction
// API: POST /transactions/

import { useNavigate } from 'react-router-dom';
import { TransactionForm } from '../../components/transactions/TransactionForm';
import type { Transaction } from '../../features/transactions/schemas';

/**
 * CreateTransactionPage Component
 * 
 * Full-page form for creating a new transaction.
 * 
 * Structure:
 * - Page header with title and back button
 * - TransactionForm component
 * - Success: Redirects to transactions list
 * - Cancel: Navigates back
 * 
 * Routes:
 * - /app/transactions/create
 * 
 * Responsive:
 * - Mobile: Full width with padding
 * - Desktop: Centered card with max-width
 */
export const CreateTransactionPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (transaction: Transaction) => {
    // Redirect to transactions list after successful creation
    navigate('/app/transactions', { 
      state: { newTransactionId: transaction.id } 
    });
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Transaction</h1>
          <p className="text-gray-600 mt-2">
            Add a new debit or credit transaction to your register.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <TransactionForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            showCancel
          />
        </div>

        {/* Help Text */}
        <div className="mt-4 text-sm text-gray-500">
          <p>
            <strong>Tip:</strong> Upload a photo of your receipt for better record-keeping.
            Images are stored securely and can be viewed later.
          </p>
        </div>
      </div>
    </div>
  );
};
