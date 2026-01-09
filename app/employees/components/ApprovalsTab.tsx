'use client';

import { useState, useEffect } from 'react';
import { 
  UserCheck,
  Loader2,
  Save,
  Plane,
  Thermometer,
  AlertTriangle,
  Cake,
  ChevronDown,
  X,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserDocument, LeaveApprover, LeaveTypeName } from '@/types';
import { 
  subscribeToUserLeaveApprovers, 
  setUserLeaveApprovers,
  getDefaultApprovers,
  ALL_LEAVE_TYPES,
} from '@/lib/firebase/approvers';
import toast from 'react-hot-toast';

interface ApprovalsTabProps {
  employee: UserDocument;
  allEmployees: UserDocument[];
  currentUserId: string;
  canEdit: boolean;
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

export function ApprovalsTab({ employee, allEmployees, currentUserId, canEdit }: ApprovalsTabProps) {
  const [approvers, setApprovers] = useState<LeaveApprover[]>(getDefaultApprovers());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalApprovers, setOriginalApprovers] = useState<LeaveApprover[]>([]);
  const [openDropdown, setOpenDropdown] = useState<LeaveTypeName | null>(null);

  // Filter out the current employee from potential approvers
  const potentialApprovers = allEmployees.filter(
    emp => emp.uid !== employee.uid && emp.isActive
  );

  useEffect(() => {
    const unsubscribe = subscribeToUserLeaveApprovers(employee.uid, (data) => {
      const apps = data?.approvers || getDefaultApprovers();
      setApprovers(apps);
      setOriginalApprovers(apps);
      setHasChanges(false);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [employee.uid]);

  const handleApproverChange = (leaveType: LeaveTypeName, approverId: string | null) => {
    setApprovers(prev => {
      const updated = prev.map(a => 
        a.leaveType === leaveType ? { ...a, approverId } : a
      );
      setHasChanges(JSON.stringify(updated) !== JSON.stringify(originalApprovers));
      return updated;
    });
    setOpenDropdown(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await setUserLeaveApprovers(employee.uid, approvers, currentUserId);
      toast.success('Leave approvers saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving approvers:', error);
      toast.error('Failed to save approvers');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setApprovers(originalApprovers);
    setHasChanges(false);
  };

  const getApproverForLeaveType = (leaveType: LeaveTypeName): string | null => {
    const approver = approvers.find(a => a.leaveType === leaveType);
    return approver?.approverId || null;
  };

  const getApproverName = (approverId: string | null): string => {
    if (!approverId) return 'Not assigned';
    const approver = allEmployees.find(e => e.uid === approverId);
    return approver?.displayName || approver?.email || 'Unknown';
  };

  const getApproverEmail = (approverId: string | null): string => {
    if (!approverId) return '';
    const approver = allEmployees.find(e => e.uid === approverId);
    return approver?.email || '';
  };

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-500" />
            Leave Approvers
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Assign who can approve leave requests for this employee
          </p>
        </div>
        {canEdit && hasChanges && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleReset} disabled={saving}>
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Approvers List */}
      <div className="space-y-3">
        {ALL_LEAVE_TYPES.map(lt => {
          const Icon = leaveTypeIcons[lt.type];
          const colorClass = leaveTypeColors[lt.type];
          const currentApproverId = getApproverForLeaveType(lt.type);
          const isOpen = openDropdown === lt.type;

          return (
            <div 
              key={lt.type} 
              className="rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Leave Type Info */}
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center h-10 w-10 rounded-lg ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{lt.label}</p>
                    <p className="text-xs text-slate-500">{lt.description}</p>
                  </div>
                </div>

                {/* Approver Dropdown */}
                <div className="relative min-w-[200px]">
                  <button
                    onClick={() => canEdit && setOpenDropdown(isOpen ? null : lt.type)}
                    disabled={!canEdit}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-colors text-sm ${
                      currentApproverId 
                        ? 'border-slate-200 bg-white' 
                        : 'border-dashed border-slate-300 bg-slate-50'
                    } ${canEdit ? 'hover:border-blue-300 cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                  >
                    <div className="text-left truncate">
                      {currentApproverId ? (
                        <>
                          <p className="font-medium text-slate-900 truncate">
                            {getApproverName(currentApproverId)}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {getApproverEmail(currentApproverId)}
                          </p>
                        </>
                      ) : (
                        <p className="text-slate-400">Select approver...</p>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {isOpen && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {/* Clear Option */}
                      {currentApproverId && (
                        <button
                          onClick={() => handleApproverChange(lt.type, null)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 border-b border-slate-100"
                        >
                          <X className="h-4 w-4" />
                          Remove Approver
                        </button>
                      )}

                      {/* Employees List */}
                      {potentialApprovers.length > 0 ? (
                        potentialApprovers.map(emp => (
                          <button
                            key={emp.uid}
                            onClick={() => handleApproverChange(lt.type, emp.uid)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 ${
                              currentApproverId === emp.uid ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600 shrink-0">
                              {emp.firstName?.charAt(0) || ''}{emp.lastName?.charAt(0) || ''}
                            </div>
                            <div className="text-left min-w-0">
                              <p className="font-medium text-slate-900 truncate">
                                {emp.displayName}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {emp.email}
                              </p>
                            </div>
                            {currentApproverId === emp.uid && (
                              <div className="ml-auto">
                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-3 py-4 text-center text-sm text-slate-500">
                          No other employees available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> When this employee files a leave request, it will be sent to the assigned approver for that leave type. 
          The approver will receive a notification and can approve or reject the request.
        </p>
      </div>
    </div>
  );
}
