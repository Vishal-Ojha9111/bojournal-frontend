import {Dayjs} from "dayjs";

export interface User {
  first_name: string;
  last_name: string;
  email: string;
  register_types: [Register_type];
  verified: boolean;
  otp_verification: boolean;
  first_opening_balance:number;
  first_opening_balance_date: string|Dayjs;
}

export interface Register_type {
  id: number;
  name: string;
  debit: boolean;
  credit: boolean;
}