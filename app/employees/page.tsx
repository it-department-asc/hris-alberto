'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout';
import {
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  ChevronRight,
} from 'lucide-react';

function EmployeesContent() {
  const employees = [
    {
      id: 1,
      name: 'Juan Dela Cruz',
      email: 'juan.delacruz@company.com',
      department: 'Engineering',
      position: 'Senior Developer',
      status: 'Active',
      avatar: 'JD',
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria.santos@company.com',
      department: 'Human Resources',
      position: 'HR Manager',
      status: 'Active',
      avatar: 'MS',
    },
    {
      id: 3,
      name: 'Pedro Garcia',
      email: 'pedro.garcia@company.com',
      department: 'Finance',
      position: 'Accountant',
      status: 'On Leave',
      avatar: 'PG',
    },
    {
      id: 4,
      name: 'Ana Reyes',
      email: 'ana.reyes@company.com',
      department: 'Marketing',
      position: 'Marketing Specialist',
      status: 'Active',
      avatar: 'AR',
    },
    {
      id: 5,
      name: 'Carlos Mendoza',
      email: 'carlos.mendoza@company.com',
      department: 'Operations',
      position: 'Operations Manager',
      status: 'Active',
      avatar: 'CM',
    },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="mt-1 text-slate-500">Manage your organization&apos;s workforce</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl">
          <Plus className="h-5 w-5" />
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search employees..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-50">
          <Filter className="h-5 w-5" />
          Filters
        </button>
      </div>

      {/* Employee List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Position
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
              {employees.map((employee) => (
                <tr key={employee.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                        {employee.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{employee.name}</p>
                        <p className="text-sm text-slate-500">{employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{employee.department}</td>
                  <td className="px-6 py-4 text-slate-600">{employee.position}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        employee.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                      <MoreVertical className="h-5 w-5" />
                    </button>
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

export default function EmployeesPage() {
  return (
    <AuthGuard allowedRoles={['admin', 'hr']}>
      <EmployeesContent />
    </AuthGuard>
  );
}
