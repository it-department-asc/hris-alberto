'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout';
import { Network, Building2, Users, Briefcase, ChevronRight, Loader2, UserX, RefreshCw } from 'lucide-react';
import { getDepartments, getDepartmentStats } from '@/lib/firebase/departments';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Department } from '@/types';

interface DepartmentWithStats extends Department {
  employeeCount: number;
  managerName: string | null;
}

function OrganizationContent() {
  const [departments, setDepartments] = useState<DepartmentWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [unassignedEmployees, setUnassignedEmployees] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);

      const departmentsData = await getDepartments();

      // Fetch stats for each department
      const departmentsWithStats = await Promise.all(
        departmentsData.map(async (dept) => {
          const stats = await getDepartmentStats(dept.id, dept.managerId);
          return {
            ...dept,
            employeeCount: stats.employeeCount,
            managerName: stats.managerName,
          };
        })
      );

      setDepartments(departmentsWithStats);

      // Get total employee count (all active users)
      const usersRef = collection(db, 'users');
      const allUsersQuery = query(usersRef, where('isActive', '==', true));
      const allUsersSnapshot = await getDocs(allUsersQuery);
      const totalCount = allUsersSnapshot.size;
      setTotalEmployees(totalCount);

      // Calculate unassigned employees (users without departmentId)
      const assignedCount = departmentsWithStats.reduce((sum, dept) => sum + dept.employeeCount, 0);
      setUnassignedEmployees(totalCount - assignedCount);

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load departments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const assignedEmployees = departments.reduce((sum, dept) => sum + dept.employeeCount, 0);
  const totalPositions = departments.length; // This could be enhanced to count actual positions

  const colorClasses: Record<string, { bg: string; border: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-600' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600' },
    rose: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-600' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', icon: 'text-cyan-600' },
  };

  const getDepartmentColor = (index: number): string => {
    const colors = Object.keys(colorClasses);
    return colors[index % colors.length];
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Organization</h1>
            <p className="mt-1 text-slate-500">View and manage your company structure</p>
            {lastUpdated && (
              <p className="mt-1 text-xs text-slate-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            onClick={fetchDepartments}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Company Overview */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-100 p-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Departments</p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : departments.length}
              </p>
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
              <p className="text-2xl font-bold text-slate-900">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalEmployees}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-violet-100 p-3">
              <Briefcase className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Assigned</p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : assignedEmployees}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-amber-100 p-3">
              <UserX className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Unassigned</p>
              <p className="text-2xl font-bold text-slate-900">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : unassignedEmployees}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Departments */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Departments</h2>
          {error && (
            <button
              onClick={fetchDepartments}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Retry
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            <span className="ml-2 text-slate-500">Loading departments...</span>
          </div>
        ) : departments.length === 0 ? (
          <div className="text-center py-12">
            <Network className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No departments found</h3>
            <p className="text-slate-500">Departments will appear here once they are added to the system.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept, index) => {
              const colorKey = getDepartmentColor(index);
              const colors = colorClasses[colorKey];
              return (
                <div
                  key={dept.id}
                  className={`rounded-xl border ${colors.border} ${colors.bg} p-5 transition-all hover:shadow-md cursor-pointer`}
                >
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <Network className={`h-5 w-5 ${colors.icon}`} />
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{dept.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {dept.employeeCount} {dept.employeeCount === 1 ? 'employee' : 'employees'}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    {dept.managerName ? (
                      <>
                        <div className="h-6 w-6 rounded-full bg-white text-xs font-bold flex items-center justify-center text-slate-600 shadow-sm">
                          {dept.managerName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs text-slate-600">{dept.managerName}</span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No manager assigned</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
