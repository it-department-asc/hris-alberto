'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout';
import {
  Clock,
  UserCheck,
  UserX,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

function AttendanceContent() {
  const stats = [
    { label: 'Present', value: '1,180', icon: UserCheck, color: 'emerald' },
    { label: 'Absent', value: '24', icon: UserX, color: 'rose' },
    { label: 'Late', value: '18', icon: AlertCircle, color: 'amber' },
    { label: 'On Leave', value: '12', icon: Calendar, color: 'blue' },
  ];

  const attendanceLog = [
    { name: 'Juan Dela Cruz', timeIn: '08:02 AM', timeOut: '05:30 PM', status: 'Present', hours: '9.5' },
    { name: 'Maria Santos', timeIn: '08:15 AM', timeOut: '05:00 PM', status: 'Late', hours: '8.75' },
    { name: 'Pedro Garcia', timeIn: '--:--', timeOut: '--:--', status: 'On Leave', hours: '0' },
    { name: 'Ana Reyes', timeIn: '07:55 AM', timeOut: '06:00 PM', status: 'Present', hours: '10.08' },
    { name: 'Carlos Mendoza', timeIn: '08:00 AM', timeOut: '--:--', status: 'Present', hours: '--' },
  ];

  const colorClasses: Record<string, { bg: string; text: string; iconBg: string }> = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', iconBg: 'bg-rose-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100' },
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-100' },
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance</h1>
          <p className="mt-1 text-slate-500">Track employee time and attendance</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="px-3 font-medium text-slate-900">January 7, 2026</span>
          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colors = colorClasses[stat.color];
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`rounded-xl p-3 ${colors.iconBg}`}>
                  <Icon className={`h-6 w-6 ${colors.text}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance Log */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Today&apos;s Attendance Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Time In
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Time Out
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Hours
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendanceLog.map((log, idx) => (
                <tr key={idx} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                        {log.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-slate-900">{log.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{log.timeIn}</td>
                  <td className="px-6 py-4 text-slate-600">{log.timeOut}</td>
                  <td className="px-6 py-4 text-slate-600">{log.hours}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        log.status === 'Present'
                          ? 'bg-emerald-100 text-emerald-700'
                          : log.status === 'Late'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function AttendancePage() {
  return (
    <AuthGuard allowedRoles={['admin', 'hr', 'manager']}>
      <AttendanceContent />
    </AuthGuard>
  );
}
