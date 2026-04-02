// FILE: src/features/journal/api.ts
// PURPOSE: API client functions for journal operations
// API: /api/v2/journal/

import apiClient from '../../lib/apiClient';
import type {
  JournalEntry,
  JournalListResponse,
  JournalDetailResponse,
  JournalFilters,
  CreateFirstJournalInput,
  UpdateOpeningBalanceInput,
} from './schemas';

/**
 * List all journal entries with optional filters
 * API returns: { status, message, journals, summary }
 */
const listJournalEntries = async (filters?: JournalFilters): Promise<JournalListResponse> => {
  const params = new URLSearchParams();
  if (filters?.date) params.append('date', filters.date);
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);

  const response = await apiClient.get<JournalListResponse>(`/journal/?${params.toString()}`);
  return response.data;
};

/**
 * Get a single journal entry by ID (not documented in API)
 * Kept for backward compatibility
 */
const getJournalEntry = async (id: number): Promise<JournalEntry | null> => {
  try {
    const response = await apiClient.get<JournalDetailResponse>(`/journal/${id}/`);
    return response.data.data;
  } catch {
    console.warn('getJournalEntry by ID not supported, use getJournalEntryByDate instead');
    return null;
  }
};

/**
 * Get journal entry by date (not documented in API)
 * Use listJournalEntries with date filter instead
 */
const getJournalEntryByDate = async (date: string): Promise<JournalEntry | null> => {
  const response = await listJournalEntries({ date });
  return response.journals[0] || null;
};

/**
 * Create the first journal entry (initializes the journal)
 * API endpoint: POST /journal/
 */
const createFirstJournalEntry = async (data: CreateFirstJournalInput): Promise<JournalEntry[]> => {
  const response = await apiClient.post<{ status: boolean; message: string; data: JournalEntry[] }>(
    '/journal/',
    data
  );
  return response.data.data;
};

/**
 * Update opening balance of a journal entry
 * API endpoint: PATCH /journal/
 */
const updateOpeningBalance = async (
  data: UpdateOpeningBalanceInput & { date: string }
): Promise<void> => {
  await apiClient.patch<{ status: boolean; message: string }>(
    `/journal/`,
    data
  );
};

/**
 * Get today's journal entry
 */
const getTodayJournal = async (): Promise<JournalEntry | null> => {
  const today = new Date().toISOString().split('T')[0];
  return getJournalEntryByDate(today);
};

export const journalApi = {
  listJournalEntries,
  getJournalEntry,
  getJournalEntryByDate,
  createFirstJournalEntry,
  updateOpeningBalance,
  getTodayJournal,
};

export default journalApi;
