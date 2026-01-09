import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { UserLeaveApprovers, LeaveApprover, LeaveTypeName } from '@/types';

// All leave types
export const ALL_LEAVE_TYPES: { type: LeaveTypeName; label: string; description: string }[] = [
  { type: 'vacation', label: 'Vacation Leave', description: 'Annual vacation leave (10 days/year)' },
  { type: 'sick', label: 'Sick Leave', description: 'Medical/sick leave (10 days/year)' },
  { type: 'emergency', label: 'Emergency Leave', description: 'Emergency situations (3 days/year)' },
  { type: 'birthday', label: 'Birthday Leave', description: 'Birthday off (1 day in birth month)' },
  { type: 'bereavement', label: 'Bereavement Leave', description: 'For loss of immediate family (5 days/year)' },
];

// Get default approvers (all null)
export function getDefaultApprovers(): LeaveApprover[] {
  return ALL_LEAVE_TYPES.map(lt => ({
    leaveType: lt.type,
    approverId: null,
  }));
}

// Get user leave approvers
export async function getUserLeaveApprovers(userId: string): Promise<UserLeaveApprovers | null> {
  try {
    const docRef = doc(db, 'userLeaveApprovers', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        approvers: data.approvers || getDefaultApprovers(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        updatedBy: data.updatedBy || '',
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user leave approvers:', error);
    throw error;
  }
}

// Create or update user leave approvers
export async function setUserLeaveApprovers(
  userId: string,
  approvers: LeaveApprover[],
  updatedBy: string
): Promise<void> {
  try {
    const docRef = doc(db, 'userLeaveApprovers', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        approvers,
        updatedAt: serverTimestamp(),
        updatedBy,
      });
    } else {
      await setDoc(docRef, {
        userId,
        approvers,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedBy,
      });
    }
  } catch (error) {
    console.error('Error setting user leave approvers:', error);
    throw error;
  }
}

// Update single leave type approver
export async function updateLeaveApprover(
  userId: string,
  leaveType: LeaveTypeName,
  approverId: string | null,
  updatedBy: string
): Promise<void> {
  try {
    const existing = await getUserLeaveApprovers(userId);
    let approvers = existing?.approvers || getDefaultApprovers();

    // Update the specific leave type
    const approverIndex = approvers.findIndex(a => a.leaveType === leaveType);
    if (approverIndex >= 0) {
      approvers[approverIndex].approverId = approverId;
    } else {
      approvers.push({ leaveType, approverId });
    }

    await setUserLeaveApprovers(userId, approvers, updatedBy);
  } catch (error) {
    console.error('Error updating leave approver:', error);
    throw error;
  }
}

// Real-time listener for user leave approvers
export function subscribeToUserLeaveApprovers(
  userId: string,
  callback: (approvers: UserLeaveApprovers | null) => void
): () => void {
  const docRef = doc(db, 'userLeaveApprovers', userId);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        id: docSnap.id,
        userId: data.userId,
        approvers: data.approvers || getDefaultApprovers(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        updatedBy: data.updatedBy || '',
      });
    } else {
      callback(null);
    }
  });
}

// Get approver for specific leave type
export function getApproverForLeaveType(
  approvers: LeaveApprover[] | null | undefined,
  leaveType: LeaveTypeName
): string | null {
  if (!approvers) return null;
  const approver = approvers.find(a => a.leaveType === leaveType);
  return approver?.approverId || null;
}
