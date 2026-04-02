// FILE: src/features/holidays/hooks.ts
// PURPOSE: React Query hooks for holiday operations
// API: All holiday endpoints via holidaysApi

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queries';
import holidaysApi from './api';
import type { HolidayFilters, CreateHolidayInput, DeleteHolidayInput, UpdateHolidayInput } from './schemas';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../lib/apiClient';

/**
 * Hook to list all holidays
 */
export const useHolidays = (filters?: HolidayFilters) => {
  return useQuery({
    queryKey: queryKeys.holidays.list(filters as Record<string, unknown>),
    queryFn: () => holidaysApi.listHolidays(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to create a holiday
 */
export const useCreateHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHolidayInput) => holidaysApi.createHoliday(data),
    onSuccess: () => {
      // Invalidate all holiday queries
      queryClient.invalidateQueries({ queryKey: queryKeys.holidays.all });
      // Also invalidate journal queries as holidays are journal entries
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
      toast.success('Holiday marked successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || 'Failed to mark holiday');
    },
  });
};

/**
 * Hook to delete a holiday
 */
export const useDeleteHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteHolidayInput) => holidaysApi.deleteHoliday(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.holidays.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
      toast.success('Holiday removed successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || 'Failed to remove holiday');
    },
  });
};

/**
 * Hook to update a holiday
 */
export const useUpdateHoliday = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ oldDate, newData }: { oldDate: string; newData: UpdateHolidayInput }) => 
      holidaysApi.updateHoliday(oldDate, newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.holidays.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
      toast.success('Holiday updated successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || 'Failed to update holiday');
    },
  });
};
