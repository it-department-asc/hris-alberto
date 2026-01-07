'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout';
import {
  Newspaper,
  DollarSign,
  Users,
  Calendar,
  Download,
  ChevronRight,
  Lock,
  CheckCircle2,
} from 'lucide-react';

function PayrollContent() {
  const payrollPeriods = [
    {
      id: 1,
      period: 'January 1-15, 2026',
      employees: 1234,
      grossPay: '₱12,456,789.00',
      deductions: '₱2,456,789.00',
      netPay: '₱10,000,000.00',
      status: 'Processing',
    },
    {
      id: 2,
      period: 'December 16-31, 2025',
      employees: 1230,
      grossPay: '₱12,345,678.00',
      deductions: '₱2,345,678.00',
      netPay: '₱10,000,000.00',
      status: 'Completed',
    },
    {
      id: 3,
      period: 'December 1-15, 2025',
      employees: 1228,
      grossPay: '₱12,234,567.00',
      deductions: '₱2,234,567.00',
      netPay: '₱10,000,000.00',
      status: 'Locked',
    },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payroll</h1>
          <p className="mt-1 text-slate-500">Process and manage employee payroll</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl">
          <Newspaper className="h-5 w-5" />
          Run Payroll
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-100 p-3">
              <DollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Payroll (YTD)</p>
              <p className="text-2xl font-bold text-slate-900">₱120.5M</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Employees</p>
              <p className="text-2xl font-bold text-slate-900">1,234</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-violet-100 p-3">
              <Calendar className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Next Payday</p>
              <p className="text-2xl font-bold text-slate-900">Jan 15</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payroll Periods */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">Payroll Periods</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Period
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Employees
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Gross Pay
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Deductions
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Net Pay
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
              {payrollPeriods.map((period) => (
                <tr key={period.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{period.period}</td>
                  <td className="px-6 py-4 text-slate-600">{period.employees}</td>
                  <td className="px-6 py-4 text-slate-900 font-medium">{period.grossPay}</td>
                  <td className="px-6 py-4 text-rose-600">{period.deductions}</td>
                  <td className="px-6 py-4 text-emerald-600 font-semibold">{period.netPay}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                        period.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : period.status === 'Processing'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {period.status === 'Completed' && <CheckCircle2 className="h-3 w-3" />}
                      {period.status === 'Locked' && <Lock className="h-3 w-3" />}
                      {period.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <Download className="h-5 w-5" />
                      </button>
                      <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Government Contributions */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Government Contributions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { name: 'SSS', amount: '₱1,234,567.00' },
            { name: 'PhilHealth', amount: '₱567,890.00' },
            { name: 'Pag-IBIG', amount: '₱234,567.00' },
          ].map((contrib) => (
            <div key={contrib.name} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">{contrib.name}</p>
              <p className="text-lg font-bold text-slate-900">{contrib.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function PayrollPage() {
  return (
    <AuthGuard allowedRoles={['admin', 'payroll']}>
      <PayrollContent />
    </AuthGuard>
  );
}
