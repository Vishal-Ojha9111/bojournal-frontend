# BO Journal Frontend

Modern, accessible, and responsive frontend for BO Journal built with React, TypeScript, Vite, and TailwindCSS.

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **React Router** for navigation
- **TanStack React Query** for server state management
- **React Hook Form** + **Zod** for form validation
- **Axios** for API requests
- **React Hot Toast** for notifications

## Project Structure

```
src/
├── components/
│   └── ui/                    # Reusable UI primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       ├── Avatar.tsx
│       ├── Skeleton.tsx
│       ├── FileUploader.tsx
│       └── index.ts
├── features/                  # Feature-based modules
│   ├── auth/
│   │   ├── api.ts            # Auth API functions
│   │   ├── hooks.ts          # Auth React Query hooks
│   │   └── schemas.ts        # Zod validation schemas
│   ├── transactions/
│   ├── registers/
│   ├── journal/
│   └── payment/
├── pages/                     # Page components
│   ├── HomePage.tsx
│   ├── auth/
│   │   ├── SignupPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── ResetPasswordPage.tsx
│   └── dashboard/
├── lib/                       # Core utilities
│   ├── apiClient.ts          # Axios instance with interceptors
│   └── queries.ts            # React Query configuration
├── styles/
│   └── vars.css              # Design system variables
├── App.tsx                    # Main app with routing
└── main.tsx                   # Entry point
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running (see backend/README.md)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

4. Update `.env` with your API base URL:

```env
VITE_API_BASE=http://localhost:8000/api/v2
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Testing

Run tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

## Features

### Design System

- **Colors**: Brand colors, semantic colors, dark mode support
- **Typography**: Inter font with defined scales
- **Spacing**: 4px base unit system
- **Components**: Fully accessible UI primitives
- **Responsive**: Mobile-first with defined breakpoints

### Authentication

- Cookie-based JWT authentication
- Automatic token refresh
- OTP verification for signup and password reset
- Protected routes

### API Integration

- Centralized API client with axios
- Automatic retry and error handling
- Request/response interceptors
- CSRF token support (if needed)

### File Uploads

- Presigned URL support for S3
- Progress tracking
- Error handling with cleanup
- Multi-file upload support

### Forms

- React Hook Form for performance
- Zod for runtime validation
- Accessible error messages
- Consistent styling

### State Management

- React Query for server state
- Automatic caching and refetching
- Optimistic updates
- Query key management

## API Endpoints

All API endpoints are under `/api/v2/`:

### Auth
- `POST /auth/signup` - Sign up
- `POST /auth/verify` - Verify OTP
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/check` - Check auth status
- `POST /auth/refresh` - Refresh token
- `POST /auth/resetpassword` - Request password reset
- `POST /auth/updatepassword` - Update password

### User
- `PATCH /user/update` - Update profile
- `GET /user/profile-picture-url` - Get profile picture upload URL

### Transactions
- `GET /transactions` - List transactions
- `POST /transactions` - Create transaction
- `PUT /transactions/{id}` - Update transaction
- `DELETE /transactions/{id}` - Delete transaction
- `POST /transactions/presigned-url` - Get upload URL

### Registers
- `GET /registers` - List registers
- `POST /registers` - Create register
- `PUT /registers/{id}` - Update register
- `DELETE /registers/{id}` - Delete register

### Journal
- `GET /journal` - List journal entries
- `POST /journal/create-first-entry` - Create first entry
- `PATCH /journal/update-opening-balance` - Update opening balance

### Holidays
- `GET /holiday` - List holidays
- `POST /holiday` - Mark holiday
- `DELETE /holiday` - Remove holiday

### Payment
- `GET /payment/plans` - List plans
- `POST /payment/create-order` - Create order
- `POST /payment/verify` - Verify payment
- `GET /payment/history` - Payment history
- `GET /payment/status` - Subscription status

## Development Guidelines

### Component Structure

Each component file should start with:

```tsx
// FILE: src/components/...
// PURPOSE: Brief description
// API: List of API endpoints used (if any)
```

### Page Structure

Each page should include a `PageStructure` comment describing:
- DOM/component tree
- APIs used
- Responsive behavior notes

### TODO Markers

Use `/* TODO-DESIGN */` for places where designer input is needed.

### Responsive Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Accessibility

- All interactive elements are keyboard accessible
- ARIA labels and roles are used appropriately
- Focus management in modals
- Error messages are announced to screen readers
- Color contrast meets WCAG AA standards

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

## License

[Your License Here]

## Support

For issues or questions, please contact [support email].
