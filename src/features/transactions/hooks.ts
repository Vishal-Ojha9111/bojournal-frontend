// FILE: src/features/transactions/hooks.ts
// PURPOSE: React Query hooks for transaction operations
// API: All transaction endpoints via transactionsApi

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queries';
import transactionsApi from './api';
import type { TransactionInput, TransactionFilters } from './schemas';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../lib/apiClient';

/**
 * Hook to list transactions
 */
export const useTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: () => transactionsApi.listTransactions(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to get a single transaction
 */
export const useTransaction = (id: number) => {
  return useQuery({
    queryKey: queryKeys.transactions.detail(id),
    queryFn: () => transactionsApi.getTransaction(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a transaction
 */
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransactionInput) => transactionsApi.createTransaction(data),
    onSuccess: () => {
      // Invalidate all transaction queries
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      // Also invalidate journal queries as transactions affect journal
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
      toast.success('Transaction created successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Hook to update a transaction
 */
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TransactionInput> }) =>
      transactionsApi.updateTransaction(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific transaction and list
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
      toast.success('Transaction updated successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Hook to delete a transaction
 */
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => transactionsApi.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
      toast.success('Transaction deleted successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
};

/**
 * Hook to get presigned URL
 */
export const usePresignedUrl = () => {
  return useMutation({
    mutationFn: transactionsApi.getPresignedUrl,
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(`Failed to get upload URL: ${message}`);
    },
  });
};
