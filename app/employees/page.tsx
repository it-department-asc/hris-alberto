'use client';

import { useState, useEffect, useMemo } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';
import { getAllEmployees, updateEmployee, createEmployee, toggleEmployeeStatus, generateNextEmployeeId } from '@/lib/firebase/employees';
import { getDepartments } from '@/lib/firebase/departments';
import { UserDocument, Department, UserRole, SimpleLeaveRequest, LeaveTypeName, LEAVE_LIMITS } from '@/types';
import { useConfirm } from '@/hooks/use-confirm';
import { subscribeToEmployeeLeaveRequests } from '@/lib/firebase/leave-requests';
import { getAllLeaveBalances } from '@/lib/firebase/leave-utils';
import toast from 'react-hot-toast';
import {
  Users,
  Plus,
  Search,
  Filter,
  X,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  Shield,
  Save,
  Loader2,
  User,
  ChevronDown,
  Edit3,
  Eye,
  UserCheck,
  UserX,
  Hash,
  Clock,
  AlertCircle,
  TrendingUp,
  CalendarDays,
  FileText,
  Scale,
  Receipt,
  Key,
  DollarSign,
  ArrowUpRight,
  ArrowRightLeft,
  Banknote,
  Plane,
  ClockIcon,
  Home,
  Laptop,
  AlertTriangle,
  AlertTriangle as AlertTriangleIcon,
  FileWarning,
  Gavel,
  CreditCard,
  Building,
  Calculator,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Cake,
  Heart,
  Thermometer,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserSeedButton } from '@/components/UserSeedButton';
import { MovementTrackerTab, PermissionsTab, ApprovalsTab, LeaveHistory } from './components';

// Status badge component
function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${isActive
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-slate-100 text-slate-600'
        }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}

