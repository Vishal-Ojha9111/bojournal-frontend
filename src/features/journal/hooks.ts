// FILE: src/features/journal/hooks.ts
// PURPOSE: React Query hooks for journal operations
// API: All journal endpoints via journalApi

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queries';
import journalApi from './api';
import type { JournalFilters, CreateFirstJournalInput, UpdateOpeningBalanceInput } from './schemas';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../lib/apiClient';

/**
 * Hook to list all journal entries
 */
export const useJournalEntries = (filters?: JournalFilters) => {
  return useQuery({
    queryKey: queryKeys.journal.list(filters as Record<string, unknown>),
    queryFn: () => journalApi.listJournalEntries(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to get a single journal entry
 * Note: Not documented in API, consider using useJournalEntryByDate
 */
export const useJournalEntry = (id: number) => {
  return useQuery({
    queryKey: queryKeys.journal.detail(id),
    queryFn: () => journalApi.getJournalEntry(id),
    enabled: !!id,
  });
};

/**
 * Hook to get journal entry by date
 * Uses the list API with date filter
 */
export const useJournalEntryByDate = (date: string) => {
  return useQuery({
    queryKey: ['journal', 'by-date', date],
    queryFn: () => journalApi.getJournalEntryByDate(date),
    enabled: !!date,
  });
};

/**
 * Hook to get today's journal entry
 * Uses the list API with today's date
 */
export const useTodayJournal = () => {
  return useQuery({
    queryKey: ['journal', 'today'],
    queryFn: () => journalApi.getTodayJournal(),
    staleTime: 1 * 60 * 1000, // 1 minute (today's data changes frequently)
  });
};

/**
 * Hook to create the first journal entry
 */
export const useCreateFirstJournal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFirstJournalInput) => journalApi.createFirstJournalEntry(data),
    onSuccess: () => {
      // Invalidate all journal queries
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
      toast.success('First journal entry created successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || 'Failed to create first journal entry');
    },
  });
};

/**
 * Hook to update opening balance
 * Note: API requires date along with opening_balance
 */
export const useUpdateOpeningBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOpeningBalanceInput & { date: string }) =>
      journalApi.updateOpeningBalance(data),
    onSuccess: () => {
      // Invalidate all journal queries
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
      // Also invalidate today's journal if applicable
      queryClient.invalidateQueries({ queryKey: ['journal', 'today'] });
      toast.success('Opening balance updated successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || 'Failed to update opening balance');
    },
  });
};
