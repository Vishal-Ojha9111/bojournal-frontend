# User Data Storage System Documentation

## Overview
This system stores user data (including registers and profile information) in localStorage for instant access throughout the application. The data is automatically synced with the backend through authentication flows.

## Architecture

### Files Created/Modified
1. **`src/lib/userStorage.ts`** - localStorage utility functions
2. **`src/features/auth/schemas.ts`** - Updated User type to include registers
3. **`src/features/auth/hooks.ts`** - Updated hooks to manage localStorage
4. **`src/features/auth/index.ts`** - Centralized exports

### Data Flow
```
Login/Signup → Store user data → localStorage
    ↓
AuthCheck → Update user data → localStorage
    ↓
Components → Read user data → localStorage
    ↓
Logout → Clear user data → localStorage
```

## API Integration

### Backend Response Structure
The backend returns user data with this structure:
```json
{
  "status": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "profile_picture_url": "https://...",
    "register_types": [
      {
        "id": 1,
        "register_name": "Cash",
        "debit": "cash_in",
        "credit": "cash_out"
      },
      {
        "id": 2,
        "register_name": "Bank",
        "debit": "deposit",
        "credit": "withdrawal"
      }
    ],
    "first_opening_balance": 1000.00,
    "first_opening_balance_date": "2024-01-01",
    "subscription_active": true
  }
}
```

## Usage Guide

### 1. Access User Data in Components

```typescript
import { useStoredUser } from '@/features/auth/hooks';

function MyComponent() {
  const { user, registers, getRegisterName, hasStoredData } = useStoredUser();
  
  if (!hasStoredData) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user.first_name}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### 2. Display Register Names from IDs

```typescript
import { useStoredUser } from '@/features/auth/hooks';

function TransactionList({ transactions }) {
  const { getRegisterName } = useStoredUser();
  
  return (
    <ul>
      {transactions.map(tx => (
        <li key={tx.id}>
          {getRegisterName(tx.register)} - ${tx.amount}
        </li>
      ))}
    </ul>
  );
}
```

### 3. Use Utility Functions (Without Hook)

```typescript
import { getRegisterNameById, getStoredRegisters, getStoredUser } from '@/lib/userStorage';

// Get register name
const registerName = getRegisterNameById(1); // Returns "Cash"

// Get all registers
const registers = getStoredRegisters();

// Get full user object
const user = getStoredUser();
```

### 4. Create Register Selector

```typescript
import { useStoredUser } from '@/features/auth/hooks';

function RegisterSelector({ value, onChange }) {
  const { registers } = useStoredUser();
  
  return (
    <select value={value} onChange={onChange}>
      <option value="">Select register</option>
      {registers.map(reg => (
        <option key={reg.id} value={reg.id}>
          {reg.register_name}
        </option>
      ))}
    </select>
  );
}
```

### 5. Show Profile Picture

```typescript
import { useStoredUser } from '@/features/auth/hooks';

