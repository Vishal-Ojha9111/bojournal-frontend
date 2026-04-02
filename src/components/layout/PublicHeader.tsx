// FILE: src/components/layout/PublicHeader.tsx
// PURPOSE: Reusable header for public pages (homepage, auth pages)
// API: N/A

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuthCheck } from '../../features/auth/hooks';

export const PublicHeader: React.FC = () => {
  // Use useAuthCheck to properly check authentication status
  const { data: authData } = useAuthCheck();
  const isAuthenticated = !!authData?.user;

  return (
    <header className="border-b border-[var(--border)] sticky top-0 bg-[var(--bg)]/95 backdrop-blur-sm z-[var(--z-sticky)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-[var(--brand-500)] flex items-center gap-2">
          <img rel="icon" src="/bj+.svg" alt='BO Journal Plus' className='w-12 h-12' />
            BO Journal+
          </Link>

          {/* Nav Links - Hidden on mobile, shown on md+ */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/#features" className="text-[var(--text)] hover:text-[var(--brand-500)] transition-colors">
              Features
            </Link>
            <Link to="/plans" className="text-[var(--text)] hover:text-[var(--brand-500)] transition-colors">
              Pricing
            </Link>
            <Link to="/#faq" className="text-[var(--text)] hover:text-[var(--brand-500)] transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Auth Actions & Theme Toggle */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              // Show Dashboard button if user is authenticated
              <Link to="/app/dashboard">
                <Button variant="primary" size="sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              // Show Login/Signup if not authenticated
              <>
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/auth/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
