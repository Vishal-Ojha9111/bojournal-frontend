# Quick Start Guide - New Frontend

## 🚀 Getting the New Frontend Running

Follow these steps to start using the newly scaffolded frontend:

### 1. Navigate to Frontend Directory
```bash
cd "/media/vishalojha/New Volume/source codes/bo_journal/frontend"
```

### 2. Dependencies are Already Installed ✅
The dependencies were installed during scaffolding. If you need to reinstall:
```bash
npm install
```

### 3. Configure Environment
The `.env` file is already configured with your production API. For local development:

```bash
# Create a .env.local for local development
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_BASE=http://localhost:8000/api/v2
VITE_PRODUCTION=False
```

### 4. Start Development Server
```bash
npm run dev
```

The app will start at `http://localhost:5173`

### 5. Test the Auth Flow

#### Test Signup:
1. Visit `http://localhost:5173/auth/signup`
2. Fill in the form (first_name and last_name must be single words)
3. Submit to receive OTP
4. Enter OTP in the modal
5. Should redirect to `/app/dashboard` (which doesn't exist yet)

#### Test Login:
1. Visit `http://localhost:5173/auth/login`
2. Enter credentials
3. Should redirect to dashboard

#### Test Password Reset:
1. Visit `http://localhost:5173/auth/reset`
2. Enter email → Receive OTP
3. Verify OTP → Set new password

### 6. View What's Built

✅ **Working Pages:**
- `/` - Landing page with hero, features, FAQ
- `/auth/signup` - Signup with OTP verification
- `/auth/signup/:referral_code` - Signup with referral
- `/auth/login` - Login page
- `/auth/reset` - Password reset flow

⏳ **Not Yet Built:**
- `/app/*` - Dashboard and all protected routes

### 7. Next Steps to Complete the App

#### Option A: Switch to New App.tsx (Recommended)
```bash
# Backup old App.tsx
mv src/App.tsx src/App.old.tsx

# Use new App.tsx
mv src/App.new.tsx src/App.tsx
```

#### Option B: Keep Old App.tsx and Gradually Migrate
You can keep using the existing App.tsx and gradually replace components with the new ones.

### 8. Build Protected Routes

Create `src/components/ProtectedRoute.tsx`:
```tsx
import { useCurrentUser } from '../features/auth/hooks';
import { Navigate } from 'react-router-dom';
import { Skeleton } from './ui';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useCurrentUser();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton width={200} height={24} />
          <Skeleton width={300} height={16} />
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }
  
  return <>{children}</>;
};
```

### 9. Create Dashboard Layout

Create `src/layouts/DashboardLayout.tsx`:
```tsx
import { Outlet } from 'react-router-dom';
import { useCurrentUser, useLogout } from '../features/auth/hooks';
import { Button, Avatar } from '../components/ui';

export const DashboardLayout = () => {
  const { user } = useCurrentUser();
  const logoutMutation = useLogout();

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-[var(--brand-500)]">
              BO Journal
            </h1>
            
            <div className="flex items-center gap-4">
              <Avatar
                src={user?.profile_picture || undefined}
                name={`${user?.first_name} ${user?.last_name}`}
                size="sm"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                loading={logoutMutation.isPending}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
```

### 10. Add Dashboard Routes

Update `src/App.tsx` (or `src/App.new.tsx`):
```tsx
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';

// In Routes:
<Route
  path="/app/*"
  element={
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<Navigate to="/app/dashboard" replace />} />
  <Route path="dashboard" element={<DashboardPage />} />
  {/* Add more routes as you build them */}
</Route>
```

### 11. Testing Components in Isolation

You can test individual components by creating a test page:

```tsx
// src/pages/TestPage.tsx
import { Button, Input, Select, Modal, Card, Avatar } from '../components/ui';
import { useState } from 'react';

export const TestPage = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-8 space-y-8">
      <Card>
        <h2 className="text-2xl font-bold mb-4">Button Variants</h2>
        <div className="flex gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold mb-4">Form Elements</h2>
        <Input label="Email" type="email" placeholder="test@example.com" />
        <Select
          label="Select Option"
          options={[
            { value: '1', label: 'Option 1' },
            { value: '2', label: 'Option 2' },
          ]}
        />
      </Card>

      <Card>
        <Button onClick={() => setShowModal(true)}>Open Modal</Button>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Test Modal"
      >
        <p>This is a test modal</p>
      </Modal>
    </div>
  );
};
```

Add to routes:
```tsx
<Route path="/test" element={<TestPage />} />
```

Visit: `http://localhost:5173/test`

## 📊 Project Status

### ✅ Completed (Ready to Use)
- Core API client with auto-refresh
- Design system with dark mode
- All UI components (Button, Input, Select, Modal, Card, Avatar, Skeleton, FileUploader)
- Complete auth feature (signup, login, password reset)
- Auth pages with OTP flow
- Landing page
- React Query setup
- Form validation with Zod

### ⏳ Next to Build
- Dashboard layout
- Transaction management
- Register management
- Journal entries
- Holiday management
- Profile page
- Payment integration
- Protected routes

## 🐛 Known Issues

1. **TypeScript errors in terminal** - Normal during file creation, resolved after npm install
2. **Dark mode toggle** - Component exists but toggle button not implemented yet
3. **Unused error variables** - Intentional, errors handled by React Query
4. **TODO-DESIGN markers** - Need designer to fill in images and fine-tune styling

## 📚 Documentation

- `README.new.md` - Full project documentation
- `IMPLEMENTATION_SUMMARY.md` - What's built and what's next
- `copilot_prompt_full.md` - Original specification
- `FRONTEND_DEVELOPER_GUIDE.md` - Backend API documentation

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Dependencies Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### API Connection Issues
1. Check backend is running
2. Verify VITE_API_BASE in .env
3. Check browser console for CORS errors
4. Verify cookies are being sent (credentials: 'include')

### Build Errors
```bash
npm run build
# If errors, check TypeScript errors:
npx tsc --noEmit
```

## 🎉 You're Ready!

The frontend scaffold is complete and ready for development. Start by testing the auth flow, then proceed to build the dashboard and remaining features following the patterns established in the auth feature.

Happy coding! 🚀
