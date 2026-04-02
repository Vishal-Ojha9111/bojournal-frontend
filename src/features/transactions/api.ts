// FILE: src/features/transactions/api.ts
// PURPOSE: API functions for transaction endpoints
// API: GET /api/v2/transactions, POST /api/v2/transactions, PUT /api/v2/transactions/{id}, DELETE /api/v2/transactions/{id}, POST /api/v2/transactions/presigned-url

import apiClient from '../../lib/apiClient';
import type {
  TransactionInput,
  Transaction,
  TransactionFilters,
  PresignedUrlRequest,
  PresignedUrlResponse,
} from './schemas';

/**
 * List transactions with optional filters
 */
export const listTransactions = async (filters?: TransactionFilters) => {
  const response = await apiClient.get('/transactions/', {
    params: filters,
  });
  return response.data;
};

/**
 * Get a single transaction by ID
 */
export const getTransaction = async (id: number): Promise<{ status: string; data: Transaction }> => {
  const response = await apiClient.get(`/transactions/${id}`);
  return response.data;
};

/**
 * Create a new transaction
 */
export const createTransaction = async (data: TransactionInput) => {
  const response = await apiClient.post('/transactions/', data);
  return response.data;
};

/**
 * Update an existing transaction
 */
export const updateTransaction = async (id: number, data: Partial<TransactionInput>) => {
  const response = await apiClient.put(`/transactions/${id}/`, data);
  return response.data;
};

/**
 * Delete a transaction
 */
export const deleteTransaction = async (id: number) => {
  const response = await apiClient.delete(`/transactions/${id}/`);
  return response.data;
};

/**
 * Get presigned URL for file upload
 */
export const getPresignedUrl = async (
  data: PresignedUrlRequest
): Promise<{ status: string; data: PresignedUrlResponse }> => {
  const response = await apiClient.post('/transactions/presigned-url/', data);
  return response.data;
};

/**
 * Cleanup uploaded files (if available)
 */
export const cleanupFiles = async (fileUrls: string[]) => {
  try {
    const response = await apiClient.post('/transactions/cleanup/', {
      file_urls: fileUrls,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to cleanup files:', error);
    // Don't throw - cleanup is best effort
  }
};

export const transactionsApi = {
  listTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getPresignedUrl,
  cleanupFiles,
};

export default transactionsApi;
