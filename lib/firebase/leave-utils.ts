import { LeaveTypeName, LEAVE_LIMITS, SimpleLeaveRequest } from '@/types';

/**
 * Calculate working days between two dates (excludes weekends)
 */
export function getWorkingDaysBetween(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Get the minimum date for vacation leave (5 working days from today)
 */
export function getMinVacationLeaveDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let workingDaysCount = 0;
  const result = new Date(today);
  
  while (workingDaysCount < 5) {
    result.setDate(result.getDate() + 1);
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not weekend
      workingDaysCount++;
    }
  }
  
  return result;
}

/**
 * Check if a date is valid for vacation leave (at least 5 working days from now)
 */
export function isValidVacationLeaveDate(date: Date): boolean {
  const minDate = getMinVacationLeaveDate();
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate >= minDate;
}

/**
 * Check if a date is in the user's birth month
 */
export function isInBirthMonth(date: Date, birthday: Date | null | undefined): boolean {
  if (!birthday) return false;
  const birthdayDate = birthday instanceof Date ? birthday : new Date(birthday);
  return date.getMonth() === birthdayDate.getMonth();
}

/**
 * Get start and end of the user's birth month for the current/next occurrence
 */
export function getBirthMonthRange(birthday: Date | null | undefined): { start: Date; end: Date } | null {
  if (!birthday) return null;
  
  const birthdayDate = birthday instanceof Date ? birthday : new Date(birthday);
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Get birth month in current year
  const birthMonth = birthdayDate.getMonth();
  let year = currentYear;
  
  // If birth month has passed this year, use next year
  if (birthMonth < today.getMonth()) {
    year = currentYear + 1;
  }
  
  const start = new Date(year, birthMonth, 1);
  const end = new Date(year, birthMonth + 1, 0); // Last day of month
  
  return { start, end };
}

/**
 * Calculate used leave days for a specific leave type from approved/pending requests
 */
export function calculateUsedLeaveDays(
  requests: SimpleLeaveRequest[],
  leaveType: LeaveTypeName,
  year: number = new Date().getFullYear()
): number {
  return requests
    .filter(r => {
      const requestYear = new Date(r.startDate).getFullYear();
      return r.leaveType === leaveType && 
             (r.status === 'approved' || r.status === 'pending') &&
             requestYear === year;
    })
    .reduce((total, r) => total + r.totalDays, 0);
}

/**
 * Get leave balance for a specific leave type
 */
export function getLeaveBalance(
  requests: SimpleLeaveRequest[],
  leaveType: LeaveTypeName,
  year: number = new Date().getFullYear()
): { total: number; used: number; remaining: number } {
  const total = LEAVE_LIMITS[leaveType];
  const used = calculateUsedLeaveDays(requests, leaveType, year);
  const remaining = Math.max(0, total - used);
  
  return { total, used, remaining };
}

/**
 * Get all leave balances for an employee
 */
export function getAllLeaveBalances(
  requests: SimpleLeaveRequest[],
  year: number = new Date().getFullYear()
): Record<LeaveTypeName, { total: number; used: number; remaining: number }> {
  const leaveTypes: LeaveTypeName[] = ['vacation', 'sick', 'emergency', 'birthday', 'bereavement'];
  
  return leaveTypes.reduce((acc, type) => {
    acc[type] = getLeaveBalance(requests, type, year);
    return acc;
  }, {} as Record<LeaveTypeName, { total: number; used: number; remaining: number }>);
}

/**
 * Validate leave request before submission
 */
export function validateLeaveRequest(
  leaveType: LeaveTypeName,
  startDate: Date,
  endDate: Date,
  existingRequests: SimpleLeaveRequest[],
  birthday?: Date | null
): { valid: boolean; error?: string } {
  const year = new Date().getFullYear();
  const totalDays = getWorkingDaysBetween(startDate, endDate);
  const balance = getLeaveBalance(existingRequests, leaveType, year);
  
  // Check remaining balance
  if (totalDays > balance.remaining) {
    return { 
      valid: false, 
      error: `Insufficient ${leaveType} leave balance. You have ${balance.remaining} day(s) remaining.` 
    };
  }
  
  // Vacation leave: must be filed 5 working days in advance
  if (leaveType === 'vacation') {
    if (!isValidVacationLeaveDate(startDate)) {
      const minDate = getMinVacationLeaveDate();
      return { 
        valid: false, 
        error: `Vacation leave must be filed at least 5 working days in advance. Earliest date: ${minDate.toLocaleDateString()}` 
      };
    }
  }
  
  // Birthday leave: must be in birth month
  if (leaveType === 'birthday') {
    if (!birthday) {
      return { 
        valid: false, 
        error: 'Birthday not set in your profile. Please contact HR to update your birthday.' 
      };
    }
    
    if (!isInBirthMonth(startDate, birthday) || !isInBirthMonth(endDate, birthday)) {
      const birthdayDate = birthday instanceof Date ? birthday : new Date(birthday);
      const monthName = birthdayDate.toLocaleString('default', { month: 'long' });
      return { 
        valid: false, 
        error: `Birthday leave can only be taken during your birth month (${monthName}).` 
      };
    }
    
    // Birthday leave is only 1 day
    if (totalDays > 1) {
      return { 
        valid: false, 
        error: 'Birthday leave is limited to 1 day only.' 
      };
    }
  }
  
  return { valid: true };
}

/**
 * Format date for input field (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}
