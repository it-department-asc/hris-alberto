'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarDays,
  Loader2,
  Send,
  Plane,
  Thermometer,
  AlertTriangle,
  Cake,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UserDocument, LeaveTypeName, SimpleLeaveRequest, LeaveRequestStatus } from '@/types';
import { 
  createLeaveRequest,
  subscribeToEmployeeLeaveRequests,
  cancelLeaveRequest,
} from '@/lib/firebase/leave-requests';
import { subscribeToUserLeaveApprovers, getDefaultApprovers, ALL_LEAVE_TYPES } from '@/lib/firebase/approvers';
import toast from 'react-hot-toast';


const leaveTypeIcons: Record<LeaveTypeName, typeof Plane> = {
  vacation: Plane,
  sick: Thermometer,
  emergency: AlertTriangle,
  birthday: Cake,
  bereavement: Heart,
};

const leaveTypeColors: Record<LeaveTypeName, string> = {
  vacation: 'bg-blue-100 text-blue-600 border-blue-200',
  sick: 'bg-red-100 text-red-600 border-red-200',
  emergency: 'bg-amber-100 text-amber-600 border-amber-200',
  birthday: 'bg-pink-100 text-pink-600 border-pink-200',
  bereavement: 'bg-purple-100 text-purple-600 border-purple-200',
};

const statusConfig: Record<LeaveRequestStatus, { icon: typeof Clock; color: string; label: string }> = {
  pending: { icon: Clock, color: 'bg-amber-100 text-amber-700', label: 'Pending' },
  approved: { icon: CheckCircle2, color: 'bg-green-100 text-green-700', label: 'Approved' },
  rejected: { icon: XCircle, color: 'bg-red-100 text-red-700', label: 'Rejected' },
  cancelled: { icon: X, color: 'bg-slate-100 text-slate-600', label: 'Cancelled' },
};



// Leave History Component
interface LeaveHistoryProps {
  employee: UserDocument;
  allEmployees: UserDocument[];
}

export function LeaveHistory({ employee, allEmployees }: LeaveHistoryProps) {
  const [requests, setRequests] = useState<SimpleLeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToEmployeeLeaveRequests(employee.uid, (data) => {
      setRequests(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [employee.uid]);

  const handleCancel = async (requestId: string) => {
    try {
      await cancelLeaveRequest(requestId);
      toast.success('Leave request cancelled');
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  if (loading) {
    return (
      <div className="py-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No leave requests yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {requests.map(request => {
        const Icon = leaveTypeIcons[request.leaveType];
        const statusConf = statusConfig[request.status];
        const StatusIcon = statusConf.icon;

        return (
          <div key={request.id} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`flex items-center justify-center h-9 w-9 rounded-lg ${leaveTypeColors[request.leaveType].split(' ')[0]} ${leaveTypeColors[request.leaveType].split(' ')[1]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 capitalize">
                    {request.leaveType.replace('_', ' ')} Leave
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(request.startDate).toLocaleDateString()} — {new Date(request.endDate).toLocaleDateString()}
                    <span className="ml-1">({request.totalDays} day{request.totalDays !== 1 ? 's' : ''})</span>
                  </p>
                  {request.reason && (
                    <p className="text-xs text-slate-400 mt-1 italic">"{request.reason}"</p>
                  )}
                  {request.rejectionReason && (
                    <p className="text-xs text-red-500 mt-1">Rejection: {request.rejectionReason}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConf.color}`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusConf.label}
                </span>
                {request.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(request.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50"
                    title="Cancel request"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
