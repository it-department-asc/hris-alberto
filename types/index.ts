// ============================================
// USER & AUTHENTICATION TYPES
// ============================================

export type UserRole = 'admin' | 'hr' | 'payroll' | 'manager' | 'employee';

export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;

  // Personal Information
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth?: Date;
  gender?: Gender;
  civilStatus?: CivilStatus;
  nationality?: string;

  // Contact Information
  personalEmail?: string;
  mobileNumber?: string;
  telephoneNumber?: string;
  presentAddress?: string;
  permanentAddress?: string;

  // Employment Information
  employeeId: string | null;
  departmentId: string | null;
  positionId?: string;
  jobTitle?: string; // Current job title from latest career movement
  hireDate?: Date;
  employmentStatus?: EmploymentStatus;

  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactNumber?: string;

  // Profile
  profilePhotoUrl?: string;
  bio?: string;

  // System Fields
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  createdBy?: string;
  updatedBy?: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthState {
  user: UserDocument | null;
  loading: boolean;
  error: string | null;
}

// ============================================
// DEPARTMENT TYPES
// ============================================

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  managerId: string | null;
  parentDepartmentId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// POSITION/JOB TITLE TYPES
// ============================================

export interface Position {
  id: string;
  title: string;
  code: string;
  departmentId: string;
  level: number; // 1-8: Entry to Executive
  description: string | null;
  minSalary: number;
  maxSalary: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// EMPLOYEE TYPES
// ============================================

export type EmploymentStatus = 'probationary' | 'regular' | 'contractual' | 'part-time' | 'resigned' | 'terminated';
export type Gender = 'male' | 'female' | 'other';
export type CivilStatus = 'single' | 'married' | 'widowed' | 'separated' | 'divorced';

export interface Employee {
  id: string;
  
  // Basic Information
  employeeNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffix: string | null;
  nickname: string | null;
  
  // Personal Information
  dateOfBirth: Date;
  gender: Gender;
  civilStatus: CivilStatus;
  nationality: string;
  
  // Contact Information
  email: string;
  personalEmail: string | null;
  mobileNumber: string;
  telephoneNumber: string | null;
  
  // Address
  presentAddress: Address;
  permanentAddress: Address;
  
  // Employment Information
  departmentId: string;
  positionId: string;
  reportsTo: string | null;
  employmentStatus: EmploymentStatus;
  dateHired: Date;
  dateRegularized: Date | null;
  dateSeparated: Date | null;
  separationReason: string | null;
  
  // Compensation
  basicSalary: number;
  payFrequency: 'monthly' | 'semi-monthly' | 'weekly';
  bankName: string | null;
  bankAccountNumber: string | null;
  
  // Government IDs
  sssNumber: string | null;
  philHealthNumber: string | null;
  pagIbigNumber: string | null;
  tinNumber: string | null;
  
  // System
  userId: string | null;
  profilePhotoUrl: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}

export interface Address {
  street: string;
  barangay: string | null;
  city: string;
  province: string;
  zipCode: string;
  country: string;
}

// ============================================
// EMERGENCY CONTACT TYPES
// ============================================

export interface EmergencyContact {
  id: string;
  employeeId: string;
  name: string;
  relationship: string;
  mobileNumber: string;
  telephoneNumber: string | null;
  address: string | null;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ATTENDANCE TYPES
// ============================================

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day' | 'on-leave' | 'holiday' | 'rest-day';

export interface Attendance {
  id: string;
  employeeId: string;
  date: Date;
  
  timeIn: Date | null;
  timeOut: Date | null;
  breakStart: Date | null;
  breakEnd: Date | null;
  
  hoursWorked: number;
  lateMinutes: number;
  undertimeMinutes: number;
  overtimeMinutes: number;
  
  status: AttendanceStatus;
  remarks: string | null;
  
