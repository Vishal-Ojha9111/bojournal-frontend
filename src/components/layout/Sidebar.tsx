// FILE: src/components/layout/Sidebar.tsx
// PURPOSE: Responsive sidebar navigation for dashboard
// API: N/A (navigation only)

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCurrentUser, useLogout } from '../../features/auth/hooks';
import { Avatar, Button } from '../ui';
import ThemeToggle from '../ui/ThemeToggle';

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Sidebar Component
 * - Responsive: visible on lg+, off-canvas on mobile/tablet
 * - Navigation links with active states
 * - User profile section at bottom
 * - Logout button
 */
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useCurrentUser();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/app/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/app/transactions', label: 'Transactions', icon: '💰' },
    { to: '/app/registers', label: 'Registers', icon: '📁' },
    { to: '/app/journal', label: 'Journal', icon: '📖' },
    { to: '/app/holidays', label: 'Holidays', icon: '🗓️' },
    { to: '/app/subscription', label: 'Subscription', icon: '💎' },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[var(--z-modal-backdrop)] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 
          bg-[var(--surface)] border-r border-[var(--border)]
          transform transition-transform duration-300 ease-in-out
          z-[var(--z-modal)] lg:z-auto
          flex flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `.trim().replace(/\s+/g, ' ')}
      >
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--brand-500)]">
            BO Journal
          </h2>
          {/* Close button - mobile only */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
            aria-label="Close sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-[var(--brand-500)] text-white'
                        : 'text-[var(--text)] hover:bg-[var(--surface-hover)]'
                    }
                  `.trim().replace(/\s+/g, ' ')}
                >
                  <span className="text-xl" aria-hidden="true">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-[var(--border)] space-y-3">
          {/* Theme Toggle */}
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-[var(--text)]">Theme</span>
            <ThemeToggle />
          </div>
          
          {/* Clickable User Profile */}
          <div 
            onClick={() => {
              navigate('/app/profile');
              onClose();
            }}
            className="flex items-center gap-3 mb-3 p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <Avatar
              src={user?.profile_picture || undefined}
              name={`${user?.first_name} ${user?.last_name}`}
              size="md"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text)] truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-[var(--muted)] truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={handleLogout}
            loading={logoutMutation.isPending}
          >
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
