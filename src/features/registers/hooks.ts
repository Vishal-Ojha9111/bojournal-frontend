// FILE: src/features/registers/hooks.ts
// PURPOSE: React Query hooks for register operations
// API: All register endpoints via registersApi

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/queries';
import registersApi from './api';
import type { RegisterInput, RegisterFilters } from './schemas';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../lib/apiClient';

/**
 * Hook to list all registers
 */
export const useRegisters = (filters?: RegisterFilters) => {
  return useQuery({
    queryKey: queryKeys.registers.list(filters as Record<string, unknown>),
    queryFn: () => registersApi.listRegisters(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes (registers don't change often)
  });
};

/**
 * Hook to get a single register
 */
export const useRegister = (id: number) => {
  return useQuery({
    queryKey: queryKeys.registers.detail(id),
    queryFn: () => registersApi.getRegister(id),
    enabled: !!id,
  });
};

/**
 * Hook to create a new register
 */
export const useCreateRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterInput) => registersApi.createRegister(data),
    onSuccess: () => {
      // Invalidate all register lists
      queryClient.invalidateQueries({ queryKey: queryKeys.registers.all });
      toast.success('Register created successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || 'Failed to create register');
    },
  });
};

/**
 * Hook to update a register
 */
export const useUpdateRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RegisterInput }) =>
      registersApi.updateRegister(id, data),
    onSuccess: (_data, variables) => {
      // Invalidate the specific register and all lists
      queryClient.invalidateQueries({ queryKey: queryKeys.registers.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.registers.lists() });
      toast.success('Register updated successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || 'Failed to update register');
    },
  });
};

/**
 * Hook to delete a register
 */
export const useDeleteRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => registersApi.deleteRegister(id),
    onSuccess: () => {
      // Invalidate all register queries
      queryClient.invalidateQueries({ queryKey: queryKeys.registers.all });
      // Also invalidate transactions since they reference registers
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all });
      toast.success('Register deleted successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message || 'Failed to delete register');
    },
  });
};
