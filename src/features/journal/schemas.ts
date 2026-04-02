// FILE: src/features/journal/schemas.ts
// PURPOSE: Zod validation schemas and TypeScript types for journal entries
// API: /api/v2/journal/

import { z } from 'zod';

/**
 * Journal Group Type Enum
 * - day: Group by individual days
 * - week: Group by weeks
 * - month: Group by months
 */
export const journalGroupEnum = z.enum(['day', 'week', 'month']);

/**
 * Journal Entry Schema (single day's data)
 */
export const journalEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  opening_balance: z.number(),
  closing_balance: z.number(),
  total_debit: z.number(),
  total_credit: z.number(),
  transaction_count: z.number().int().nonnegative(),
});

/**
 * Transaction inside journal entry
 */
export interface JournalTransaction {
  id: number;
  amount: string;
  transaction_type: 'debit' | 'credit';
  description: string;
  date: string;
  register: {
    id: number;
    name: string;
  };
  image_keys: string[];
  created_at: string;
}

/**
 * Journal Entry Type (from API response)
 */
export interface JournalEntry {
  id: number;
  date: string; // YYYY-MM-DD
  opening_balance: string;
  closing_balance: string;
  is_holiday: boolean;
  holiday_reason?: string;
  transactions: JournalTransaction[];
}

/**
 * Journal Summary from API response
 */
export interface JournalSummary {
  total_debit: string;
  total_credit: string;
  net_change: string;
  start_balance: string;
  end_balance: string;
}

/**
 * Journal List Response from API
 */
export interface JournalListResponse {
  status: boolean;
  message: string;
  journals: JournalEntry[];
  summary: JournalSummary;
}

/**
 * Journal Detail Response
 */
export interface JournalDetailResponse {
  status: boolean;
  message: string;
  data: JournalEntry;
}

/**
 * Journal Filters
 * Note: API only supports date, start_date, end_date
 * group_by is NOT supported by backend API
 */
export interface JournalFilters {
  date?: string; // Single date (YYYY-MM-DD)
  start_date?: string; // Date range start
  end_date?: string; // Date range end
}

/**
 * Create First Journal Entry Input
 */
export const createFirstJournalSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  opening_balance: z
    .number()
    .min(0, 'Opening balance must be positive')
    .refine((val) => Number(val.toFixed(2)) === val, 'Maximum 2 decimal places'),
});

export type CreateFirstJournalInput = z.infer<typeof createFirstJournalSchema>;

/**
 * Update Opening Balance Input
 */
export const updateOpeningBalanceSchema = z.object({
  opening_balance: z
    .number()
    .min(0, 'Opening balance must be positive')
    .refine((val) => Number(val.toFixed(2)) === val, 'Maximum 2 decimal places'),
});

export type UpdateOpeningBalanceInput = z.infer<typeof updateOpeningBalanceSchema>;
