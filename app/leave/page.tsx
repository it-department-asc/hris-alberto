'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Calendar, Loader2, Plane, Thermometer, AlertTriangle, Cake, Heart } from 'lucide-react';
import { LeaveRequestForm, MyLeaveHistory, PendingApprovals } from './components';
import { SimpleLeaveRequest, LeaveTypeName, LEAVE_LIMITS } from '@/types';
import { subscribeToUserLeaveRequests } from '@/lib/firebase/leave-requests';
import { getAllLeaveBalances } from '@/lib/firebase/leave-utils';

const leaveTypeConfig: Record<LeaveTypeName, { label: string; color: string; icon: typeof Plane }> = {
  vacation: { label: 'Vacation Leave', color: 'blue', icon: Plane },
  sick: { label: 'Sick Leave', color: 'emerald', icon: Thermometer },
  emergency: { label: 'Emergency Leave', color: 'amber', icon: AlertTriangle },
  birthday: { label: 'Birthday Leave', color: 'pink', icon: Cake },
  bereavement: { label: 'Bereavement Leave', color: 'purple', icon: Heart },
};

function LeaveContent() {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<SimpleLeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Get display name for current user
  const userName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'User';

  // Subscribe to user's leave requests
  useEffect(() => {
    if (user?.uid) {
      setLoading(true);
      const unsubscribe = subscribeToUserLeaveRequests(user.uid, (requests) => {
        setLeaveRequests(requests);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user?.uid]);

  // Calculate leave balances
  const leaveBalances = getAllLeaveBalances(leaveRequests);

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <p className="mt-1 text-slate-500">File leave requests and manage approvals</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:from-blue-700 hover:to-indigo-700"
        >
          <Plus className="h-5 w-5" />
          File Leave
        </button>
      </div>

      {/* Leave Balance Cards */}
      {loading ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-16 mb-2" />
              <div className="h-2 bg-slate-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {(Object.keys(leaveTypeConfig) as LeaveTypeName[]).map((type) => {
            const config = leaveTypeConfig[type];
            const balance = leaveBalances[type];
            const percentage = (balance.used / balance.total) * 100;
            const Icon = config.icon;
            
            return (
              <div
                key={type}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-slate-700">{config.label}</h3>
                  <Icon className={`h-5 w-5 text-${config.color}-500`} />
                </div>
                <div className="flex items-end gap-1.5 mb-3">
                  <span className={`text-2xl font-bold text-${config.color}-600`}>{balance.remaining}</span>
                  <span className="text-slate-400 text-sm mb-0.5">/ {balance.total}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      config.color === 'blue'
                        ? 'bg-blue-500'
                        : config.color === 'emerald'
                        ? 'bg-emerald-500'
                        : config.color === 'amber'
                        ? 'bg-amber-500'
                        : config.color === 'pink'
                        ? 'bg-pink-500'
                        : 'bg-purple-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">{balance.used} used</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Pending Approvals Section - Shows if user has any pending approvals */}
      <div className="mb-8">
        <PendingApprovals userId={user.uid} userName={userName} />
      </div>

      {/* My Leave History */}
      <MyLeaveHistory userId={user.uid} />

      {/* Leave Request Form Modal */}
      <LeaveRequestForm
        userId={user.uid}
        userName={userName}
        userBirthday={user.dateOfBirth}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
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
