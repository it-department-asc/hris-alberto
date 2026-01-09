'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  CalendarDays,
  Loader2,
  Send,
  Plane,
  Thermometer,
  AlertTriangle,
  Cake,
  UserCheck,
  AlertCircle,
  Heart,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { UserDocument, LeaveTypeName, LeaveApprover, SimpleLeaveRequest } from '@/types';
import { createLeaveRequest, subscribeToUserLeaveRequests } from '@/lib/firebase/leave-requests';
import { subscribeToUserLeaveApprovers, getDefaultApprovers, ALL_LEAVE_TYPES } from '@/lib/firebase/approvers';
import { getAllEmployees } from '@/lib/firebase/employees';
import { 
  getMinVacationLeaveDate, 
  formatDateForInput, 
  validateLeaveRequest,
  getLeaveBalance,
  getBirthMonthRange,
} from '@/lib/firebase/leave-utils';
import toast from 'react-hot-toast';

interface LeaveRequestFormProps {
  userId: string;
  userName: string;
  userBirthday?: Date | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const leaveTypeIcons: Record<LeaveTypeName, typeof Plane> = {
  vacation: Plane,
  sick: Thermometer,
  emergency: AlertTriangle,
  birthday: Cake,
  bereavement: Heart,
};

const leaveTypeColors: Record<LeaveTypeName, string> = {
  vacation: 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200',
  sick: 'bg-red-100 text-red-600 border-red-200 hover:bg-red-200',
  emergency: 'bg-amber-100 text-amber-600 border-amber-200 hover:bg-amber-200',
  birthday: 'bg-pink-100 text-pink-600 border-pink-200 hover:bg-pink-200',
  bereavement: 'bg-purple-100 text-purple-600 border-purple-200 hover:bg-purple-200',
};

export function LeaveRequestForm({ userId, userName, userBirthday, isOpen, onClose, onSuccess }: LeaveRequestFormProps) {
  const [selectedLeaveType, setSelectedLeaveType] = useState<LeaveTypeName>('vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [approvers, setApprovers] = useState<LeaveApprover[]>(getDefaultApprovers());
  const [allEmployees, setAllEmployees] = useState<UserDocument[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<SimpleLeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Load approvers, employees, and existing leave requests
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      
      // Subscribe to user's leave approvers
      const unsubApprovers = subscribeToUserLeaveApprovers(userId, (data) => {
        setApprovers(data?.approvers || getDefaultApprovers());
      });

      // Subscribe to user's leave requests for balance calculation
      const unsubRequests = subscribeToUserLeaveRequests(userId, (requests) => {
        setLeaveRequests(requests);
      });

      // Load all employees for approver names
      getAllEmployees().then(employees => {
        setAllEmployees(employees);
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });

      return () => {
        unsubApprovers();
        unsubRequests();
      };
    }
  }, [userId, isOpen]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedLeaveType('vacation');
      setStartDate('');
      setEndDate('');
      setReason('');
    }
  }, [isOpen]);

  // Reset dates when leave type changes
  useEffect(() => {
    setStartDate('');
    setEndDate('');
  }, [selectedLeaveType]);

  // Get minimum date based on leave type
  const minDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedLeaveType === 'vacation') {
      return formatDateForInput(getMinVacationLeaveDate());
    }
    
    if (selectedLeaveType === 'birthday' && userBirthday) {
      const range = getBirthMonthRange(userBirthday);
      if (range) {
        return range.start > today ? formatDateForInput(range.start) : formatDateForInput(today);
      }
    }
    
    return formatDateForInput(today);
  }, [selectedLeaveType, userBirthday]);

  // Get maximum date for birthday leave
  const maxDate = useMemo(() => {
    if (selectedLeaveType === 'birthday' && userBirthday) {
      const range = getBirthMonthRange(userBirthday);
      if (range) {
        return formatDateForInput(range.end);
      }
    }
    return undefined;
  }, [selectedLeaveType, userBirthday]);

  // Get current balance for selected leave type
  const currentBalance = useMemo(() => {
    return getLeaveBalance(leaveRequests, selectedLeaveType);
  }, [leaveRequests, selectedLeaveType]);

  const getApproverForLeaveType = (leaveType: LeaveTypeName): string | null => {
    const approver = approvers.find(a => a.leaveType === leaveType);
    return approver?.approverId || null;
  };

  const getApproverName = (approverId: string | null): string => {
    if (!approverId) return 'Not assigned';
    const approver = allEmployees.find(e => e.uid === approverId);
    return approver?.displayName || approver?.email || 'Unknown';
  };

  const currentApprover = getApproverForLeaveType(selectedLeaveType);

  // Get helpful hints for each leave type
  const getLeaveTypeHint = (leaveType: LeaveTypeName): string | null => {
    switch (leaveType) {
      case 'vacation':
        return `Must be filed 5 working days in advance. Earliest: ${new Date(minDate).toLocaleDateString()}`;
      case 'birthday':
        if (!userBirthday) return 'Birthday not set in profile. Contact HR.';
        const birthDate = userBirthday instanceof Date ? userBirthday : new Date(userBirthday);
        return `Can only be taken in ${birthDate.toLocaleString('default', { month: 'long' })} (1 day only)`;
      case 'bereavement':
        return 'For immediate family loss. Up to 5 days per year.';
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    if (!currentApprover) {
      toast.error('No approver assigned for this leave type. Please contact HR.');
      return;
    }

    // Validate leave request
    const validation = validateLeaveRequest(
      selectedLeaveType,
      new Date(startDate),
      new Date(endDate),
      leaveRequests,
      userBirthday
    );

    if (!validation.valid) {
      toast.error(validation.error || 'Invalid leave request');
      return;
    }

    try {
      setSubmitting(true);
      await createLeaveRequest(
        userId,
        userName,
        selectedLeaveType,
        new Date(startDate),
        new Date(endDate),
        reason.trim()
      );
      toast.success('Leave request submitted successfully! Your approver has been notified.');
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast.error('Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const hint = getLeaveTypeHint(selectedLeaveType);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-500" />
              File Leave Request
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-blue-500" />
            File Leave Request
          </DialogTitle>
          <DialogDescription>
            Submit a new leave request for approval
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Leave Type Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Leave Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_LEAVE_TYPES.map(lt => {
                const Icon = leaveTypeIcons[lt.type];
                const isSelected = selectedLeaveType === lt.type;
                const balance = getLeaveBalance(leaveRequests, lt.type);
                const isDisabled = balance.remaining <= 0;
                
                return (
                  <button
                    key={lt.type}
                    type="button"
                    onClick={() => !isDisabled && setSelectedLeaveType(lt.type)}
                    disabled={isDisabled}
                    className={`relative flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      isDisabled 
                        ? 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed'
                        : isSelected 
                          ? `${leaveTypeColors[lt.type]} border-current` 
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{lt.label.replace(' Leave', '')}</span>
                    <span className={`text-[10px] ${isDisabled ? 'text-slate-400' : 'text-slate-500'}`}>
                      {balance.remaining}/{balance.total} left
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Leave Type Hint */}
          {hint && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <Info className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-600">{hint}</p>
            </div>
          )}

          {/* Approver Info */}
          <div className={`flex items-center gap-3 p-3 rounded-xl ${
            currentApprover ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'
          }`}>
            {currentApprover ? (
              <>
                <UserCheck className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Approver</p>
                  <p className="text-sm text-green-600">{getApproverName(currentApprover)}</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800">No Approver Assigned</p>
                  <p className="text-xs text-amber-600">Contact HR to set up your leave approvers</p>
                </div>
              </>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  // For birthday leave, set end date same as start (1 day only)
                  if (selectedLeaveType === 'birthday') {
                    setEndDate(e.target.value);
                  }
                }}
                min={minDate}
                max={maxDate}
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || minDate}
                max={maxDate}
                disabled={selectedLeaveType === 'birthday'} // Birthday is 1 day only
                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
                required
              />
            </div>
          </div>

          {/* Balance Warning */}
          {currentBalance.remaining <= 2 && currentBalance.remaining > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 border border-amber-200">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="text-xs text-amber-700">
                Low balance: Only {currentBalance.remaining} {selectedLeaveType} leave day(s) remaining
              </p>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder={
                selectedLeaveType === 'bereavement' 
                  ? "Please specify the relationship to the deceased..."
                  : "Please provide a reason for your leave..."
              }
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !currentApprover || currentBalance.remaining <= 0 || (selectedLeaveType === 'birthday' && !userBirthday)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
