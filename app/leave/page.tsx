'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout';
import { CalendarPlus, Plus, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';

function LeaveContent() {
  const leaveBalance = [
    { type: 'Vacation Leave', used: 5, total: 15, color: 'blue' },
    { type: 'Sick Leave', used: 2, total: 10, color: 'emerald' },
    { type: 'Emergency Leave', used: 0, total: 3, color: 'amber' },
  ];

  const leaveRequests = [
    {
      id: 1,
      employee: 'Juan Dela Cruz',
      type: 'Vacation Leave',
      startDate: 'Jan 15, 2026',
      endDate: 'Jan 17, 2026',
      days: 3,
      status: 'Pending',
      reason: 'Family vacation',
    },
    {
      id: 2,
      employee: 'Maria Santos',
      type: 'Sick Leave',
      startDate: 'Jan 10, 2026',
      endDate: 'Jan 10, 2026',
      days: 1,
      status: 'Approved',
      reason: 'Medical checkup',
    },
    {
      id: 3,
      employee: 'Pedro Garcia',
      type: 'Emergency Leave',
      startDate: 'Jan 8, 2026',
      endDate: 'Jan 9, 2026',
      days: 2,
      status: 'Approved',
      reason: 'Family emergency',
    },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="mt-1 text-slate-500">Manage leave requests and balances</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl">
          <Plus className="h-5 w-5" />
          File Leave
        </button>
      </div>

      {/* Leave Balance */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        {leaveBalance.map((leave) => {
          const remaining = leave.total - leave.used;
          const percentage = (leave.used / leave.total) * 100;
          return (
            <div
              key={leave.type}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-slate-900">{leave.type}</h3>
                <Calendar className="h-5 w-5 text-slate-400" />
              </div>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-bold text-slate-900">{remaining}</span>
                <span className="text-slate-500 mb-1">/ {leave.total} days</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    leave.color === 'blue'
                      ? 'bg-blue-500'
                      : leave.color === 'emerald'
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-slate-500">{leave.used} days used</p>
            </div>
          );
        })}
      </div>

      {/* Leave Requests */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Leave Requests</h2>
          <div className="flex gap-2">
            {['All', 'Pending', 'Approved', 'Rejected'].map((filter) => (
              <button
                key={filter}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  filter === 'All'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Duration
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Reason
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaveRequests.map((request) => (
                <tr key={request.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
                        {request.employee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium text-slate-900">{request.employee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{request.type}</td>
                  <td className="px-6 py-4">
                    <p className="text-slate-900">{request.startDate} - {request.endDate}</p>
                    <p className="text-sm text-slate-500">{request.days} day(s)</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{request.reason}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        request.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : request.status === 'Pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {request.status === 'Approved' && <CheckCircle2 className="h-3 w-3" />}
                      {request.status === 'Pending' && <Clock className="h-3 w-3" />}
                      {request.status === 'Rejected' && <XCircle className="h-3 w-3" />}
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {request.status === 'Pending' && (
                      <div className="flex justify-end gap-2">
                        <button className="rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200">
                          Approve
                        </button>
                        <button className="rounded-lg bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-200">
                          Reject
                        </button>
                      </div>
                    )}
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

export default function LeavePage() {
  return (
    <AuthGuard>
      <LeaveContent />
    </AuthGuard>
  );
}
