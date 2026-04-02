// FILE: src/components/layout/DashboardHeader.tsx
// PURPOSE: Dashboard header with hamburger menu and profile button
// API: N/A (UI only)

import React from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser } from '../../features/auth/hooks';
import { Avatar } from '../ui';

export interface DashboardHeaderProps {
  onMenuClick: () => void;
}

/**
 * DashboardHeader Component
 * - Left: Hamburger menu (mobile/tablet) + Logo
 * - Right: Profile Avatar
 * 
 * Responsive behavior:
 * - Mobile: Hamburger + Logo (left), Profile (right)
 * - Desktop: Logo (left, hamburger hidden), Profile (right)
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick }) => {
  const { user } = useCurrentUser();

  return (
    <header className="sticky top-0 z-[var(--z-sticky)] bg-[var(--bg)] border-b border-[var(--border)] backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Hamburger (mobile/tablet) + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6 text-[var(--text)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <Link to="/" className="text-xl font-bold text-[var(--brand-500)] hover:opacity-80 transition-opacity flex items-center gap-2">
              <img rel="icon" src="/bj+.svg" className='w-12 h-12' />
              BO Journal+
            </Link>
          </div>

          {/* Right: Profile Avatar */}
          <div className="flex items-center gap-3">
            {/* Profile Avatar */}
            <button
              className="relative"
              aria-label="User menu"
            >
              <Avatar
                src={user?.profile_picture || undefined}
                name={`${user?.first_name} ${user?.last_name}`}
                size="sm"
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
