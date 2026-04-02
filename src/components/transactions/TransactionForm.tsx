// FILE: src/components/transactions/TransactionForm.tsx
// PURPOSE: Reusable form for creating/editing transactions with file upload
// API: POST/PUT /transactions/, GET /transactions/presigned-url/

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { FileUploader } from '../ui/FileUploader';
import { transactionSchema, type TransactionInput, type Transaction } from '../../features/transactions/schemas';
import { transactionsApi } from '../../features/transactions/api';
import { useRegisters } from '../../features/registers/hooks';
import type { Register } from '../../features/registers/schemas';

interface TransactionFormProps {
  /** Existing transaction for edit mode, undefined for create mode */
  transaction?: Transaction;
  /** Callback fired on successful submit (after API call) */
  onSuccess?: (transaction: Transaction) => void;
  /** Callback fired on cancel */
  onCancel?: () => void;
  /** Show cancel button */
  showCancel?: boolean;
}

/**
 * TransactionForm Component
 * 
 * Renders a form for creating or editing transactions.
 * 
 * Features:
 * - All fields: amount, date, register, transaction_type, description, image upload
 * - File upload with presigned URLs (uploads before form submission)
 * - Validation with Zod schema
 * - Loading states
 * - Error handling with cleanup on failure
 * - Optimistic UI patterns
 * 
 * Usage:
 * ```tsx
 * // Create mode
 * <TransactionForm onSuccess={(t) => navigate(`/transactions/${t.id}`)} />
 * 
 * // Edit mode
 * <TransactionForm 
 *   transaction={existingTransaction}
 *   onSuccess={() => toast.success('Updated')}
 *   onCancel={() => closeModal()}
 *   showCancel
 * />
 * ```
 */
