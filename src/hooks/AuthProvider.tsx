import React, { useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import type {User} from '../types/client/User'
import serverUrl from '../var/serverUrl';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
const storedUser = localStorage.getItem('boj-user');
const initialUser = storedUser ? JSON.parse(storedUser) : null;
const [user, setUser] = useState<User | null>(initialUser);
const [csrfToken, setCsrfToken] = useState<string | null>(null);
console.log(Boolean(initialUser),user)
const getCSRFToken = async () => {
  try {
    const res = await fetch(`${serverUrl}/api/auth/csrf`, { method: 'GET', credentials: 'include' });
    if (!res.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    const data = await res.json();
    setCsrfToken(data.csrftoken);
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
