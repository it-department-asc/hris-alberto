'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Get current display name from user data
  const currentDisplayName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'User';

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu && !(event.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (showNotifications && !(event.target as Element).closest('.notifications-container')) {
        setShowNotifications(false);
      }
    };

    if (showUserMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu, showNotifications]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur-md">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search anything..."
              className="h-10 w-80 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative notifications-container">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className="relative rounded-xl p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Notifications
                </h3>
                <div className="space-y-3">
                  <div className="rounded-lg bg-blue-50 p-3">
                    <p className="text-sm font-medium text-slate-900">
                      Leave request pending
                    </p>
                    <p className="text-xs text-slate-500">2 minutes ago</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="text-sm font-medium text-slate-900">
                      Payroll processed
                    </p>
                    <p className="text-xs text-slate-500">1 hour ago</p>
                  </div>
                </div>
                <button className="mt-3 w-full text-center text-sm font-medium text-blue-600 hover:text-blue-700">
                  View all notifications
                </button>
              </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative user-menu-container">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
              {currentDisplayName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-slate-900">
                {currentDisplayName}
              </p>
              <p className="text-xs capitalize text-slate-500">{user?.role}</p>
            </div>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 md:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                <div className="border-b border-slate-100 px-4 pb-3 pt-2">
                  <p className="text-sm font-medium text-slate-900">
                    {currentDisplayName}
                  </p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <div className="py-2">
                  <a
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </a>
                  <a
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </a>
                </div>
                <div className="border-t border-slate-100 pt-2">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
          )}
        </div>
      </div>
    </header>
  );
}
