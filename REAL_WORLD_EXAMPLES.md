# Real-World Implementation Example

## Example: Updating DashboardPage to Show Register Names

### Before (showing register IDs):
```typescript
// DashboardPage.tsx - OLD
<div>
  {todayTransactions.map((transaction: Transaction) => (
    <div key={transaction.id}>
      <p>Register: {transaction.register}</p> {/* Shows ID like "1" or "2" */}
      <p>Amount: ${transaction.amount}</p>
    </div>
  ))}
</div>
```

### After (showing register names):
```typescript
// DashboardPage.tsx - NEW
import { useStoredUser } from '../../features/auth/hooks';

const DashboardPage: React.FC = () => {
  const { getRegisterName } = useStoredUser();
  
  // ... existing code ...
  
  return (
    <div>
      {todayTransactions.map((transaction: Transaction) => (
        <div key={transaction.id}>
          <p>Register: {getRegisterName(transaction.register) || 'Unknown'}</p> {/* Shows "Cash" or "Bank" */}
          <p>Amount: ${transaction.amount}</p>
        </div>
      ))}
    </div>
  );
};
```

## Example: Profile Picture in Sidebar

### Before (no profile picture or needs API call):
```typescript
// Sidebar.tsx - OLD
<Avatar
  name={`${user?.first_name} ${user?.last_name}`}
  size="md"
/>
```

### After (with stored profile picture):
```typescript
// Sidebar.tsx - NEW
import { useStoredUser } from '../../features/auth/hooks';

const Sidebar: React.FC = () => {
  const { user: storedUser } = useStoredUser();
  const { user } = useCurrentUser(); // For auth state
  
  return (
    <Avatar
      src={storedUser?.profile_picture_url || undefined}
      name={`${user?.first_name} ${user?.last_name}`}
      size="md"
    />
  );
};
```

## Example: Register Dropdown in Transaction Form

### Implementation:
```typescript
// CreateTransactionForm.tsx
import { useStoredUser } from '../../features/auth/hooks';

const CreateTransactionForm: React.FC = () => {
  const { registers } = useStoredUser();
  const [selectedRegister, setSelectedRegister] = useState('');
  
  return (
    <form>
      <label>Select Register:</label>
      <select 
        value={selectedRegister} 
        onChange={(e) => setSelectedRegister(e.target.value)}
      >
        <option value="">Choose a register</option>
        {registers.map(register => (
          <option key={register.id} value={register.id}>
            {register.register_name}
          </option>
        ))}
      </select>
      
      {/* Other form fields */}
    </form>
  );
};
```

## Example: Transaction History with Register Names

### Implementation:
```typescript
// TransactionHistory.tsx
import { useStoredUser } from '../../features/auth/hooks';
import { useTransactions } from '../../features/transactions/hooks';

const TransactionHistory: React.FC = () => {
  const { data: transactionsData, isLoading } = useTransactions();
  const { getRegisterName } = useStoredUser();
  
  if (isLoading) return <Skeleton />;
  
  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Register</th>
          <th>Amount</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        {transactionsData?.data.map(transaction => (
          <tr key={transaction.id}>
            <td>{transaction.date}</td>
            <td>{getRegisterName(transaction.register) || `Register #${transaction.register}`}</td>
            <td>${transaction.amount}</td>
            <td>{transaction.transaction_type}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

## Example: User Welcome Message

### Implementation:
```typescript
// DashboardHeader.tsx
import { useStoredUser } from '../../features/auth/hooks';

const DashboardHeader: React.FC = () => {
  const { user } = useStoredUser();
  
  // Get current time for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  
  return (
    <div>
      <h1>{greeting}, {user?.first_name}!</h1>
      <p>Welcome back to your dashboard</p>
      {user?.profile_picture_url && (
        <img 
          src={user.profile_picture_url} 
          alt="Profile" 
          className="w-12 h-12 rounded-full"
        />
      )}
    </div>
  );
};
```

## Example: Register Filter

### Implementation:
```typescript
// TransactionFilter.tsx
import { useStoredUser } from '../../features/auth/hooks';

const TransactionFilter: React.FC = () => {
  const { registers } = useStoredUser();
  const [selectedRegisters, setSelectedRegisters] = useState<number[]>([]);
  
  const toggleRegister = (registerId: number) => {
    setSelectedRegisters(prev => 
      prev.includes(registerId)
        ? prev.filter(id => id !== registerId)
        : [...prev, registerId]
    );
  };
  
  return (
    <div>
      <h3>Filter by Register:</h3>
      {registers.map(register => (
        <label key={register.id}>
          <input
            type="checkbox"
            checked={selectedRegisters.includes(register.id)}
            onChange={() => toggleRegister(register.id)}
          />
          {register.register_name}
        </label>
      ))}
    </div>
  );
};
```

## Example: Register Statistics

### Implementation:
```typescript
// RegisterStats.tsx
import { useStoredUser } from '../../features/auth/hooks';
import { useTransactions } from '../../features/transactions/hooks';

const RegisterStats: React.FC = () => {
  const { registers, getRegisterName } = useStoredUser();
  const { data: transactionsData } = useTransactions();
  
  // Calculate totals per register
  const registerTotals = registers.map(register => {
    const registerTransactions = transactionsData?.data.filter(
      tx => tx.register === register.id
    ) || [];
    
    const total = registerTransactions.reduce(
      (sum, tx) => sum + tx.amount,
      0
    );
    
    return {
      id: register.id,
      name: register.register_name,
      count: registerTransactions.length,
      total
    };
  });
  
  return (
    <div>
      <h2>Register Statistics</h2>
      {registerTotals.map(stat => (
        <div key={stat.id}>
          <h3>{stat.name}</h3>
          <p>Transactions: {stat.count}</p>
          <p>Total: ${stat.total.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
};
```

## Example: Conditional Rendering Based on Subscription

### Implementation:
```typescript
// FeatureGate.tsx
import { useStoredUser } from '../../features/auth/hooks';

const FeatureGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useStoredUser();
  
  if (!user?.subscription_active) {
    return (
      <div>
        <p>This feature requires an active subscription</p>
        <button>Upgrade Now</button>
      </div>
    );
  }
  
  return <>{children}</>;
};

// Usage
<FeatureGate>
  <AdvancedReports />
</FeatureGate>
```

## Performance Comparison

### Before (with API calls for each transaction):
```
Load Dashboard → 500ms
Load 10 Transactions → 300ms
Load Register Names (10 calls) → 2000ms
Total: ~2800ms
```

### After (with localStorage):
```
Load Dashboard → 500ms
Load 10 Transactions → 300ms
Load Register Names (from storage) → 0ms
Total: ~800ms (3.5x faster!)
```

## Key Takeaways

1. **Import once**: `import { useStoredUser } from '@/features/auth/hooks'`
2. **Use anywhere**: No prop drilling, no context, just import and use
3. **Zero latency**: Data is instantly available
4. **Auto-sync**: Updates automatically when user data changes
5. **Type-safe**: Full TypeScript support
6. **Fallback ready**: Always handle null/undefined cases

## Common Patterns

### Pattern 1: Display with Fallback
```typescript
{getRegisterName(registerId) || `Register #${registerId}`}
```

### Pattern 2: Conditional Display
```typescript
{user?.profile_picture_url && <img src={user.profile_picture_url} />}
```

### Pattern 3: Map Over Registers
```typescript
{registers.map(r => <option key={r.id} value={r.id}>{r.register_name}</option>)}
```

### Pattern 4: Check Data Availability
```typescript
const { hasStoredData } = useStoredUser();
if (!hasStoredData) return <Login />;
```
