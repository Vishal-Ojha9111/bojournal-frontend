import type { User } from '../client/User';

export interface AuthCheckResponse {
  status: boolean;
  message: string;
  user: User;
}