  isManualEntry: boolean;
  originalTimeIn: Date | null;
  originalTimeOut: Date | null;
  correctedBy: string | null;
  correctionReason: string | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkSchedule {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  workDays: number[];
  graceMinutes: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// LEAVE TYPES
// ============================================

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  description: string | null;
  defaultDays: number;
  isPaid: boolean;
  requiresDocument: boolean;
  allowHalfDay: boolean;
  allowCarryOver: boolean;
  maxCarryOverDays: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  carriedOverDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  
  startDate: Date;
  endDate: Date;
  totalDays: number;
  isHalfDay: boolean;
  halfDayPeriod: 'AM' | 'PM' | null;
  
  reason: string;
  attachmentUrls: string[];
  
  status: LeaveRequestStatus;
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// OVERTIME TYPES
// ============================================

export type OvertimeStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface OvertimeRequest {
  id: string;
  employeeId: string;
  date: Date;
  startTime: string;
  endTime: string;
  totalHours: number;
  reason: string;
  
  status: OvertimeStatus;
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  
  actualStartTime: string | null;
  actualEndTime: string | null;
  actualHours: number | null;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// PAYROLL TYPES
// ============================================

export type PayrollPeriodStatus = 'draft' | 'processing' | 'completed' | 'locked';

export interface PayrollPeriod {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  payDate: Date;
  
  status: PayrollPeriodStatus;
  
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  
  processedBy: string | null;
  processedAt: Date | null;
  lockedBy: string | null;
  lockedAt: Date | null;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface PayrollRecord {
  id: string;
  payrollPeriodId: string;
  employeeId: string;
  
  // Earnings
  basicPay: number;
  overtimePay: number;
  holidayPay: number;
  nightDifferential: number;
  allowances: number;
  otherEarnings: number;
  grossPay: number;
  
  // Deductions
  sssDeduction: number;
  philHealthDeduction: number;
  pagIbigDeduction: number;
  withholdingTax: number;
  lateDeduction: number;
  undertimeDeduction: number;
  absentDeduction: number;
  loanDeductions: number;
  otherDeductions: number;
  totalDeductions: number;
  
  netPay: number;
  
  daysWorked: number;
  daysAbsent: number;
  totalLateMinutes: number;
  totalUndertimeMinutes: number;
  totalOvertimeHours: number;
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SALARY HISTORY TYPES
// ============================================

export type SalaryChangeReason = 'hiring' | 'promotion' | 'merit-increase' | 'adjustment' | 'demotion';

export interface SalaryHistory {
  id: string;
  employeeId: string;
  previousSalary: number;
  newSalary: number;
  changeAmount: number;
  changePercentage: number;
  reason: SalaryChangeReason;
  remarks: string | null;
  effectiveDate: Date;
  approvedBy: string;
  createdAt: Date;
}

// ============================================
// DOCUMENT TYPES
// ============================================

export type DocumentType = 
  | 'resume'
  | 'contract'
  | 'nbi-clearance'
  | 'medical-certificate'
  | 'diploma'
  | 'transcript'
  | 'government-id'
  | 'certificate'
  | 'performance-review'
  | 'disciplinary'
  | 'other';

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  type: DocumentType;
  name: string;
  description: string | null;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  expiryDate: Date | null;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// ANNOUNCEMENT TYPES
// ============================================

export type AnnouncementPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  
  targetDepartments: string[];
  targetRoles: UserRole[];
  
  publishedAt: Date;
  expiresAt: Date | null;
  isPublished: boolean;
  
  attachmentUrls: string[];
  
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// HOLIDAY TYPES
// ============================================

export type HolidayType = 'regular' | 'special-non-working' | 'special-working';

export interface Holiday {
  id: string;
  name: string;
  date: Date;
  type: HolidayType;
  isRecurring: boolean;
  year: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// AUDIT LOG TYPES
// ============================================

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'approve' | 'reject';

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  collection: string;
  documentId: string;
  previousData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

// ============================================
// SETTINGS TYPES
// ============================================

export interface SystemSettings {
  id: string;
  companyName: string;
  companyLogo: string | null;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  
  sssEmployerShare: number;
  philHealthEmployerShare: number;
  pagIbigEmployerShare: number;
  
  defaultWorkScheduleId: string;
  
  updatedAt: Date;
  updatedBy: string;
}

// ============================================
// CAREER MOVEMENT TYPES
// ============================================

export type MovementType = 'hire' | 'promotion' | 'transfer' | 'salary_adjustment' | 'demotion' | 'regularization';

export interface CareerMovement {
  id: string;
  
  // Employee Reference
  employeeId: string; // uid from users collection
  
  // Movement Details
  movementType: MovementType;
  effectiveDate: Date;
  
  // Position Information
  jobTitle: string;
  departmentId: string | null;
  
  // Salary Information (not displayed in profile)
  salary: number;
  
  // Previous values (for tracking changes)
  previousJobTitle?: string;
  previousDepartmentId?: string | null;
  previousSalary?: number;
  
  // Additional Info
  remarks?: string;
  
  // System Fields
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy?: string;
}
// ============================================
// PERMISSION TYPES
// ============================================

export type PermissionLevel = 'none' | 'view' | 'edit';

export type ModuleName = 
  | 'dashboard'
  | 'employees'
  | 'departments'
  | 'attendance'
  | 'leave'
  | 'payroll'
  | 'organization'
  | 'org-chart'
  | 'settings'
  | 'policy-advisor';

export interface ModulePermission {
  module: ModuleName;
  level: PermissionLevel;
}

export interface UserPermissions {
  id: string;
  userId: string;
  permissions: ModulePermission[];
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

// ============================================
// LEAVE APPROVER TYPES
// ============================================

export type LeaveTypeName = 'vacation' | 'sick' | 'emergency' | 'birthday' | 'bereavement';

// Leave balance limits per year
export const LEAVE_LIMITS: Record<LeaveTypeName, number> = {
  vacation: 10,
  sick: 10,
  emergency: 3,
  birthday: 1,
  bereavement: 5,
};

export interface LeaveApprover {
  leaveType: LeaveTypeName;
  approverId: string | null; // userId of approver
}

export interface UserLeaveApprovers {
  id: string;
  userId: string;
  approvers: LeaveApprover[];
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
}

// ============================================
// SIMPLE LEAVE REQUEST TYPES (for approval workflow)
// ============================================

export interface SimpleLeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveTypeName;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  reason: string;
  status: LeaveRequestStatus;
  approverId: string | null;
  approverName?: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationType = 
  | 'leave_request'
  | 'leave_approved'
  | 'leave_rejected'
  | 'permission_updated'
  | 'approver_updated'
  | 'announcement'
  | 'general';

export interface Notification {
  id: string;
  userId: string; // recipient
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>; // additional data like leaveRequestId
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}