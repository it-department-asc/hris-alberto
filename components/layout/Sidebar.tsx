'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarPlus,
  Newspaper,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Building2,
  X,
} from 'lucide-react';
import { UserRole } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'hr', 'payroll', 'manager', 'employee'] },
  { href: '/employees', label: 'Employees', icon: Users, roles: ['admin', 'hr'] },
  { href: '/departments', label: 'Departments', icon: Building2, roles: ['admin', 'hr', 'payroll', 'manager'] },
  { href: '/org-chart', label: 'Org Chart', icon: GitBranch, roles: ['admin', 'hr', 'payroll', 'manager', 'employee'] },
  { href: '/attendance', label: 'Attendance', icon: Clock, roles: ['admin', 'hr', 'manager'] },
  { href: '/leave', label: 'Leave', icon: CalendarPlus, roles: ['admin', 'hr', 'payroll', 'manager', 'employee'] },
  { href: '/payroll', label: 'Payroll', icon: Newspaper, roles: ['admin', 'payroll'] },
  { href: '/policy-advisor', label: 'AI Policy Advisor', icon: BrainCircuit, roles: ['admin', 'hr', 'payroll', 'manager', 'employee'] },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed = false, onToggleCollapse, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside
      className={`h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex h-full flex-col relative">
        {/* Logo */}
        <div className={`flex h-16 items-center border-b border-slate-800/50 ${collapsed ? 'justify-center px-2' : 'px-4'}`}>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
              <Users className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">HRIS Central</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Menu</p>
          )}
          <ul className="space-y-1">
            {filteredNavItems.map((item, index) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;

              return (
                <li 
                  key={item.href}
                  className="animate-fadeIn"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Link
                    href={item.href}
                    onClick={onMobileClose}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                    } ${collapsed ? 'justify-center' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full animate-slideIn" />
                    )}
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 transition-all duration-200 ${
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-white group-hover:scale-110'
                      }`}
                    />
                    {!collapsed && (
                      <span className="transition-all duration-200 group-hover:translate-x-0.5">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Version/Brand Footer */}
        {!collapsed && (
          <div className="border-t border-slate-800/50 p-4">
            <div className="rounded-xl bg-slate-800/30 p-3">
              <p className="text-xs text-slate-500 text-center">
                HRIS Central v1.0
              </p>
            </div>
          </div>
        )}

        {/* Desktop Collapse Button */}
        <button
          onClick={() => onToggleCollapse?.(!collapsed)}
          className="absolute -right-3 top-20 hidden h-7 w-7 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 shadow-lg transition-all duration-200 hover:bg-slate-700 hover:text-white hover:scale-110 lg:flex"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onMobileClose}
          className="absolute right-3 top-3 lg:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/50 text-slate-400 transition-all duration-200 hover:bg-red-500/20 hover:text-red-400 hover:rotate-90 active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