// Role badge component
function RoleBadge({ role }: { role: UserRole }) {
  const roleColors: Record<UserRole, string> = {
    admin: 'bg-purple-100 text-purple-700',
    hr: 'bg-blue-100 text-blue-700',
    payroll: 'bg-amber-100 text-amber-700',
    manager: 'bg-teal-100 text-teal-700',
    employee: 'bg-slate-100 text-slate-600',
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${roleColors[role]}`}>
      {role}
    </span>
  );
}

// Employee Card Component
function EmployeeCard({
  employee,
  department,
  onClick
}: {
  employee: UserDocument;
  department: Department | undefined;
  onClick: () => void;
}) {
  const initials = `${employee.firstName?.charAt(0) || ''}${employee.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md hover:shadow-blue-100/50"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative">
          {employee.profilePhotoUrl ? (
            <img
              src={employee.profilePhotoUrl}
              alt={employee.displayName}
              className="h-14 w-14 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-lg font-bold text-white">
              {initials}
            </div>
          )}
          <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${employee.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                {employee.displayName || 'Unnamed Employee'}
              </h3>
              {employee.employeeId && (
                <p className="text-xs text-slate-500 mt-0.5">{employee.employeeId}</p>
              )}
            </div>
            <RoleBadge role={employee.role} />
          </div>

          <div className="mt-3 space-y-1.5">
            {department && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">{department.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate">{employee.email}</span>
            </div>
            {employee.mobileNumber && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{employee.mobileNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Employee Detail Modal with Tabs
function EmployeeDetailModal({
  employee,
  department,
  departments,
  allEmployees,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
  onRefresh,
  currentUserRole,
  currentUserId,
}: {
  employee: UserDocument | null;
  department: Department | undefined;
  departments: Department[];
  allEmployees: UserDocument[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
  onRefresh: () => void;
  currentUserRole: UserRole;
  currentUserId: string;
}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [lastEmployeeId, setLastEmployeeId] = useState<string | null>(null);

  // Reset to profile tab only when modal opens with a DIFFERENT employee
  useEffect(() => {
    if (isOpen && employee?.uid && employee.uid !== lastEmployeeId) {
      setActiveTab('profile');
      setLastEmployeeId(employee.uid);
    }
    if (!isOpen) {
      setLastEmployeeId(null);
    }
  }, [isOpen, employee?.uid, lastEmployeeId]);

  // Early return AFTER all hooks
  if (!employee) return null;

  const initials = `${employee.firstName?.charAt(0) || ''}${employee.lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  const canEdit = currentUserRole === 'admin' || currentUserRole === 'hr';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'career', label: 'Career Timeline', icon: TrendingUp },
    { id: 'leave', label: 'Leave', icon: CalendarDays },
    { id: 'filings', label: 'Filings', icon: FileText },
    { id: 'relations', label: 'Relations', icon: Scale },
    { id: 'payslip', label: 'Payslip', icon: Receipt },
    { id: 'permissions', label: 'Permissions', icon: Key },
    { id: 'approvals', label: 'Approvals', icon: UserCheck },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] min-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">Employee Profile</DialogTitle>
          <DialogDescription>View and manage employee information</DialogDescription>
        </DialogHeader>

        {/* Profile Header - Always Visible */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl">
          {employee.profilePhotoUrl ? (
            <img
              src={employee.profilePhotoUrl}
              alt={employee.displayName}
              className="h-16 w-16 rounded-xl object-cover shadow-lg"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl font-bold text-white shadow-lg">
              {initials}
            </div>
          )}

          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900">{employee.displayName}</h2>
            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start items-center">
              {employee.employeeId && (
                <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                  {employee.employeeId}
                </span>
              )}
              <RoleBadge role={employee.role} />
              <StatusBadge isActive={employee.isActive} />
            </div>
            {/* Show password for testing */}
            <div className="mt-2 flex items-center gap-2 text-xs">
              <Key className="h-3 w-3 text-amber-500" />
              <span className="text-slate-500">Password:</span>
              <code className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-mono">Password123!</code>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant={employee.isActive ? "destructive" : "default"}
                size="sm"
                onClick={onToggleStatus}
              >
                {employee.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <nav className="flex gap-1 overflow-x-auto px-1 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-1">
          {activeTab === 'profile' && (
            <ProfileTab employee={employee} department={department} />
          )}
          {activeTab === 'career' && (
            <MovementTrackerTab 
              employee={employee} 
              departments={departments}
              currentUserId={currentUserId}
              canEdit={canEdit}
              onEmployeeUpdate={onRefresh}
            />
          )}
          {activeTab === 'leave' && (
            <LeaveTrackerTab employee={employee} />
          )}
          {activeTab === 'filings' && (
            <FilingsTab employee={employee} />
          )}
          {activeTab === 'relations' && (
            <EmployeeRelationsTab employee={employee} />
          )}
          {activeTab === 'payslip' && (
            <PayslipTab employee={employee} />
          )}
          {activeTab === 'permissions' && (
            <PermissionsTab 
              employee={employee} 
              currentUserId={currentUserId || ''} 
              canEdit={canEdit} 
            />
          )}
          {activeTab === 'approvals' && (
            <ApprovalsTab 
              employee={employee} 
              allEmployees={allEmployees} 
              currentUserId={currentUserId || ''} 
              canEdit={canEdit} 
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Profile Tab Content
function ProfileTab({ employee, department }: { employee: UserDocument; department: Department | undefined }) {
  return (
    <div className="grid gap-4 py-2">
      {/* Contact Information */}
      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Mail className="h-4 w-4 text-blue-500" />
          Contact Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoItem label="Email" value={employee.email} />
          <InfoItem label="Personal Email" value={employee.personalEmail} />
          <InfoItem label="Mobile" value={employee.mobileNumber} />
          <InfoItem label="Telephone" value={employee.telephoneNumber} />
          <InfoItem label="Date of Birth" value={employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : undefined} />
        </div>
      </div>

      {/* Employment Information */}
      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-blue-500" />
          Employment Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoItem label="Employee ID" value={employee.employeeId} />
          <InfoItem label="Job Title" value={employee.jobTitle} />
          <InfoItem label="Department" value={department?.name} />
          <InfoItem label="Role" value={employee.role} capitalize />
          <InfoItem label="Status" value={employee.isActive ? 'Active' : 'Inactive'} />
          <InfoItem
            label="Hire Date"
            value={employee.hireDate ? new Date(employee.hireDate).toLocaleDateString() : undefined}
          />
          <InfoItem label="Employment Status" value={employee.employmentStatus} capitalize />
        </div>
      </div>

      {/* Address */}
      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-500" />
          Address
        </h3>
        <div className="grid gap-3">
          <InfoItem label="Present Address" value={employee.presentAddress} fullWidth />
          <InfoItem label="Permanent Address" value={employee.permanentAddress} fullWidth />
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          Emergency Contact
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <InfoItem label="Name" value={employee.emergencyContactName} />
          <InfoItem label="Relationship" value={employee.emergencyContactRelationship} />
          <InfoItem label="Contact Number" value={employee.emergencyContactNumber} />
        </div>
      </div>

      {/* System Info */}
      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-500" />
          System Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <InfoItem
            label="Created At"
            value={employee.createdAt ? new Date(employee.createdAt).toLocaleString() : undefined}
          />
          <InfoItem
            label="Last Login"
            value={employee.lastLoginAt ? new Date(employee.lastLoginAt).toLocaleString() : 'Never'}
          />
        </div>
      </div>
    </div>
  );
}

// Leave Tracker Tab
function LeaveTrackerTab({ employee }: { employee: UserDocument }) {
  const [leaveRequests, setLeaveRequests] = useState<SimpleLeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employee?.uid) {
      setLoading(true);
      const unsubscribe = subscribeToEmployeeLeaveRequests(employee.uid, (requests) => {
        setLeaveRequests(requests);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [employee?.uid]);

  // Calculate leave balances from actual requests
  const leaveBalances = getAllLeaveBalances(leaveRequests);
  
  // Get birthday info for display
  const birthday = employee.birthday || employee.dateOfBirth;
  const birthdayMonth = birthday 
    ? new Date(birthday).toLocaleString('default', { month: 'long' })
    : null;

  const leaveTypes: { type: LeaveTypeName; label: string; icon: typeof Plane; color: string }[] = [
    { type: 'vacation', label: 'Vacation', icon: Plane, color: 'blue' },
    { type: 'sick', label: 'Sick', icon: Thermometer, color: 'emerald' },
    { type: 'emergency', label: 'Emergency', icon: AlertTriangleIcon, color: 'amber' },
    { type: 'birthday', label: 'Birthday', icon: Cake, color: 'pink' },
    { type: 'bereavement', label: 'Bereavement', icon: Heart, color: 'purple' },
  ];

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      approved: 'bg-green-100 text-green-700',
      pending: 'bg-amber-100 text-amber-700',
      rejected: 'bg-red-100 text-red-700',
      cancelled: 'bg-slate-100 text-slate-600',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getLeaveTypeIcon = (type: LeaveTypeName) => {
    const config = leaveTypes.find(lt => lt.type === type);
    if (!config) return <CalendarDays className="h-4 w-4 text-slate-400" />;
    const Icon = config.icon;
    return <Icon className={`h-4 w-4 text-${config.color}-500`} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="py-2 space-y-4">
      {/* Birthday Info */}
      {birthday && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-pink-50 border border-pink-200">
          <Cake className="h-5 w-5 text-pink-500" />
          <div>
            <p className="text-sm font-medium text-pink-800">Birthday</p>
            <p className="text-xs text-pink-600">
              {new Date(birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              {' '}— Birthday leave available in {birthdayMonth}
            </p>
          </div>
        </div>
      )}

      {/* Leave Balances */}
      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-blue-500" />
          Leave Balances ({new Date().getFullYear()})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {leaveTypes.map((lt) => {
            const balance = leaveBalances[lt.type];
            const Icon = lt.icon;
            return (
              <div key={lt.type} className="p-3 bg-slate-50 rounded-lg text-center">
                <Icon className={`h-4 w-4 mx-auto mb-1 text-${lt.color}-500`} />
                <p className="text-xs text-slate-500 mb-1">{lt.label}</p>
                <p className={`text-xl font-bold text-${lt.color}-600`}>{balance.remaining}</p>
                <p className="text-[10px] text-slate-400">of {balance.total} days</p>
                <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      lt.color === 'blue' ? 'bg-blue-500' :
                      lt.color === 'emerald' ? 'bg-emerald-500' :
                      lt.color === 'amber' ? 'bg-amber-500' :
                      lt.color === 'pink' ? 'bg-pink-500' :
                      'bg-purple-500'
                    }`}
                    style={{ width: `${(balance.used / balance.total) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leave History */}
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            Leave History
          </h3>
          <span className="text-xs text-slate-500">{leaveRequests.length} requests</span>
        </div>
        
        {leaveRequests.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDays className="h-10 w-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm text-slate-500">No leave requests found</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {leaveRequests.map((leave) => (
              <div key={leave.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getLeaveTypeIcon(leave.leaveType)}
                  <div>
                    <p className="text-sm font-medium text-slate-900 capitalize">
                      {leave.leaveType.replace('_', ' ')} Leave
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(leave.startDate).toLocaleDateString()} 
                      {leave.totalDays > 1 && ` — ${new Date(leave.endDate).toLocaleDateString()}`}
                      {' '}({leave.totalDays} day{leave.totalDays > 1 ? 's' : ''})
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusBadge(leave.status)}`}>
                  {leave.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Filings Tab (Leave, OT, OB, WFH)
function FilingsTab({ employee }: { employee: UserDocument }) {
  const filings = [
    { id: 1, type: 'Leave', subtype: 'Vacation Leave', date: '2026-01-15', status: 'pending', remarks: 'Family vacation' },
    { id: 2, type: 'OT', subtype: 'Overtime', date: '2026-01-05', hours: 4, status: 'approved', remarks: 'Project deadline' },
    { id: 3, type: 'OB', subtype: 'Official Business', date: '2026-01-03', status: 'approved', remarks: 'Client meeting at BGC' },
    { id: 4, type: 'WFH', subtype: 'Work From Home', date: '2026-01-02', status: 'approved', remarks: 'Internet installation' },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Leave': return <Plane className="h-4 w-4 text-blue-500" />;
      case 'OT': return <ClockIcon className="h-4 w-4 text-amber-500" />;
      case 'OB': return <Building2 className="h-4 w-4 text-green-500" />;
      case 'WFH': return <Laptop className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending': return <MinusCircle className="h-4 w-4 text-amber-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="py-2">
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            Filed Requests
          </h3>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            New Filing
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Leave', icon: Plane, color: 'blue' },
            { label: 'Overtime', icon: ClockIcon, color: 'amber' },
            { label: 'Official Business', icon: Building2, color: 'green' },
            { label: 'WFH', icon: Laptop, color: 'purple' },
          ].map((item, idx) => (
            <button
              key={idx}
              className={`p-3 rounded-lg border border-slate-200 hover:border-${item.color}-300 hover:bg-${item.color}-50 transition-colors text-center`}
            >
              <item.icon className={`h-5 w-5 mx-auto mb-1 text-${item.color}-500`} />
              <p className="text-xs text-slate-600">{item.label}</p>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filings.map((filing) => (
            <div key={filing.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              {getTypeIcon(filing.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-900">{filing.subtype}</p>
                  <span className="text-xs text-slate-400">{filing.date}</span>
                </div>
                <p className="text-xs text-slate-500">{filing.remarks}</p>
              </div>
              {getStatusIcon(filing.status)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Employee Relations Tab
function EmployeeRelationsTab({ employee }: { employee: UserDocument }) {
  const cases = [
    { id: 1, type: 'NTE', reference: 'NTE-2025-001', subject: 'Tardiness', dateIssued: '2025-08-15', status: 'closed', resolution: 'Written warning issued' },
    { id: 2, type: 'IR', reference: 'IR-2025-003', subject: 'Incident Report - Equipment Damage', dateIssued: '2025-06-20', status: 'closed', resolution: 'No fault found' },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'IR': return <FileWarning className="h-4 w-4 text-amber-500" />;
      case 'NTE': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'NOD': return <Gavel className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      IR: 'bg-amber-100 text-amber-700',
      NTE: 'bg-orange-100 text-orange-700',
      NOD: 'bg-red-100 text-red-700',
    };
    return colors[type] || 'bg-slate-100 text-slate-700';
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-100 text-blue-700',
      'under-review': 'bg-amber-100 text-amber-700',
      closed: 'bg-slate-100 text-slate-600',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="py-2">
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Scale className="h-4 w-4 text-blue-500" />
            Case Tracker
          </h3>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            New Case
          </Button>
        </div>

        {/* Case Type Legend */}
        <div className="flex gap-4 mb-4 text-xs">
          <div className="flex items-center gap-1">
            <FileWarning className="h-3 w-3 text-amber-500" />
            <span className="text-slate-600">IR - Incident Report</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-orange-500" />
            <span className="text-slate-600">NTE - Notice to Explain</span>
          </div>
          <div className="flex items-center gap-1">
            <Gavel className="h-3 w-3 text-red-500" />
            <span className="text-slate-600">NOD - Notice of Decision</span>
          </div>
        </div>

        {cases.length > 0 ? (
          <div className="space-y-3">
            {cases.map((caseItem) => (
              <div key={caseItem.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-start gap-3">
                  {getTypeIcon(caseItem.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeBadge(caseItem.type)}`}>
                        {caseItem.type}
                      </span>
                      <span className="text-xs font-mono text-slate-500">{caseItem.reference}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusBadge(caseItem.status)}`}>
                        {caseItem.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 mt-1">{caseItem.subject}</p>
                    <p className="text-xs text-slate-500 mt-1">Issued: {caseItem.dateIssued}</p>
                    {caseItem.resolution && (
                      <p className="text-xs text-slate-600 mt-1 bg-white px-2 py-1 rounded border border-slate-200">
                        Resolution: {caseItem.resolution}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <Scale className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No case records found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Payslip Tab
function PayslipTab({ employee }: { employee: UserDocument }) {
  // Mock payroll data
  const currentPayslip = {
    period: 'December 16-31, 2025',
    basicPay: 25000,
    overtime: 2500,
    allowances: 3000,
    grossPay: 30500,
    deductions: {
      sss: 900,
      philhealth: 450,
      pagibig: 200,
      tax: 2500,
      loans: 1500,
    },
    netPay: 24950,
  };

  const attendance = {
    workDays: 11,
    present: 10,
    late: 2,
    undertime: 1,
    absent: 1,
    overtime: 8,
  };

  const loans = [
    { type: 'SSS Loan', balance: 15000, monthlyDeduction: 1000, startDate: '2025-06-01', endDate: '2026-05-31' },
    { type: 'Pag-IBIG Loan', balance: 8000, monthlyDeduction: 500, startDate: '2025-08-01', endDate: '2026-07-31' },
  ];

  const totalDeductions = Object.values(currentPayslip.deductions).reduce((a, b) => a + b, 0);

  return (
    <div className="py-2 space-y-4">
      {/* Current Payslip Summary */}
      <div className="rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Receipt className="h-4 w-4 text-blue-500" />
            Current Payslip
          </h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{currentPayslip.period}</span>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {/* Earnings */}
          <div className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-green-600 font-medium mb-2">Earnings</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Basic Pay</span>
                <span className="font-medium">₱{currentPayslip.basicPay.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Overtime</span>
                <span className="font-medium">₱{currentPayslip.overtime.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Allowances</span>
                <span className="font-medium">₱{currentPayslip.allowances.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-green-200">
                <span className="font-medium text-green-700">Gross Pay</span>
                <span className="font-bold text-green-700">₱{currentPayslip.grossPay.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="bg-red-50 rounded-lg p-3">
            <p className="text-xs text-red-600 font-medium mb-2">Deductions</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">SSS</span>
                <span className="font-medium">₱{currentPayslip.deductions.sss.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">PhilHealth</span>
                <span className="font-medium">₱{currentPayslip.deductions.philhealth.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Pag-IBIG</span>
                <span className="font-medium">₱{currentPayslip.deductions.pagibig.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax</span>
                <span className="font-medium">₱{currentPayslip.deductions.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Loans</span>
                <span className="font-medium">₱{currentPayslip.deductions.loans.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-red-200">
                <span className="font-medium text-red-700">Total</span>
                <span className="font-bold text-red-700">₱{totalDeductions.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="bg-blue-50 rounded-lg p-3 flex flex-col justify-center">
            <p className="text-xs text-blue-600 font-medium mb-1">Net Pay</p>
            <p className="text-3xl font-bold text-blue-700">₱{currentPayslip.netPay.toLocaleString()}</p>
            <Button size="sm" className="mt-3" variant="outline">
              <Receipt className="h-4 w-4 mr-1" />
              View Full Payslip
            </Button>
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-500" />
          Attendance Summary (Current Period)
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <p className="text-xl font-bold text-slate-900">{attendance.workDays}</p>
            <p className="text-xs text-slate-500">Work Days</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-xl font-bold text-green-600">{attendance.present}</p>
            <p className="text-xs text-slate-500">Present</p>
          </div>
          <div className="text-center p-2 bg-amber-50 rounded-lg">
            <p className="text-xl font-bold text-amber-600">{attendance.late}</p>
            <p className="text-xs text-slate-500">Late</p>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded-lg">
            <p className="text-xl font-bold text-orange-600">{attendance.undertime}</p>
            <p className="text-xs text-slate-500">Undertime</p>
          </div>
          <div className="text-center p-2 bg-emerald-50 rounded-lg">
            <p className="text-xl font-bold text-emerald-500">{attendance.absent}</p>
            <p className="text-xs text-slate-500">Absent</p>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <p className="text-xl font-bold text-blue-600">{attendance.overtime}h</p>
            <p className="text-xs text-slate-500">Overtime</p>
          </div>
        </div>
      </div>

      {/* Loans & Charges */}
      <div className="rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-blue-500" />
          Government Loans & Employee Charges
        </h3>
        {loans.length > 0 ? (
          <div className="space-y-3">
            {loans.map((loan, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{loan.type}</p>
                    <p className="text-xs text-slate-500">{loan.startDate} — {loan.endDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">₱{loan.balance.toLocaleString()}</p>
                  <p className="text-xs text-slate-500">₱{loan.monthlyDeduction.toLocaleString()}/mo</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-slate-500 text-sm">No active loans</p>
        )}
      </div>
    </div>
  );
}

// Info Item Component
function InfoItem({
  label,
  value,
  capitalize = false,
  fullWidth = false
}: {
  label: string;
  value: string | null | undefined;
  capitalize?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? 'col-span-full' : ''}>
      <p className="text-xs text-slate-500 mb-1">{label}</p>
      <p className={`text-sm font-medium text-slate-900 ${capitalize ? 'capitalize' : ''}`}>
        {value || <span className="text-slate-400">Not specified</span>}
      </p>
    </div>
  );
}

// Add/Edit Employee Modal
function EmployeeFormModal({
  employee,
  departments,
  isOpen,
  onClose,
  onSave,
  isLoading,
}: {
  employee: UserDocument | null;
  departments: Department[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}) {
  const isEditing = !!employee;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    middleName: '',
    role: 'employee' as UserRole,
    departmentId: '',
    employeeId: '',
    hireDate: '',
    birthday: '',
    employmentStatus: 'regular' as string,
    mobileNumber: '',
    personalEmail: '',
    presentAddress: '',
    permanentAddress: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactNumber: '',
    bio: '',
  });

  useEffect(() => {
    if (employee) {
      // Handle Firestore Timestamp or Date for hireDate
      let hireDateStr = '';
      if (employee.hireDate) {
        const hireDate = employee.hireDate as any;
        if (hireDate.seconds) {
          // Firestore Timestamp
          hireDateStr = new Date(hireDate.seconds * 1000).toISOString().split('T')[0];
        } else if (hireDate instanceof Date) {
          hireDateStr = hireDate.toISOString().split('T')[0];
        } else if (typeof hireDate === 'string') {
          hireDateStr = hireDate;
        }
      }

      // Handle birthday
      let birthdayStr = '';
      if (employee.birthday) {
        const birthday = employee.birthday as any;
        if (birthday.seconds) {
          birthdayStr = new Date(birthday.seconds * 1000).toISOString().split('T')[0];
        } else if (birthday instanceof Date) {
          birthdayStr = birthday.toISOString().split('T')[0];
        } else if (typeof birthday === 'string') {
          birthdayStr = birthday;
        }
      } else if (employee.dateOfBirth) {
        const dob = employee.dateOfBirth as any;
        if (dob.seconds) {
          birthdayStr = new Date(dob.seconds * 1000).toISOString().split('T')[0];
        } else if (dob instanceof Date) {
          birthdayStr = dob.toISOString().split('T')[0];
        } else if (typeof dob === 'string') {
          birthdayStr = dob;
        }
      }

      setFormData({
        email: employee.email || '',
        password: '',
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        middleName: employee.middleName || '',
        role: employee.role || 'employee',
        departmentId: employee.departmentId || '',
        employeeId: employee.employeeId || '',
        hireDate: hireDateStr,
        birthday: birthdayStr,
        employmentStatus: employee.employmentStatus || 'regular',
        mobileNumber: employee.mobileNumber || '',
        personalEmail: employee.personalEmail || '',
        presentAddress: employee.presentAddress || '',
        permanentAddress: employee.permanentAddress || '',
        emergencyContactName: employee.emergencyContactName || '',
        emergencyContactRelationship: employee.emergencyContactRelationship || '',
        emergencyContactNumber: employee.emergencyContactNumber || '',
        bio: employee.bio || '',
      });
    } else {
      // Reset form for new employee
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        middleName: '',
        role: 'employee',
        departmentId: '',
        employeeId: '',
        hireDate: '',
        birthday: '',
        employmentStatus: 'regular',
        mobileNumber: '',
        personalEmail: '',
        presentAddress: '',
        permanentAddress: '',
        emergencyContactName: '',
        emergencyContactRelationship: '',
        emergencyContactNumber: '',
        bio: '',
      });
    }
  }, [employee, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update employee information' : 'Create a new employee account'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-6">
          {/* Account Information - Only for new employees */}
          {!isEditing && (
            <div className="rounded-xl border border-slate-200 p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                Account Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="employee@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Personal Information */}
          <div className="rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              Personal Information
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleChange('middleName', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Cake className="h-4 w-4 text-pink-500" />
                    Birthday <span className="text-xs text-slate-400">(for birthday leave)</span>
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => handleChange('birthday', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-blue-500" />
              Employment Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Employee ID
                </label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => handleChange('employeeId', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="AG_0001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                  <option value="payroll">Payroll</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Department
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => handleChange('departmentId', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Hire Date
                </label>
                <input
                  type="date"
                  value={formData.hireDate}
                  onChange={(e) => handleChange('hireDate', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Employment Status
                </label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) => handleChange('employmentStatus', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="regular">Regular</option>
                  <option value="probationary">Probationary</option>
                  <option value="contractual">Contractual</option>
                  <option value="part-time">Part-time</option>
                  <option value="resigned">Resigned</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-500" />
              Contact Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => handleChange('mobileNumber', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Personal Email
                </label>
                <input
                  type="email"
                  value={formData.personalEmail}
                  onChange={(e) => handleChange('personalEmail', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Present Address
                </label>
                <textarea
                  value={formData.presentAddress}
                  onChange={(e) => handleChange('presentAddress', e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Emergency Contact
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Relationship
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactRelationship}
                  onChange={(e) => handleChange('emergencyContactRelationship', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Contact Number
                </label>
                <input
                  type="tel"
                  value={formData.emergencyContactNumber}
                  onChange={(e) => handleChange('emergencyContactNumber', e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Save Changes' : 'Create Employee'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EmployeesContent() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<UserDocument[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [selectedEmployee, setSelectedEmployee] = useState<UserDocument | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [ConfirmDialog, confirm] = useConfirm(
    'Confirm Action',
    'Are you sure you want to change this employee\'s status?'
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeeList, departmentList] = await Promise.all([
        getAllEmployees(),
        getDepartments(),
      ]);
      setEmployees(employeeList);
      setDepartments(departmentList);
      return employeeList;
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load employees');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Refresh data and update selectedEmployee with fresh data (for career updates)
  const refreshEmployeeData = async () => {
    const employeeList = await fetchData();
    if (employeeList && selectedEmployee) {
      const updatedEmployee = employeeList.find(e => e.uid === selectedEmployee.uid);
      if (updatedEmployee) {
        setSelectedEmployee(updatedEmployee);
      }
    }
  };

  const getDepartmentById = (id: string | null) => {
    if (!id) return undefined;
    return departments.find(d => d.id === id);
  };

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        employee.displayName?.toLowerCase().includes(searchLower) ||
        employee.email?.toLowerCase().includes(searchLower) ||
        employee.employeeId?.toLowerCase().includes(searchLower) ||
        employee.firstName?.toLowerCase().includes(searchLower) ||
        employee.lastName?.toLowerCase().includes(searchLower);

      // Department filter
      const matchesDepartment = !filterDepartment || employee.departmentId === filterDepartment;

      // Role filter
      const matchesRole = !filterRole || employee.role === filterRole;

      // Status filter
      const matchesStatus = !filterStatus ||
        (filterStatus === 'active' && employee.isActive) ||
        (filterStatus === 'inactive' && !employee.isActive);

      return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
    });
  }, [employees, searchTerm, filterDepartment, filterRole, filterStatus]);

  // Stats
  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.isActive).length,
    inactive: employees.filter(e => !e.isActive).length,
    filtered: filteredEmployees.length,
  }), [employees, filteredEmployees]);

  const handleViewEmployee = (employee: UserDocument) => {
    setSelectedEmployee(employee);
    setIsDetailOpen(true);
  };

  const handleEditEmployee = (employee?: UserDocument) => {
    if (employee) {
      setSelectedEmployee(employee);
      setIsEditing(true);
    } else {
      setSelectedEmployee(null);
      setIsEditing(false);
    }
    setIsDetailOpen(false);
    setIsFormOpen(true);
  };

  const handleAddEmployee = async () => {
    setSelectedEmployee(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleSaveEmployee = async (formData: any) => {
    if (!user) return;

    try {
      setIsSaving(true);

      if (isEditing && selectedEmployee) {
        // Update existing employee
        const updates: Partial<UserDocument> = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName || undefined,
          displayName: `${formData.firstName} ${formData.lastName}`,
          role: formData.role,
          departmentId: formData.departmentId || null,
          employeeId: formData.employeeId || null,
          hireDate: formData.hireDate ? new Date(formData.hireDate) : undefined,
          employmentStatus: formData.employmentStatus || undefined,
          mobileNumber: formData.mobileNumber || undefined,
          personalEmail: formData.personalEmail || undefined,
          presentAddress: formData.presentAddress || undefined,
          permanentAddress: formData.permanentAddress || undefined,
          emergencyContactName: formData.emergencyContactName || undefined,
          emergencyContactRelationship: formData.emergencyContactRelationship || undefined,
          emergencyContactNumber: formData.emergencyContactNumber || undefined,
          bio: formData.bio || undefined,
        };

        await updateEmployee(selectedEmployee.uid, updates, user.uid);
        toast.success('Employee updated successfully!');
      } else {
        // Create new employee
        if (!formData.email || !formData.password) {
          toast.error('Email and password are required');
          return;
        }

        await createEmployee({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          departmentId: formData.departmentId || undefined,
          employeeId: formData.employeeId || undefined,
          hireDate: formData.hireDate ? new Date(formData.hireDate) : undefined,
          employmentStatus: formData.employmentStatus || undefined,
        }, user.uid);

        toast.success('Employee created successfully!');
      }

      setIsFormOpen(false);
      setSelectedEmployee(null);
      await fetchData();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      toast.error(error.message || 'Failed to save employee');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedEmployee || !user) return;

    const ok = await confirm();
    if (!ok) return;

    try {
      await toggleEmployeeStatus(selectedEmployee.uid, !selectedEmployee.isActive, user.uid);
      toast.success(`Employee ${selectedEmployee.isActive ? 'deactivated' : 'activated'} successfully!`);
      setIsDetailOpen(false);
      await fetchData();
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update employee status');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterDepartment('');
    setFilterRole('');
    setFilterStatus('');
  };

  const hasActiveFilters = searchTerm || filterDepartment || filterRole || filterStatus;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
            <p className="mt-4 text-slate-500">Loading employees...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ConfirmDialog />

      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees</h1>
          <p className="mt-1 text-slate-500">
            Manage your organization&apos;s workforce • {stats.total} total employees
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UserSeedButton
            createdBy={user?.uid || ''}
            departments={departments}
            onComplete={fetchData}
          />
          <button
            onClick={handleAddEmployee}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:scale-[1.02]"
          >
            <Plus className="h-5 w-5" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Total</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <UserCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
              <p className="text-xs text-slate-500">Active</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <UserX className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.inactive}</p>
              <p className="text-xs text-slate-500">Inactive</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Building2 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{departments.length}</p>
              <p className="text-xs text-slate-500">Departments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or employee ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 font-medium transition-colors ${showFilters || hasActiveFilters
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
          >
            <Filter className="h-5 w-5" />
            Filters
            {hasActiveFilters && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                {[filterDepartment, filterRole, filterStatus].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-4">
              {/* Department Filter */}
              <div className="min-w-[200px] flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              {/* Role Filter */}
              <div className="min-w-[150px] flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="hr">HR</option>
                  <option value="payroll">Payroll</option>
                  <option value="manager">Manager</option>
                  <option value="employee">Employee</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="min-w-[150px] flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        {hasActiveFilters && (
          <p className="text-sm text-slate-500">
            Showing {filteredEmployees.length} of {employees.length} employees
          </p>
        )}
      </div>

      {/* Employee Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Users className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">No employees found</h3>
          <p className="mt-2 text-slate-500">
            {hasActiveFilters
              ? 'Try adjusting your filters or search term'
              : 'Add your first employee to get started'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.uid}
              employee={employee}
              department={getDepartmentById(employee.departmentId)}
              onClick={() => handleViewEmployee(employee)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <EmployeeDetailModal
        employee={selectedEmployee}
        department={selectedEmployee ? getDepartmentById(selectedEmployee.departmentId) : undefined}
        departments={departments}
        allEmployees={employees}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onEdit={() => handleEditEmployee(selectedEmployee!)}
        onToggleStatus={handleToggleStatus}
        onRefresh={refreshEmployeeData}
        currentUserRole={user?.role || 'employee'}
        currentUserId={user?.uid || ''}
      />

      <EmployeeFormModal
        employee={isEditing ? selectedEmployee : null}
        departments={departments}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedEmployee(null);
        }}
        onSave={handleSaveEmployee}
        isLoading={isSaving}
      />
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
