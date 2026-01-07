'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout';
import { Network, Building2, Users, Briefcase, ChevronRight } from 'lucide-react';

function OrganizationContent() {
  const departments = [
    { name: 'Engineering', employees: 45, head: 'John Smith', color: 'blue' },
    { name: 'Human Resources', employees: 12, head: 'Maria Santos', color: 'emerald' },
    { name: 'Finance', employees: 18, head: 'Pedro Garcia', color: 'violet' },
    { name: 'Marketing', employees: 25, head: 'Ana Reyes', color: 'amber' },
    { name: 'Operations', employees: 38, head: 'Carlos Mendoza', color: 'rose' },
    { name: 'Sales', employees: 52, head: 'Lisa Cruz', color: 'cyan' },
  ];

  const colorClasses: Record<string, { bg: string; border: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-600' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', icon: 'text-cyan-600' },
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Organization</h1>
        <p className="mt-1 text-slate-500">View and manage your company structure</p>
      </div>

      {/* Company Overview */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Departments</p>
              <p className="text-2xl font-bold text-slate-900">6</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-100 p-3">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Employees</p>
              <p className="text-2xl font-bold text-slate-900">190</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-violet-100 p-3">
              <Briefcase className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Positions</p>
              <p className="text-2xl font-bold text-slate-900">42</p>
            </div>
          </div>
        </div>
      </div>

      {/* Departments */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">Departments</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => {
            const colors = colorClasses[dept.color];
            return (
              <div
                key={dept.name}
                className={`rounded-xl border ${colors.border} ${colors.bg} p-5 transition-all hover:shadow-md cursor-pointer`}
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <Network className={`h-5 w-5 ${colors.icon}`} />
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400" />
                </div>
                <h3 className="mt-4 font-semibold text-slate-900">{dept.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{dept.employees} employees</p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-white text-xs font-bold flex items-center justify-center text-slate-600 shadow-sm">
                    {dept.head.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span className="text-xs text-slate-600">{dept.head}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function OrganizationPage() {
  return (
    <AuthGuard>
      <OrganizationContent />
    </AuthGuard>
  );
}
