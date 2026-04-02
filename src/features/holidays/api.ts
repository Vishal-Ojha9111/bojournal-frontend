// FILE: src/features/holidays/api.ts
// PURPOSE: API client functions for holiday operations
// API: /api/v2/holiday

import apiClient from '../../lib/apiClient';
import type { HolidayListResponse, HolidayFilters, CreateHolidayInput, DeleteHolidayInput, UpdateHolidayInput } from './schemas';

/**
 * List all holidays with optional filters
 */
const listHolidays = async (filters?: HolidayFilters): Promise<HolidayListResponse> => {
  const params = new URLSearchParams();
  if (filters?.date) params.append('date', filters.date);
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);

  const response = await apiClient.get<HolidayListResponse>(`/holiday/?${params.toString()}`);
  return response.data;
};

/**
 * Create a new holiday
 */
const createHoliday = async (data: CreateHolidayInput): Promise<HolidayListResponse> => {
  const response = await apiClient.post<HolidayListResponse>('/holiday/', data);
  return response.data;
};

/**
 * Delete a holiday
 */
const deleteHoliday = async (data: DeleteHolidayInput): Promise<HolidayListResponse> => {
  const response = await apiClient.delete<HolidayListResponse>('/holiday/', { data });
  return response.data;
};

/**
 * Update a holiday (delete old + create new)
 */
const updateHoliday = async (oldDate: string, newData: UpdateHolidayInput): Promise<HolidayListResponse> => {
  // First delete the old holiday
  await deleteHoliday({ date: oldDate });
  // Then create the new one
  const response = await apiClient.post<HolidayListResponse>('/holiday/', {
    date: newData.date,
    reason: newData.reason,
  });
  return response.data;
};

const holidaysApi = {
  listHolidays,
  createHoliday,
  deleteHoliday,
  updateHoliday,
};

export default holidaysApi;
