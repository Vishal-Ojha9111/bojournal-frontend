import { createContext, useContext } from 'react';
import type { User } from '../types/client/User';

interface AuthContextValue {
  user: User | null;
  setUser: (user: User | null) => void;
  csrfToken: string | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
