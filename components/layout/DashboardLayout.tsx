'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initialize and reset sidebar state when user changes
  useEffect(() => {
    if (user?.uid && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`sidebarCollapsed_${user.uid}`);
      setSidebarCollapsed(saved ? JSON.parse(saved) : false);
    } else {
      setSidebarCollapsed(false); // Default to expanded when no user
    }
  }, [user?.uid]);

  // Save sidebar collapsed state to localStorage whenever it changes (user-specific)
  useEffect(() => {
    if (user?.uid && typeof window !== 'undefined') {
      localStorage.setItem(`sidebarCollapsed_${user.uid}`, JSON.stringify(sidebarCollapsed));
    }
  }, [sidebarCollapsed, user?.uid]);

  const handleToggleCollapse = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300 ease-out ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggleCollapse={handleToggleCollapse}
          onMobileClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ease-out ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
