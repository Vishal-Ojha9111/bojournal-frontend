// FILE: src/features/transactions/schemas.ts
// PURPOSE: Zod schemas for transaction data validation
// API: N/A (validation schemas)

import { z } from 'zod';

/**
 * Transaction type enum
 */
export const transactionTypeSchema = z.enum(['debit', 'credit']);

/**
 * Transaction create/update schema
 */
export const transactionSchema = z.object({
  amount: z
    .number()
    .positive('Amount must be positive')
    .multipleOf(0.01, 'Amount can have at most 2 decimal places'),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  register: z.number().int().positive('Register is required'),
  transaction_type: transactionTypeSchema,
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description must be less than 500 characters'),
  image_url: z.string().url().optional().nullable(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;

/**
 * Transaction response schema
 */
export const transactionResponseSchema = z.object({
  id: z.number(),
  amount: z.number(),
  date: z.string(),
  register: z.number(),
  register_name: z.string().optional(),
  transaction_type: transactionTypeSchema,
  description: z.string(),
  image_url: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type Transaction = z.infer<typeof transactionResponseSchema>;

/**
 * Transaction filters schema
 */
export const transactionFiltersSchema = z.object({
  date: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  transaction_type: transactionTypeSchema.optional(),
  register: z.number().optional(),
  page: z.number().optional(),
  page_size: z.number().optional(),
});

export type TransactionFilters = z.infer<typeof transactionFiltersSchema>;

/**
 * Presigned URL request schema
 */
export const presignedUrlRequestSchema = z.object({
  file_name: z.string().min(1, 'File name is required'),
  content_type: z.string().optional(),
  key_prefix: z.string().default('transactions/'),
});

export type PresignedUrlRequest = z.infer<typeof presignedUrlRequestSchema>;

/**
 * Presigned URL response schema
 */
export const presignedUrlResponseSchema = z.object({
  upload_url: z.string().url(),
  file_url: z.string().url(),
});

export type PresignedUrlResponse = z.infer<typeof presignedUrlResponseSchema>;

/**
 * Transaction list response schema
 */
export const transactionListResponseSchema = z.object({
  status: z.literal('success'),
  data: z.array(transactionResponseSchema),
  pagination: z
    .object({
      page: z.number(),
      page_size: z.number(),
      total: z.number(),
      total_pages: z.number(),
    })
    .optional(),
});

export type TransactionListResponse = z.infer<typeof transactionListResponseSchema>;
