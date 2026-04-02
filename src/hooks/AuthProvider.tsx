import React, { useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import type {User} from '../types/client/User'
import { ensureCsrf } from '../lib/apiClient';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
const storedUser = localStorage.getItem('boj-user');
const initialUser = storedUser ? JSON.parse(storedUser) : null;
const [user, setUser] = useState<User | null>(initialUser);
const [csrfToken, setCsrfToken] = useState<string | null>(null);

// Fetch CSRF token on app load using the unified apiClient
const getCSRFToken = async () => {
  try {
    const token = await ensureCsrf();
    setCsrfToken(token);
  } catch (err) {
    console.debug('Failed to fetch CSRF token', err);
  }
}

useEffect(() => {
  getCSRFToken();
}, []);

  return (
    <AuthContext.Provider value={{ user, setUser, csrfToken }}>
      {children}
    </AuthContext.Provider>
  );
};
