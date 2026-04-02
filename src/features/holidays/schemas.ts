// FILE: src/features/holidays/schemas.ts
// PURPOSE: TypeScript types and schemas for holidays
// API: /api/v2/holiday

export interface Holiday {
  date: string;
  holiday_reason: string;
  is_holiday: boolean;
}

export interface HolidayFilters {
  date?: string;
  start_date?: string;
  end_date?: string;
}

export interface HolidayListResponse {
  status: boolean;
  message: string;
  data: Holiday[];
}

export interface CreateHolidayInput {
  date: string;
  reason: string;
}

export interface DeleteHolidayInput {
  date: string;
}

export interface UpdateHolidayInput {
  date: string;
  reason: string;
}