export const TransactionForm: React.FC<TransactionFormProps> = ({
  transaction,
  onSuccess,
  onCancel,
  showCancel = false,
}) => {
  const isEditMode = !!transaction;
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | undefined>(
    transaction?.image_url || undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch registers for dropdown
  const { data: registersData, isLoading: isLoadingRegisters } = useRegisters();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          amount: transaction.amount,
          date: transaction.date,
          register: transaction.register,
          transaction_type: transaction.transaction_type,
          description: transaction.description || '',
          image_url: transaction.image_url,
        }
      : {
          date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD
          transaction_type: 'debit',
          description: '',
        },
  });

  // Watch selected register to filter transaction types
  const selectedRegisterId = watch('register');
  const selectedRegister = registersData?.results?.find((r: Register) => r.id === selectedRegisterId);

  // Get allowed transaction types based on selected register
  const getAllowedTransactionTypes = (): Array<{ value: string; label: string }> => {
    if (!selectedRegister) {
      return [
        { value: '', label: 'Select a register first' },
      ];
    }

    const types: Array<{ value: string; label: string }> = [];
    if (selectedRegister.debit) {
      types.push({ value: 'debit', label: 'Debit (Money Out)' });
    }
    if (selectedRegister.credit) {
      types.push({ value: 'credit', label: 'Credit (Money In)' });
    }

    return types.length > 0 ? types : [{ value: '', label: 'No types available' }];
  };

  // Reset form when transaction changes (useful in modals)
  useEffect(() => {
    if (transaction) {
      reset({
        amount: transaction.amount,
        date: transaction.date,
        register: transaction.register,
        transaction_type: transaction.transaction_type,
        description: transaction.description || '',
        image_url: transaction.image_url || undefined,
      });
      setUploadedImageUrl(transaction.image_url || undefined);
    }
  }, [transaction, reset]);

  const onSubmit = async (data: TransactionInput) => {
    setIsSubmitting(true);

    try {
      // Include uploaded image URL if available
      const payload: TransactionInput = {
        ...data,
        image_url: uploadedImageUrl,
      };

      let result: Transaction;
      if (isEditMode) {
        result = await transactionsApi.updateTransaction(transaction.id, payload);
        toast.success('Transaction updated successfully');
      } else {
        result = await transactionsApi.createTransaction(payload);
        toast.success('Transaction created successfully');
      }

      onSuccess?.(result);
    } catch (error) {
      // If submission fails and we uploaded a new image, try to clean it up
      if (uploadedImageUrl && uploadedImageUrl !== transaction?.image_url) {
        await transactionsApi.cleanupFiles([uploadedImageUrl]).catch(() => {
          // Cleanup is best-effort, don't show error to user
        });
      }

      const message = error instanceof Error ? error.message : 'Failed to save transaction';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUploadSuccess = (results: { file: File; fileUrl: string; error?: string }[]) => {
    if (results.length > 0 && results[0].fileUrl) {
      setUploadedImageUrl(results[0].fileUrl);
      toast.success('Image uploaded successfully');
    }
  };

  const handleFileUploadError = (error: string) => {
    toast.error(error);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Amount */}
      <div>
        <label htmlFor="amount" className="block text-sm font-medium mb-1.5">
          Amount <span className="text-red-500">*</span>
        </label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          {...register('amount', { valueAsNumber: true })}
          error={errors.amount?.message}
          disabled={isSubmitting}
        />
        <p className="text-xs text-gray-500 mt-1">Enter amount up to 2 decimal places</p>
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-medium mb-1.5">
          Date <span className="text-red-500">*</span>
        </label>
        <Input
          id="date"
          type="date"
          {...register('date')}
          error={errors.date?.message}
          disabled={isSubmitting}
        />
      </div>

      {/* Register - MOVED TO TOP */}
      <div>
        <label htmlFor="register" className="block text-sm font-medium mb-1.5">
          Register <span className="text-red-500">*</span>
        </label>
        <Controller
          name="register"
          control={control}
          render={({ field }) => (
            <Select
              id="register"
              value={field.value ? String(field.value) : ''}
              onChange={(e) => field.onChange(Number(e.target.value))}
              error={errors.register?.message}
              disabled={isSubmitting || isLoadingRegisters}
              options={[
                { value: '', label: isLoadingRegisters ? 'Loading registers...' : 'Select a register' },
                ...(registersData?.results.map((reg) => {
                  const typeLabel = reg.debit && reg.credit ? 'Both' : reg.debit ? 'Debit' : 'Credit';
                  return {
                    value: String(reg.id),
                    label: `${reg.name} (${typeLabel})`,
                  };
                }) || []),
              ]}
            />
          )}
        />
        {registersData?.results.length === 0 && (
          <p className="text-xs text-orange-600 mt-1">
            No registers found. Please create a register first.
          </p>
        )}
      </div>

      {/* Transaction Type - FILTERED BY REGISTER */}
      <div>
        <label htmlFor="transaction_type" className="block text-sm font-medium mb-1.5">
          Transaction Type <span className="text-red-500">*</span>
        </label>
        <Controller
          name="transaction_type"
          control={control}
          render={({ field }) => (
            <Select
              id="transaction_type"
              value={field.value}
              onChange={field.onChange}
              error={errors.transaction_type?.message}
              disabled={isSubmitting || !selectedRegisterId}
              options={getAllowedTransactionTypes()}
            />
          )}
        />
        {!selectedRegisterId && (
          <p className="text-xs text-gray-500 mt-1">
            Please select a register first to see available transaction types
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Enter transaction details (optional)"
          {...register('description')}
          disabled={isSubmitting}
          className={`
            w-full px-3 py-2 rounded-lg border transition-colors
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${errors.description ? 'border-red-500' : 'border-gray-300'}
          `}
        />
        {errors.description && (
          <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Maximum 500 characters ({register('description').name ? '0' : '0'}/500)
        </p>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium mb-1.5">Receipt/Image (Optional)</label>
        <FileUploader
          allowedPrefixes={['transactions/']}
          onUploadComplete={handleFileUploadSuccess}
          onError={handleFileUploadError}
          accept="image/*"
          maxSizeMB={5}
          maxFiles={1}
          multiple={false}
        />
        {uploadedImageUrl && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Image uploaded successfully
            </p>
            <button
              type="button"
              onClick={() => setUploadedImageUrl(undefined)}
              className="text-xs text-red-600 hover:text-red-700 underline mt-1"
              disabled={isSubmitting}
            >
              Remove image
            </button>
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t">
        {showCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} className="flex-1">
          {isEditMode ? 'Update Transaction' : 'Create Transaction'}
        </Button>
      </div>
    </form>
  );
};
