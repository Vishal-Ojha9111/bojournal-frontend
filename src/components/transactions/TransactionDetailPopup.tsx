// FILE: src/components/transactions/TransactionDetailPopup.tsx
// PURPOSE: Modal for viewing, editing, and deleting transaction details
// API: GET /transactions/:id/, PUT /transactions/:id/, DELETE /transactions/:id/

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { TransactionForm } from './TransactionForm';
import { useTransaction, useDeleteTransaction } from '../../features/transactions/hooks';
import { Skeleton } from '../ui/Skeleton';

interface TransactionDetailPopupProps {
  transactionId: number;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * TransactionDetailPopup Component
 * 
 * Full-screen modal (mobile) / centered modal (desktop) for transaction details.
 * 
 * Features:
 * - View mode: Shows all transaction details with image
 * - Edit mode: Shows TransactionForm prefilled
 * - Delete action: Confirmation dialog
 * - Image viewer: Click to view full size
 * 
 * Structure:
 * - Header with title and close button
 * - View mode: Transaction details display
 * - Edit mode: TransactionForm component
 * - Footer with Edit/Delete actions
 * 
 * Responsive:
 * - Mobile: Full screen modal
 * - Desktop: Centered modal with max-width
 */
export const TransactionDetailPopup: React.FC<TransactionDetailPopupProps> = ({
  transactionId,
  isOpen,
  onClose,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { data, isLoading } = useTransaction(transactionId);
  const transaction = data?.data; // Extract transaction from API response
  const deleteMutation = useDeleteTransaction();

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleUpdateSuccess = () => {
    setIsEditMode(false);
    // The cache is automatically updated by the mutation
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(transactionId);
      onClose();
    } catch {
      // Error is handled by the mutation hook
    }
  };

  const handleConfirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Transaction Details">
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {!isLoading && !transaction && (
        <div className="text-center py-8">
          <p className="text-gray-600">Transaction not found</p>
        </div>
      )}

      {!isLoading && transaction && (
        <>
          {/* Edit Mode */}
          {isEditMode ? (
            <TransactionForm
              transaction={transaction}
              onSuccess={handleUpdateSuccess}
              onCancel={handleCancelEdit}
              showCancel
            />
          ) : (
            <>
              {/* View Mode */}
              <div className="space-y-4">
                {/* Transaction Type Badge */}
                <div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      transaction.transaction_type === 'debit'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {transaction.transaction_type.toUpperCase()}
                  </span>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Amount</label>
                  <div className="text-3xl font-bold text-gray-900">
                    ${Number(transaction.amount).toFixed(2)}
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date</label>
                  <div className="text-lg text-gray-900">{transaction.date}</div>
                </div>

                {/* Register */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Register</label>
                  <div className="text-lg text-gray-900">Register #{transaction.register}</div>
                </div>

                {/* Description */}
                {transaction.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      Description
                    </label>
                    <div className="text-gray-900 whitespace-pre-wrap">
                      {transaction.description}
                    </div>
                  </div>
                )}

                {/* Image */}
                {transaction.image_url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Receipt</label>
                    <img
                      src={transaction.image_url}
                      alt="Transaction receipt"
                      className="w-full rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(transaction.image_url!, '_blank')}
                    />
                    <p className="text-xs text-gray-500 mt-1">Click to view full size</p>
                  </div>
                )}

                {/* Metadata */}
                <div className="pt-4 border-t text-xs text-gray-500 space-y-1">
                  <div>ID: {transaction.id}</div>
                  {transaction.created_at && <div>Created: {transaction.created_at}</div>}
                  {transaction.updated_at && <div>Updated: {transaction.updated_at}</div>}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t">
                <Button onClick={handleEdit} className="flex-1">
                  Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={handleConfirmDelete}
                  className="flex-1"
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={handleCancelDelete}
          title="Confirm Delete"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            {transaction && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Transaction Details:</div>
                <div className="font-semibold text-gray-900 mt-1">
                  ${Number(transaction.amount).toFixed(2)} - {transaction.date}
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={handleCancelDelete}
                className="flex-1"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                className="flex-1"
                loading={deleteMutation.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  );
};
