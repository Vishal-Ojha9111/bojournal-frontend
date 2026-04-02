// FILE: src/lib/queries.ts
// PURPOSE: React Query client configuration and global query settings
// API: N/A (configuration only)

import { QueryClient } from '@tanstack/react-query';

/**
 * Global React Query configuration
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors except 408, 429
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status && status >= 400 && status < 500) {
          if (status === 408 || status === 429) {
            return failureCount < 2;
          }
          return false;
        }
        // Retry on 5xx errors up to 3 times
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});

/**
 * Query key factory for consistent cache keys
 */
export const queryKeys = {
  // Auth
  auth: {
    check: ['auth', 'check'] as const,
  },
  
  // User
  user: {
    profile: ['user', 'profile'] as const,
  },
  
  // Transactions
  transactions: {
    all: ['transactions'] as const,
    list: (filters?: Record<string, unknown>) => ['transactions', 'list', filters] as const,
    detail: (id: number) => ['transactions', 'detail', id] as const,
  },
  
  // Registers
  registers: {
    all: ['registers'] as const,
    lists: () => ['registers', 'list'] as const,
    list: (filters?: Record<string, unknown>) => ['registers', 'list', filters] as const,
    detail: (id: number) => ['registers', 'detail', id] as const,
  },
  
  // Journal
  journal: {
    all: ['journal'] as const,
    list: (filters?: Record<string, unknown>) => ['journal', 'list', filters] as const,
    detail: (id: number) => ['journal', 'detail', id] as const,
  },
  
  // Holidays
  holidays: {
    all: ['holidays'] as const,
    list: (filters?: Record<string, unknown>) => ['holidays', 'list', filters] as const,
  },
  
  // Payment
  payment: {
    plans: ['payment', 'plans'] as const,
    history: ['payment', 'history'] as const,
    status: ['payment', 'status'] as const,
  },
} as const;

export default queryClient;
