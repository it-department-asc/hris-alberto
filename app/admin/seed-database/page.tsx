'use client';

import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout';
import { seedAllData } from '@/lib/firebase/seed-data';
import { Database, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { useState } from 'react';

function SeedDatabaseContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSeed = async (force: boolean = false) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await seedAllData(force);
      if (response.success) {
        setResult({
          success: true,
          message: force 
            ? 'Database re-seeded successfully! All collections have been reset.'
            : 'Database seeded successfully! Empty collections have been populated.',
        });
      } else {
        setResult({
          success: false,
          message: `Error seeding database: ${response.error}`,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const collections = [
    { name: 'departments', description: '16 departments (Admin, Accounting, IT, HR, etc.)' },
    { name: 'leaveTypes', description: '9 leave types (VL, SL, EL, ML, PL, etc.)' },
    { name: 'workSchedules', description: '5 work schedules (Day, Night, Retail, etc.)' },
    { name: 'holidays', description: '19 Philippine holidays for 2026' },
    { name: 'settings', description: 'System settings with government contribution rates' },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Database Setup</h1>
        <p className="mt-1 text-slate-500">Initialize Firestore collections with default data</p>
      </div>

      {/* Warning Card */}
      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-amber-800">Important</h3>
            <p className="mt-1 text-sm text-amber-700">
              This will create the initial data for your HRIS system. Make sure your Firebase 
              configuration is correct before proceeding. The &quot;Force Re-seed&quot; option will 
              overwrite existing data.
            </p>
          </div>
        </div>
      </div>

      {/* Collections to Seed */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Collections to Initialize</h2>
        <div className="space-y-3">
          {collections.map((col) => (
            <div
              key={col.name}
              className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
            >
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-slate-900">{col.name}</p>
                  <p className="text-sm text-slate-500">{col.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`mb-6 rounded-2xl border p-4 ${
            result.success
              ? 'border-emerald-200 bg-emerald-50'
              : 'border-rose-200 bg-rose-50'
          }`}
        >
          <div className="flex gap-3">
            {result.success ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5" />
            )}
            <p className={result.success ? 'text-emerald-800' : 'text-rose-800'}>
              {result.message}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={() => handleSeed(false)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Database className="h-5 w-5" />
          )}
          Seed Empty Collections
        </button>

        <button
          onClick={() => handleSeed(true)}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-6 py-3 font-medium text-rose-600 transition-colors hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
          Force Re-seed All
        </button>
      </div>

      {/* Additional Collections Info */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Other Collections (Created Automatically)</h2>
        <p className="text-sm text-slate-500 mb-4">
          These collections will be created as you use the system:
        </p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            'users',
            'employees',
            'positions',
            'attendance',
            'leaveBalances',
            'leaveRequests',
            'overtimeRequests',
            'payrollPeriods',
            'payrollRecords',
            'salaryHistory',
            'employeeDocuments',
            'announcements',
            'emergencyContacts',
            'auditLogs',
          ].map((col) => (
            <div
              key={col}
              className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600"
            >
              {col}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function SeedDatabasePage() {
  return (
    <AuthGuard allowedRoles={['admin', 'employee']}>
      <SeedDatabaseContent />
    </AuthGuard>
  );
}
