// FILE: src/layouts/DashboardLayout.tsx
// PURPOSE: Main dashboard layout with header, sidebar, and content area
// API: N/A (layout only)

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardHeader } from '../components/layout/DashboardHeader';
import { Sidebar } from '../components/layout/Sidebar';

/**
 * DashboardLayout
 * - Header at top (sticky)
 * - Sidebar on left (fixed on lg+, off-canvas on mobile)
 * - Main content area with Outlet for nested routes
 * 
 * Responsive:
 * - Mobile/Tablet: Hamburger menu, sidebar off-canvas
 * - Desktop: Sidebar always visible
 */
export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header */}
      <DashboardHeader onMenuClick={toggleSidebar} />

      {/* Layout Container */}
      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

        {/* Main Content */}
        <main className="flex-1 w-full lg:ml-64 transition-all duration-300">
          <div className="container mx-auto px-4 py-6 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
