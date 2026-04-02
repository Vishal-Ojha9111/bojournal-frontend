# Quick Reference: User Data Storage

## Import Statements

```typescript
// React Hook (most common)
import { useStoredUser } from '@/features/auth/hooks';

// Utility Functions (no React needed)
import { 
  getStoredUser,
  getRegisterNameById,
  getStoredRegisters,
  setStoredUser,
  clearStoredUser
} from '@/lib/userStorage';
```

## Common Use Cases

### 1. Display User Name
```typescript
const { user } = useStoredUser();
<p>Welcome, {user?.first_name}!</p>
```

### 2. Show Register Name from ID
```typescript
const { getRegisterName } = useStoredUser();
<span>{getRegisterName(transaction.register)}</span>
```

### 3. List All Registers
```typescript
const { registers } = useStoredUser();
{registers.map(r => <div key={r.id}>{r.register_name}</div>)}
```

### 4. Profile Picture
```typescript
const { user } = useStoredUser();
<img src={user?.profile_picture_url} alt="Profile" />
```

### 5. Check If User Exists
```typescript
const { hasStoredData } = useStoredUser();
if (!hasStoredData) return <Login />;
```

### 6. Register Dropdown
```typescript
const { registers } = useStoredUser();
<select>
  {registers.map(r => (
    <option key={r.id} value={r.id}>{r.register_name}</option>
  ))}
</select>
```

## When to Use What

| Scenario | Use |
|----------|-----|
| Display user info | `useStoredUser()` |
| Show register names | `useStoredUser().getRegisterName()` |
| Auth checks | `useCurrentUser()` |
| Outside React | `getStoredUser()`, `getRegisterNameById()` |
| Loading states needed | `useCurrentUser()` |
| Immediate data needed | `useStoredUser()` |

## Data Sync

✅ **Automatically synced on:**
- Login
- Signup (after OTP)
- AuthCheck (on app load, refresh, navigation)

✅ **Automatically cleared on:**
- Logout

## Tips

1. **No loading states needed** with `useStoredUser()` - data is instant
2. **Always handle null** - user might not be logged in
3. **Refresh when needed** - call authcheck to get latest data
4. **Works offline** - uses last synced data
5. **Cross-tab sync** - updates when localStorage changes in other tabs

## Example Component

```typescript
import { useStoredUser } from '@/features/auth/hooks';

function Dashboard() {
  const { user, registers, getRegisterName, hasStoredData } = useStoredUser();
  
  if (!hasStoredData) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user.first_name}!</h1>
      <img src={user.profile_picture_url} alt="Profile" />
      
      <h2>Your Registers:</h2>
      <ul>
        {registers.map(r => (
          <li key={r.id}>{r.register_name}</li>
        ))}
      </ul>
      
      {/* In transaction display */}
      <p>Register: {getRegisterName(transactionRegisterId)}</p>
    </div>
  );
}
```

## Troubleshooting

**Not seeing register names?**
→ User needs to log in and registers must exist in their account

**Data not updating?**
→ AuthCheck needs to run (happens automatically on navigation)

**Profile picture not loading?**
→ URL might be expired, refresh to get new presigned URL

**Need fresh data?**
→ Force refresh: `queryClient.refetchQueries({ queryKey: queryKeys.auth.check })`
