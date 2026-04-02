// FILE: src/features/registers/schemas.ts
// PURPOSE: Zod validation schemas and TypeScript types for registers
// API: /api/v2/registers/

import { z } from 'zod';

/**
 * Register Type Enum
 * - debit: Only debit transactions allowed
 * - credit: Only credit transactions allowed
 * - both: Both debit and credit allowed
 */
export const registerTypeEnum = z.enum(['debit', 'credit', 'both']);

/**
 * Register Schema
 * Validates register creation/update data
 */
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  credit: z.boolean(),
  debit: z.boolean(),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
}).refine(data => data.credit || data.debit, {
  message: 'At least one transaction type (credit or debit) must be enabled',
  path: ['credit'],
});

/**
 * Register Input Type (for create/update)
 */
export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Register Type (from API response)
 */
export interface Register {
  id: number;
  name: string;
  credit: boolean;  // Whether credit transactions are allowed
  debit: boolean;   // Whether debit transactions are allowed
  description?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Register List Response (paginated)
 */
export interface RegisterListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Register[];
}

/**
 * Register Detail Response
 */
export interface RegisterDetailResponse {
  status: string;
  data: Register;
}

/**
 * Register Filters
 */
export interface RegisterFilters {
  register_type?: 'debit' | 'credit' | 'both';
  search?: string;
}
