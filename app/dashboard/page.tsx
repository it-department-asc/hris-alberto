'use client';

import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout';
import {
  Users,
  UserCheck,
  CalendarOff,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  CalendarDays,
  FileText,
  AlertCircle,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Timer,
  Briefcase,
  Bell,
  Download,
} from 'lucide-react';
import { UserRole } from '@/types';

// ===========================================
// ADMIN / HR / MANAGER DASHBOARD
// ===========================================
function AdminDashboard({ userName }: { userName: string }) {
  const stats = [
    {
      label: 'Total Employees',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Present Today',
      value: '1,180',
      change: '+5%',
      trend: 'up',
      icon: UserCheck,
      color: 'emerald',
    },
    {
      label: 'On Leave',
      value: '54',
      change: '-8%',
      trend: 'down',
      icon: CalendarOff,
      color: 'amber',
    },
    {
      label: 'Pending Requests',
      value: '23',
      change: '+3',
      trend: 'up',
      icon: Clock,
      color: 'violet',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'leave',
      title: 'Leave Request Submitted',
      description: 'Juan Dela Cruz requested 3 days vacation leave',
      time: '2 minutes ago',
      icon: CalendarDays,
    },
    {
      id: 2,
      type: 'document',
      title: 'Document Uploaded',
      description: 'Maria Santos uploaded employment contract',
      time: '15 minutes ago',
      icon: FileText,
    },
    {
      id: 3,
      type: 'alert',
      title: 'Attendance Alert',
      description: '5 employees late check-in today',
      time: '1 hour ago',
      icon: AlertCircle,
    },
    {
      id: 4,
      type: 'leave',
      title: 'Leave Approved',
      description: 'Pedro Garcia\'s sick leave approved',
      time: '2 hours ago',
      icon: CalendarDays,
    },
  ];

  const pendingApprovals = [
    {
      id: 1,
      employee: 'Ana Reyes',
      type: 'Vacation Leave',
      dates: 'Jan 15-17, 2026',
      avatar: 'AR',
    },
    {
      id: 2,
      employee: 'Carlos Mendoza',
      type: 'Overtime Request',
      dates: 'Jan 10, 2026',
      avatar: 'CM',
    },
    {
      id: 3,
      employee: 'Lisa Cruz',
      type: 'WFH Request',
      dates: 'Jan 12, 2026',
      avatar: 'LC',
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', iconBg: 'bg-violet-100' },
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {userName}! 👋
        </h1>
        <p className="mt-1 text-slate-500">
          Here&apos;s what&apos;s happening with your team today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colors = colorClasses[stat.color];
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${colors.iconBg}`}>
                  <Icon className={`h-6 w-6 ${colors.text}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                )}
                <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {stat.change}
                </span>
                <span className="text-sm text-slate-400">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
            <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
              View all
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100"
                >
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <Icon className="h-5 w-5 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{activity.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{activity.description}</p>
                  </div>
                  <span className="text-xs text-slate-400">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Pending Approvals</h2>
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
              {pendingApprovals.length} pending
            </span>
          </div>
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div key={approval.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                    {approval.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{approval.employee}</p>
                    <p className="text-sm text-slate-500">{approval.type}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{approval.dates}</span>
                  <div className="flex gap-2">
                    <button className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-200">
                      Approve
                    </button>
                    <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
            View All Requests
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm">
        <h2 className="text-lg font-semibold">Quick Actions</h2>
        <p className="mt-1 text-blue-100">Common tasks you can perform</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {['Add Employee', 'Process Payroll', 'View Reports', 'Manage Leaves', 'Time Corrections'].map((action) => (
            <button
              key={action}
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ===========================================
// EMPLOYEE DASHBOARD
// ===========================================
function EmployeeDashboard({ userName }: { userName: string }) {
  // Employee's personal data
  const todayAttendance = {
    timeIn: '08:02 AM',
    timeOut: '--:--',
    status: 'Present',
    hoursWorked: '4h 32m',
  };

  const leaveBalance = [
    { type: 'Vacation Leave', used: 5, total: 15, color: 'blue' },
    { type: 'Sick Leave', used: 2, total: 10, color: 'emerald' },
    { type: 'Emergency Leave', used: 0, total: 3, color: 'amber' },
  ];

  const myLeaveRequests = [
    { id: 1, type: 'Vacation Leave', dates: 'Jan 20-22, 2026', status: 'Pending', days: 3 },
    { id: 2, type: 'Sick Leave', dates: 'Dec 15, 2025', status: 'Approved', days: 1 },
  ];

  const recentPayslips = [
    { period: 'Dec 16-31, 2025', netPay: '₱25,450.00', status: 'Paid' },
    { period: 'Dec 1-15, 2025', netPay: '₱25,450.00', status: 'Paid' },
    { period: 'Nov 16-30, 2025', netPay: '₱24,890.00', status: 'Paid' },
  ];

  const announcements = [
    { id: 1, title: 'Holiday Schedule 2026', date: 'Jan 5, 2026', isNew: true },
    { id: 2, title: 'Annual Performance Review', date: 'Jan 3, 2026', isNew: true },
    { id: 3, title: 'New Health Insurance Benefits', date: 'Dec 28, 2025', isNew: false },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Good morning, {userName}! ☀️
        </h1>
        <p className="mt-1 text-slate-500">
          Here&apos;s your personal dashboard for today.
        </p>
      </div>

      {/* Time In/Out Card */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-blue-100">Today, January 7, 2026</p>
            <h2 className="mt-1 text-xl font-semibold">Time & Attendance</h2>
          </div>
          <div className="flex gap-3">
            <button className="rounded-xl bg-white px-6 py-3 font-medium text-blue-600 shadow-lg transition-all hover:shadow-xl">
              <Timer className="inline-block h-5 w-5 mr-2" />
              Time In
            </button>
            <button className="rounded-xl bg-white/10 px-6 py-3 font-medium backdrop-blur-sm transition-colors hover:bg-white/20">
              <Timer className="inline-block h-5 w-5 mr-2" />
              Time Out
            </button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-blue-100">Time In</p>
            <p className="mt-1 text-2xl font-bold">{todayAttendance.timeIn}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-blue-100">Time Out</p>
            <p className="mt-1 text-2xl font-bold">{todayAttendance.timeOut}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-blue-100">Hours Worked</p>
            <p className="mt-1 text-2xl font-bold">{todayAttendance.hoursWorked}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-blue-100">Status</p>
            <p className="mt-1 text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              {todayAttendance.status}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Leave Balance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Leave Balance</h2>
              <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                File Leave
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {leaveBalance.map((leave) => {
                const remaining = leave.total - leave.used;
                const percentage = (leave.used / leave.total) * 100;
                return (
                  <div key={leave.type} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className={`h-5 w-5 ${
                        leave.color === 'blue' ? 'text-blue-500' :
                        leave.color === 'emerald' ? 'text-emerald-500' : 'text-amber-500'
                      }`} />
                      <span className="text-sm font-medium text-slate-700">{leave.type}</span>
                    </div>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-2xl font-bold text-slate-900">{remaining}</span>
                      <span className="text-slate-500 mb-0.5">/ {leave.total}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          leave.color === 'blue' ? 'bg-blue-500' :
                          leave.color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* My Leave Requests */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">My Leave Requests</h2>
            <div className="space-y-3">
              {myLeaveRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className={`rounded-lg p-2 ${
                      request.status === 'Approved' ? 'bg-emerald-100' :
                      request.status === 'Pending' ? 'bg-amber-100' : 'bg-rose-100'
                    }`}>
                      {request.status === 'Approved' ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : request.status === 'Pending' ? (
                        <Clock className="h-5 w-5 text-amber-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{request.type}</p>
                      <p className="text-sm text-slate-500">{request.dates} • {request.days} day(s)</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    request.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                    request.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {request.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payslips */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Recent Payslips</h2>
              <button className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700">
                View all
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentPayslips.map((payslip, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-emerald-100 p-2">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{payslip.period}</p>
                      <p className="text-sm text-emerald-600 font-semibold">{payslip.netPay}</p>
                    </div>
                  </div>
                  <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* My Info Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">My Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Department</p>
                  <p className="font-medium text-slate-900">Engineering</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-100 p-2">
                  <Users className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Position</p>
                  <p className="font-medium text-slate-900">Software Engineer</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date Hired</p>
                  <p className="font-medium text-slate-900">Jan 15, 2024</p>
                </div>
              </div>
            </div>
          </div>

          {/* Announcements */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Announcements</h2>
              <Bell className="h-5 w-5 text-slate-400" />
            </div>
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-slate-900 text-sm">{announcement.title}</p>
                    {announcement.isNew && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{announcement.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white">
            <h2 className="font-semibold">Quick Actions</h2>
            <div className="mt-4 space-y-2">
              {['File Leave', 'View Payslip', 'Update Profile', 'Request Certificate'].map((action) => (
                <button
                  key={action}
                  className="w-full rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-left backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ===========================================
// MAIN DASHBOARD CONTENT (Role Router)
// ===========================================
function DashboardContent() {
  const { user } = useAuth();
  const userName = user?.displayName?.split(' ')[0] || 'User';
  const userRole = user?.role as UserRole;

  // Admin, HR, Payroll, Manager see the management dashboard
  const isManagementRole = ['admin', 'hr', 'payroll', 'manager'].includes(userRole);

  return (
    <DashboardLayout>
      {isManagementRole ? (
        <AdminDashboard userName={userName} />
      ) : (
        <EmployeeDashboard userName={userName} />
      )}
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
