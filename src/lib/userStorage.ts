// FILE: src/lib/userStorage.ts
// PURPOSE: localStorage utilities for user data including registers
// USAGE: Store and retrieve user data with register details for easy access throughout the app

import type { User } from '../features/auth/schemas';

const USER_STORAGE_KEY = 'bo_journal_user';

/**
 * Extended user type with registers from backend
 */
export interface StoredUser extends User {
  register_types?: Array<{
    id: number;
    register_name: string;
    debit: string;
    credit: string;
  }>;
  profile_picture_url?: string | null;
}

/**
 * Get user data from localStorage
 */
export const getStoredUser = (): StoredUser | null => {
  try {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;
    
    const user = JSON.parse(stored) as StoredUser;
    return user;
  } catch (error) {
    console.error('Error reading user from localStorage:', error);
    return null;
  }
};

/**
 * Store user data in localStorage
 */
export const setStoredUser = (user: StoredUser): void => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error storing user in localStorage:', error);
  }
};

/**
 * Update specific fields of stored user data
 */
export const updateStoredUser = (updates: Partial<StoredUser>): StoredUser | null => {
  try {
    const currentUser = getStoredUser();
    if (!currentUser) return null;
    
    const updatedUser = { ...currentUser, ...updates };
    setStoredUser(updatedUser);
    return updatedUser;
  } catch (error) {
    console.error('Error updating user in localStorage:', error);
    return null;
  }
};

/**
 * Clear user data from localStorage
 */
export const clearStoredUser = (): void => {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing user from localStorage:', error);
  }
};

/**
 * Get register name by ID from stored user data
 */
export const getRegisterNameById = (registerId: number): string | null => {
  const user = getStoredUser();
  if (!user?.register_types) return null;
  
  const register = user.register_types.find(r => r.id === registerId);
  return register ? register.register_name : null;
};

/**
 * Get all registers from stored user data
 */
export const getStoredRegisters = () => {
  const user = getStoredUser();
  return user?.register_types || [];
};

/**
 * Check if user data exists in localStorage
 */
export const hasStoredUser = (): boolean => {
  return !!getStoredUser();
};