function ProfilePicture() {
  const { user } = useStoredUser();
  
  return user?.profile_picture_url ? (
    <img src={user.profile_picture_url} alt="Profile" />
  ) : (
    <div>No picture</div>
  );
}
```

## Automatic Synchronization

### When Data is Stored/Updated:
1. **Login** - User data stored after successful login
2. **Signup (OTP verification)** - User data stored after account creation
3. **AuthCheck** - User data updated whenever authcheck runs:
   - On app load
   - On page refresh
   - When navigating between protected routes
   - Periodically (based on React Query settings)

### When Data is Cleared:
- **Logout** - All user data cleared from localStorage

## Available Data

### User Fields
```typescript
interface StoredUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string | null;
  first_opening_balance?: number;
  first_opening_balance_date?: string | null;
  subscription_active?: boolean;
  subscription_start_date?: string | null;
  subscription_end_date?: string | null;
  referral_code?: string;
  otp_verification?: boolean;
  register_types?: Array<{
    id: number;
    register_name: string;
    debit: string;
    credit: string;
  }>;
}
```

## Utility Functions

### `getStoredUser()`
Returns the complete user object from localStorage.
```typescript
const user = getStoredUser();
// Returns: StoredUser | null
```

### `setStoredUser(user)`
Stores user data in localStorage.
```typescript
setStoredUser(userData);
```

### `updateStoredUser(updates)`
Updates specific fields of stored user data.
```typescript
updateStoredUser({ first_name: 'Jane' });
```

### `clearStoredUser()`
Removes user data from localStorage.
```typescript
clearStoredUser();
```

### `getRegisterNameById(registerId)`
Gets register name by ID.
```typescript
const name = getRegisterNameById(1);
// Returns: "Cash" or null
```

### `getStoredRegisters()`
Gets all registers.
```typescript
const registers = getStoredRegisters();
// Returns: Array of registers
```

### `hasStoredUser()`
Checks if user data exists.
```typescript
const exists = hasStoredUser();
// Returns: boolean
```

## React Hooks

### `useStoredUser()`
React hook that provides reactive access to stored user data.

**Returns:**
```typescript
{
  user: StoredUser | null;
  registers: Register[];
  getRegisterName: (registerId: number) => string | null;
  hasStoredData: boolean;
}
```

**Features:**
- Automatically updates when localStorage changes
- Works across browser tabs
- Provides helper functions
- No API calls needed

### `useCurrentUser()`
React hook that gets current user from API (with loading states).

**Returns:**
```typescript
{
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
}
```

## Best Practices

### 1. Use `useStoredUser` for Display
```typescript
// ✅ Good - No loading state needed for display
const { getRegisterName } = useStoredUser();
<span>{getRegisterName(transaction.register)}</span>
```

```typescript
// ❌ Avoid - Unnecessary loading for simple display
const { user, isLoading } = useCurrentUser();
if (isLoading) return <Spinner />;
```

### 2. Combine Both Hooks When Needed
```typescript
// Use stored data for immediate display
const { getRegisterName } = useStoredUser();

// Use current user for auth checks
const { isAuthenticated } = useCurrentUser();
```

### 3. Handle Missing Data Gracefully
```typescript
const registerName = getRegisterName(tx.register) || 'Unknown Register';
```

### 4. Refresh Data When Needed
```typescript
import { queryClient } from '@/lib/queryClient';
import { queryKeys } from '@/lib/queries';

// Force refresh user data
await queryClient.refetchQueries({ queryKey: queryKeys.auth.check });
// This will automatically update localStorage
```

## Troubleshooting

### Data Not Updating?
- Check if user is authenticated
- Verify authcheck is running (check React Query Devtools)
- Force refresh: `queryClient.refetchQueries({ queryKey: queryKeys.auth.check })`

### Register Names Not Showing?
- Verify user has registers: `const { registers } = useStoredUser()`
- Check if register ID exists: `registers.find(r => r.id === registerId)`
- Ensure authcheck has run at least once after login

### Profile Picture Not Loading?
- Check if URL exists: `user?.profile_picture_url`
- Verify S3 presigned URL hasn't expired
- Refresh data to get new presigned URL

## Benefits

1. **Performance** - No API calls needed for display
2. **Offline Support** - Works with last synced data
3. **User Experience** - Instant data access, no loading spinners
4. **Reduced Server Load** - Fewer API requests
5. **Developer Experience** - Simple, intuitive API
6. **Automatic Sync** - Updates happen automatically through authcheck

## Security Notes

- Data is stored in localStorage (accessible to JavaScript)
- No sensitive data (passwords, tokens) is stored
- Data is cleared on logout
- Use HTTPS in production to prevent interception
- Consider encrypting sensitive fields if needed

## Migration Guide

If you have existing components using API calls for user data:

### Before:
```typescript
const { data: userData } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser
});
```

### After:
```typescript
const { user } = useStoredUser();
// No loading state needed, data is immediately available
```
