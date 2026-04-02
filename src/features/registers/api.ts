// FILE: src/features/registers/api.ts
// PURPOSE: API client functions for register operations
// API: /api/v2/registers/

import apiClient from '../../lib/apiClient';
import type {
  Register,
  RegisterInput,
  RegisterListResponse,
  RegisterDetailResponse,
  RegisterFilters,
} from './schemas';

/**
 * List all registers with optional filters
 */
const listRegisters = async (filters?: RegisterFilters): Promise<RegisterListResponse> => {
  const params = new URLSearchParams();
  if (filters?.register_type) params.append('register_type', filters.register_type);
  if (filters?.search) params.append('search', filters.search);

  const response = await apiClient.get<RegisterListResponse>(`/registers/?${params.toString()}`);
  return response.data;
};

/**
 * Get a single register by ID
 */
const getRegister = async (id: number): Promise<RegisterDetailResponse> => {
  const response = await apiClient.get<RegisterDetailResponse>(`/registers/${id}/`);
  return response.data;
};

/**
 * Create a new register
 */
const createRegister = async (data: RegisterInput): Promise<Register> => {
  const response = await apiClient.post<{ status: string; data: Register }>('/registers/', data);
  return response.data.data;
};

/**
 * Update an existing register
 */
const updateRegister = async (id: number, data: RegisterInput): Promise<Register> => {
  const response = await apiClient.put<{ status: string; data: Register }>(
    `/registers/${id}/`,
    data
  );
  return response.data.data;
};

/**
 * Delete a register
 */
const deleteRegister = async (id: number): Promise<void> => {
  await apiClient.delete(`/registers/${id}/`);
};

export const registersApi = {
  listRegisters,
  getRegister,
  createRegister,
  updateRegister,
  deleteRegister,
};

export default registersApi;
