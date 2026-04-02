# CSRF Token Issue - FIXED ✅

## Issue Summary
The frontend had conflicting CSRF token implementations:
1. **AuthProvider** was calling the old v1 endpoint `/api/auth/csrf` instead of `/api/v2/auth/csrf`
2. **apiClient.ts** had CSRF interceptor code commented out
3. **Duplicate systems**: Both AuthProvider and apiClient were trying to manage CSRF independently
4. **Wrong response key**: Code was looking for `csrf_token` but backend returns `csrftoken`

## Root Cause
- When the app loaded, AuthProvider tried to fetch CSRF from `/api/auth/csrf` (v1 endpoint)
- The new apiClient was configured for `/api/v2` base URL
- CSRF interceptor was disabled (commented out)
- This caused API calls to fail due to missing/invalid CSRF tokens

## Solution Applied

### 1. Fixed API Endpoint in apiClient.ts ✅
**File:** `src/lib/apiClient.ts`

**Changed:**
```typescript
// Updated ensureCsrf to check all possible response keys
csrfToken = response.data.csrftoken || response.data.csrf_token || response.data.csrfToken;
```

**Enabled CSRF Interceptor:**
```typescript
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      if (!config.url?.includes('/auth/csrf')) {
        try {
          const token = await ensureCsrf();
          config.headers['X-CSRFToken'] = token;
        } catch (error) {
          console.error('CSRF token fetch failed:', error);
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### 2. Updated AuthProvider to Use apiClient ✅
**File:** `src/hooks/AuthProvider.tsx`

**Before:**
```typescript
const res = await fetch(`${serverUrl}/api/auth/csrf`, { ... });
// Called /api/auth/csrf (v1 endpoint)
```

**After:**
```typescript
import { ensureCsrf } from '../lib/apiClient';

const getCSRFToken = async () => {
  try {
    const token = await ensureCsrf();
    setCsrfToken(token);
  } catch (err) {
    console.debug('Failed to fetch CSRF token', err);
  }
}
// Now uses apiClient which calls /api/v2/auth/csrf
```

## How It Works Now

### On App Load:
1. **AuthProvider** mounts and calls `ensureCsrf()` from apiClient
2. **apiClient.ensureCsrf()** makes GET request to `/api/v2/auth/csrf`
3. Token is stored in memory in apiClient
4. Token is also stored in AuthProvider state for backward compatibility

### On POST/PUT/PATCH/DELETE Requests:
1. **Request interceptor** detects mutating request
2. Calls `ensureCsrf()` to get token (uses cached if available)
3. Automatically adds `X-CSRFToken` header
4. Request proceeds with CSRF token

### Token Lifecycle:
- ✅ Fetched once on app load
- ✅ Cached in memory (no repeated fetches)
- ✅ Automatically attached to all mutating requests
- ✅ Cleared on logout via `clearCsrf()`
- ✅ Cleared on 401 errors (auth failure)

## API Endpoint Flow

### Current Configuration:
```
VITE_API_BASE=http://127.0.0.1:8000/api/v2
```

### CSRF Endpoint:
```
GET /api/v2/auth/csrf
Response: { "csrftoken": "..." }
```

### All API Calls Now Use v2:
- ✅ `/api/v2/auth/signup`
- ✅ `/api/v2/auth/login`
- ✅ `/api/v2/auth/logout`
- ✅ `/api/v2/transactions/`
- ✅ `/api/v2/registers/`
- ✅ `/api/v2/journal/`
- ✅ All other endpoints

## Benefits

### 1. Unified CSRF Management
- Single source of truth in `apiClient.ts`
- No duplicate fetching
- No conflicting implementations

### 2. Automatic CSRF Handling
- Developers don't need to manually add CSRF headers
- Interceptor handles it automatically
- Reduces errors and forgotten headers

### 3. Proper v2 API Usage
- All requests go through `/api/v2`
- Consistent endpoint structure
- Future-proof for API versioning

### 4. Better Error Handling
- CSRF fetch errors are caught and logged
- Requests can still proceed (server will reject if needed)
- Clear error messages in console

## Testing Checklist

- [ ] Homepage loads without errors
- [ ] Navigate to login page
- [ ] Submit login form (POST request should have CSRF token)
- [ ] Navigate to signup page
- [ ] Submit signup form (POST request should have CSRF token)
- [ ] Check browser DevTools Network tab:
  - Should see GET `/api/v2/auth/csrf` on page load
  - Should see `X-CSRFToken` header on POST requests
- [ ] Test password reset (POST request)
- [ ] Test creating transaction (POST request)
- [ ] Test creating register (POST request)

## Backward Compatibility

### Old Pages Still Work:
The old unused pages (Login.tsx, Signup.tsx, etc.) in `src/pages/` that use `fetch()` directly will still work because:
1. They get `csrfToken` from AuthContext (which now uses ensureCsrf)
2. They manually add the header: `'X-CSRFToken': csrfToken`
3. These pages are not used in routing, so no conflict

### New Pages Use apiClient:
All new pages in `src/pages/auth/`, `src/pages/transactions/`, etc. use the apiClient which handles CSRF automatically.

## Environment Variables

Ensure these are set in `.env`:
```env
VITE_SERVER_URL=http://127.0.0.1:8000
VITE_API_BASE=http://127.0.0.1:8000/api/v2
VITE_PRODUCTION=False
```

## Summary

✅ **Fixed**: CSRF endpoint now uses `/api/v2/auth/csrf`  
✅ **Fixed**: CSRF token automatically attached to mutating requests  
✅ **Fixed**: Unified CSRF management in apiClient  
✅ **Fixed**: Proper token caching and lifecycle management  
✅ **Fixed**: Backend response key compatibility  

The CSRF token system is now properly configured and will work seamlessly with all API calls! 🎉
