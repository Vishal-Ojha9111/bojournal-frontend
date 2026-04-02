// FILE: src/examples/UsingStoredUserData.tsx
// PURPOSE: Example component showing how to use stored user data
// USAGE: Reference this when you need to access user data or register names in components

import React from 'react';
import { useStoredUser } from '../features/auth/hooks';
import { getRegisterNameById, getStoredRegisters } from '../lib/userStorage';

/**
 * Example 1: Using the useStoredUser hook in a component
 */
export const ExampleComponent: React.FC = () => {
  const { user, registers, getRegisterName, hasStoredData } = useStoredUser();

  if (!hasStoredData) {
    return <div>No user data available</div>;
  }

  return (
    <div>
      {/* Access user info */}
      <h2>Welcome, {user?.first_name} {user?.last_name}!</h2>
      <p>Email: {user?.email}</p>
      
      {/* Access profile picture */}
      {user?.profile_picture_url && (
        <img src={user.profile_picture_url} alt="Profile" />
      )}

      {/* Access registers */}
      <h3>Your Registers:</h3>
      <ul>
        {registers.map((register: { id: number; register_name: string; debit: string; credit: string }) => (
          <li key={register.id}>
            {register.register_name} (Debit: {register.debit}, Credit: {register.credit})
          </li>
        ))}
      </ul>

      {/* Get register name by ID */}
      <p>Register 1 name: {getRegisterName(1)}</p>
    </div>
  );
};

/**
 * Example 2: Using utility functions directly (without hook)
 */
export const getRegisterDisplayName = (registerId: number): string => {
  const registerName = getRegisterNameById(registerId);
  return registerName || `Register #${registerId}`;
};

/**
 * Example 3: Formatting transactions with register names
 */
export const TransactionDisplay: React.FC<{ transaction: { id: number; amount: number; register: number; date: string } }> = ({ transaction }) => {
  const { getRegisterName } = useStoredUser();
  
  return (
    <div>
      <p>Amount: ${transaction.amount}</p>
      <p>Register: {getRegisterName(transaction.register) || 'Unknown Register'}</p>
      <p>Date: {transaction.date}</p>
    </div>
  );
};

/**
 * Example 4: Using all registers for a dropdown/select
 */
export const RegisterSelector: React.FC = () => {
  const registers = getStoredRegisters();
  
  return (
    <select>
      <option value="">Select a register</option>
      {registers.map((register) => (
        <option key={register.id} value={register.id}>
          {register.register_name}
        </option>
      ))}
    </select>
  );
};

/**
 * How the system works:
 * 
 * 1. When user logs in or signs up, user data (including registers) is stored in localStorage
 * 2. When authcheck runs (on app load, page refresh, etc), it updates the localStorage with latest data
 * 3. When user logs out, localStorage is cleared
 * 4. Components can access this data instantly using useStoredUser hook or utility functions
 * 5. No need to make additional API calls to get register names when displaying transactions
 * 
 * Benefits:
 * - Instant access to user data without API calls
 * - Register IDs can be converted to readable names easily
 * - Profile picture URLs are readily available
 * - Works even when offline (uses last synced data)
 * - Automatically updates when user data changes (after authcheck)
 */
