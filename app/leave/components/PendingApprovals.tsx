'use client';

import { useState, useEffect } from 'react';
import { 
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Plane,
  Thermometer,
  AlertTriangle,
  Cake,
  Calendar,
  ClipboardList,
  User,
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
import { SimpleLeaveRequest, LeaveTypeName } from '@/types';
import { subscribeToPendingApprovals, approveLeaveRequest, rejectLeaveRequest } from '@/lib/firebase/leave-requests';
import toast from 'react-hot-toast';

interface PendingApprovalsProps {
  userId: string;
  userName: string;
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
  sick: 'bg-red-100 text-red-600',
  emergency: 'bg-amber-100 text-amber-600',
  birthday: 'bg-pink-100 text-pink-600',
  bereavement: 'bg-purple-100 text-purple-600',
};

const leaveTypeLabels: Record<LeaveTypeName, string> = {
  vacation: 'Vacation Leave',
  sick: 'Sick Leave',
  emergency: 'Emergency Leave',
  birthday: 'Birthday Leave',
  bereavement: 'Bereavement Leave',
};

export function PendingApprovals({ userId, userName }: PendingApprovalsProps) {
  const [requests, setRequests] = useState<SimpleLeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ isOpen: boolean; request: SimpleLeaveRequest | null }>({
    isOpen: false,
    request: null,
  });
  const [rejectionReason, setRejectionReason] = useState('');

  // Real-time subscription to pending approvals for this user
  useEffect(() => {
    const unsubscribe = subscribeToPendingApprovals(userId, (data) => {
      setRequests(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleApprove = async (requestId: string) => {
    try {
      setProcessing(requestId);
      await approveLeaveRequest(requestId, userId, userName);
      toast.success('Leave request approved! The employee has been notified.');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setProcessing(null);
    }
  };

  const openRejectModal = (request: SimpleLeaveRequest) => {
    setRejectModal({ isOpen: true, request });
    setRejectionReason('');
  };

  const handleReject = async () => {
    if (!rejectModal.request) return;

    try {
      setProcessing(rejectModal.request.id);
      await rejectLeaveRequest(rejectModal.request.id, userId, userName, rejectionReason.trim() || undefined);
      toast.success('Leave request rejected. The employee has been notified.');
      setRejectModal({ isOpen: false, request: null });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setProcessing(null);
    }
  };

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
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-amber-500" />
            Pending Approvals
            {requests.length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold">
                {requests.length}
              </span>
            )}
          </h2>
        </div>

        {requests.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-300 mb-3" />
            <p className="text-slate-500">No pending approvals</p>
            <p className="text-sm text-slate-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map((request) => {
              const LeaveIcon = leaveTypeIcons[request.leaveType];
              const isProcessing = processing === request.id;
              
              return (
                <div key={request.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${leaveTypeColors[request.leaveType]}`}>
                        <LeaveIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-[10px] font-bold text-white">
                            {request.employeeName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                          </div>
                          <h3 className="font-medium text-slate-900">
                            {request.employeeName}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {leaveTypeLabels[request.leaveType]}
                        </p>
                        <p className="text-sm text-slate-500 mt-0.5">
                          {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          <span className="mx-1">•</span>
                          {request.totalDays} day{request.totalDays > 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-slate-600 mt-1 italic">
                          "{request.reason}"
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        disabled={isProcessing}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isProcessing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openRejectModal(request)}
                        disabled={isProcessing}
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rejection Reason Modal */}
      <Dialog open={rejectModal.isOpen} onOpenChange={(open) => !open && setRejectModal({ isOpen: false, request: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Reject Leave Request
            </DialogTitle>
            <DialogDescription>
              Optionally provide a reason for rejecting {rejectModal.request?.employeeName}'s leave request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Rejection Reason (Optional)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Provide a reason for rejection..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setRejectModal({ isOpen: false, request: null })}
                disabled={processing !== null}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={processing !== null}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {processing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Reject Request'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
