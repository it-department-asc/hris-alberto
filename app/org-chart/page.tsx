'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout';
import { Network, Building2, Users, ChevronRight, Loader2, User, Crown } from 'lucide-react';
import { getDepartments } from '@/lib/firebase/departments';
import { Department } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

interface DepartmentNode extends Department {
  children?: DepartmentNode[];
  level: number;
}

function OrganizationChartContent() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<DepartmentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);

      const departmentsData = await getDepartments();

      // Build hierarchical structure
      const departmentMap = new Map<string, DepartmentNode>();
      const rootDepartments: DepartmentNode[] = [];

      // First pass: create all department nodes
      departmentsData.forEach(dept => {
        departmentMap.set(dept.id, {
          ...dept,
          children: [],
          level: 0
        });
      });

      // Second pass: build hierarchy
      departmentsData.forEach(dept => {
        const node = departmentMap.get(dept.id)!;

        if (dept.parentDepartmentId) {
          const parent = departmentMap.get(dept.parentDepartmentId);
          if (parent) {
            parent.children!.push(node);
            node.level = parent.level + 1;
          } else {
            // Parent not found, treat as root
            rootDepartments.push(node);
          }
        } else {
          rootDepartments.push(node);
        }
      });

      setDepartments(rootDepartments);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to load organization chart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderDepartmentNode = (department: DepartmentNode, isLast: boolean = false): React.ReactElement => {
    const hasChildren = department.children && department.children.length > 0;

    return (
      <div key={department.id} className="relative">
        {/* Department Card */}
        <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex-shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <Building2 className="h-6 w-6" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 truncate">
              {department.name}
            </h3>
            <p className="text-sm text-slate-500 truncate">
              {department.description || 'Department'}
            </p>
          </div>

          {department.managerId && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Crown className="h-4 w-4 text-amber-500" />
              <span>Manager</span>
            </div>
          )}
        </div>

        {/* Children */}
        {hasChildren && (
          <div className="mt-6 ml-8 relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-slate-200" />

            {/* Horizontal lines to children */}
            {department.children!.map((child, index) => (
              <div key={child.id} className="relative">
                <div className="absolute left-6 top-8 w-6 h-px bg-slate-200" />
                <div className="ml-12">
                  {renderDepartmentNode(child, index === department.children!.length - 1)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          <span className="ml-2 text-slate-500">Loading organization chart...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <Network className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Error Loading Chart</h3>
          <p className="text-slate-500 mb-4">{error}</p>
          <button
            onClick={fetchDepartments}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 font-medium text-white shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all"
          >
            Try Again
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Organization Chart</h1>
        <p className="mt-1 text-slate-500">View your company's organizational structure</p>
      </div>

      {/* Chart Container */}
      <div className="bg-slate-50 rounded-2xl p-8">
        {departments.length === 0 ? (
          <div className="text-center py-12">
            <Network className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Departments Found</h3>
            <p className="text-slate-500">The organization structure is being set up.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {departments.map((department, index) => (
              <div key={department.id}>
                {renderDepartmentNode(department)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="text-sm text-slate-600">Department</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-slate-600">Manager</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function OrganizationChartPage() {
  return (
    <AuthGuard>
      <OrganizationChartContent />
    </AuthGuard>
  );
}