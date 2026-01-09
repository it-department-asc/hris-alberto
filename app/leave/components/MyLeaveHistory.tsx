'use client';

import { useState, useEffect } from 'react';
import { 
  Clock,
  CheckCircle2,
  XCircle,
  X,
  Loader2,
  Plane,
  Thermometer,
  AlertTriangle,
  Cake,
  Calendar,
  FileText,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleLeaveRequest, LeaveTypeName, LeaveRequestStatus } from '@/types';
import { subscribeToEmployeeLeaveRequests, cancelLeaveRequest } from '@/lib/firebase/leave-requests';
import toast from 'react-hot-toast';

interface MyLeaveHistoryProps {
  userId: string;
}

const leaveTypeIcons: Record<LeaveTypeName, typeof Plane> = {
  vacation: Plane,
  sick: Thermometer,
  emergency: AlertTriangle,
  birthday: Cake,
  bereavement: Heart,
};

const leaveTypeColors: Record<LeaveTypeName, string> = {
  vacation: 'bg-blue-100 text-blue-600',
  sick: 'bg-emerald-100 text-emerald-600',
  emergency: 'bg-amber-100 text-amber-600',
  birthday: 'bg-pink-100 text-pink-600',
  bereavement: 'bg-purple-100 text-purple-600',
};

const statusConfig: Record<LeaveRequestStatus, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: 'bg-amber-100 text-amber-700', label: 'Pending' },
  approved: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Approved' },
  rejected: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Rejected' },
  cancelled: { icon: X, color: 'bg-slate-100 text-slate-600', label: 'Cancelled' },
};

const leaveTypeLabels: Record<LeaveTypeName, string> = {
  vacation: 'Vacation Leave',
  sick: 'Sick Leave',
  emergency: 'Emergency Leave',
  birthday: 'Birthday Leave',
  bereavement: 'Bereavement Leave',
};

export function MyLeaveHistory({ userId }: MyLeaveHistoryProps) {
  const [requests, setRequests] = useState<SimpleLeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | LeaveRequestStatus>('all');
  const [cancelling, setCancelling] = useState<string | null>(null);

  // Real-time subscription to user's leave requests
  useEffect(() => {
    const unsubscribe = subscribeToEmployeeLeaveRequests(userId, (data) => {
      setRequests(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleCancel = async (requestId: string) => {
    try {
      setCancelling(requestId);
      await cancelLeaveRequest(requestId);
      toast.success('Leave request cancelled');
    } catch (error) {
      toast.error('Failed to cancel request');
    } finally {
      setCancelling(null);
    }
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          My Leave History
        </h2>
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'approved', 'rejected', 'cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No leave requests found</p>
          {filter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              View all requests
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredRequests.map((request) => {
            const LeaveIcon = leaveTypeIcons[request.leaveType];
            const StatusIcon = statusConfig[request.status].icon;
            
            return (
              <div key={request.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${leaveTypeColors[request.leaveType]}`}>
                      <LeaveIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">
                        {leaveTypeLabels[request.leaveType]}
                      </h3>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                        <span className="mx-1">•</span>
                        {request.totalDays} day{request.totalDays > 1 ? 's' : ''}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">{request.reason}</p>
                      {request.rejectionReason && (
                        <p className="text-sm text-red-600 mt-1">
                          Rejection reason: {request.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusConfig[request.status].color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusConfig[request.status].label}
                    </span>
                    {request.status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancel(request.id)}
                        disabled={cancelling === request.id}
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        {cancelling === request.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
