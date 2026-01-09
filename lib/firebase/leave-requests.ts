import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { SimpleLeaveRequest, LeaveRequestStatus, LeaveTypeName } from '@/types';
import { createNotification } from './notifications';
import { getUserLeaveApprovers, getApproverForLeaveType } from './approvers';

// Create a leave request
export async function createLeaveRequest(
  employeeId: string,
  employeeName: string,
  leaveType: LeaveTypeName,
  startDate: Date,
  endDate: Date,
  reason: string
): Promise<string> {
  try {
    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Get the approver for this leave type
    const approversDoc = await getUserLeaveApprovers(employeeId);
    const approverId = getApproverForLeaveType(approversDoc?.approvers, leaveType);

    const docRef = await addDoc(collection(db, 'leaveRequests'), {
      employeeId,
      employeeName,
      leaveType,
      startDate: Timestamp.fromDate(start),
      endDate: Timestamp.fromDate(end),
      totalDays,
      reason,
      status: 'pending',
      approverId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Send notification to approver if exists
    if (approverId) {
      await createNotification(
        approverId,
        'leave_request',
        'New Leave Request',
        `${employeeName} has requested ${leaveType} leave from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
        { leaveRequestId: docRef.id, employeeId, leaveType }
      );
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating leave request:', error);
    throw error;
  }
}

// Get leave request by ID
export async function getLeaveRequest(requestId: string): Promise<SimpleLeaveRequest | null> {
  try {
    const docRef = doc(db, 'leaveRequests', requestId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        leaveType: data.leaveType,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        totalDays: data.totalDays,
        reason: data.reason,
        status: data.status,
        approverId: data.approverId,
        approverName: data.approverName,
        approvedAt: data.approvedAt?.toDate(),
        rejectedAt: data.rejectedAt?.toDate(),
        rejectionReason: data.rejectionReason,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting leave request:', error);
    throw error;
  }
}

// Get employee's leave requests
export async function getEmployeeLeaveRequests(employeeId: string): Promise<SimpleLeaveRequest[]> {
  try {
    const q = query(
      collection(db, 'leaveRequests'),
      where('employeeId', '==', employeeId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        leaveType: data.leaveType,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        totalDays: data.totalDays,
        reason: data.reason,
        status: data.status,
        approverId: data.approverId,
        approverName: data.approverName,
        approvedAt: data.approvedAt?.toDate(),
        rejectedAt: data.rejectedAt?.toDate(),
        rejectionReason: data.rejectionReason,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Error getting employee leave requests:', error);
    throw error;
  }
}

// Get pending approvals for an approver
export async function getPendingApprovalsForApprover(approverId: string): Promise<SimpleLeaveRequest[]> {
  try {
    const q = query(
      collection(db, 'leaveRequests'),
      where('approverId', '==', approverId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        leaveType: data.leaveType,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        totalDays: data.totalDays,
        reason: data.reason,
        status: data.status,
        approverId: data.approverId,
        approverName: data.approverName,
        approvedAt: data.approvedAt?.toDate(),
        rejectedAt: data.rejectedAt?.toDate(),
        rejectionReason: data.rejectionReason,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error('Error getting pending approvals:', error);
    throw error;
  }
}

// Approve a leave request
export async function approveLeaveRequest(
  requestId: string,
  approverId: string,
  approverName: string
): Promise<void> {
  try {
    const docRef = doc(db, 'leaveRequests', requestId);
    const request = await getLeaveRequest(requestId);

    if (!request) throw new Error('Leave request not found');

    await updateDoc(docRef, {
      status: 'approved',
      approverName,
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Notify employee
    await createNotification(
      request.employeeId,
      'leave_approved',
      'Leave Request Approved',
      `Your ${request.leaveType} leave request has been approved by ${approverName}`,
      { leaveRequestId: requestId }
    );
  } catch (error) {
    console.error('Error approving leave request:', error);
    throw error;
  }
}

// Reject a leave request
export async function rejectLeaveRequest(
  requestId: string,
  approverId: string,
  approverName: string,
  rejectionReason?: string
): Promise<void> {
  try {
    const docRef = doc(db, 'leaveRequests', requestId);
    const request = await getLeaveRequest(requestId);

    if (!request) throw new Error('Leave request not found');

    await updateDoc(docRef, {
      status: 'rejected',
      approverName,
      rejectedAt: serverTimestamp(),
      rejectionReason: rejectionReason || null,
      updatedAt: serverTimestamp(),
    });

    // Notify employee
    const reasonText = rejectionReason ? ` Reason: ${rejectionReason}` : '';
    await createNotification(
      request.employeeId,
      'leave_rejected',
      'Leave Request Rejected',
      `Your ${request.leaveType} leave request has been rejected by ${approverName}.${reasonText}`,
      { leaveRequestId: requestId }
    );
  } catch (error) {
    console.error('Error rejecting leave request:', error);
    throw error;
  }
}

// Cancel a leave request (by employee)
export async function cancelLeaveRequest(requestId: string): Promise<void> {
  try {
    const docRef = doc(db, 'leaveRequests', requestId);
    await updateDoc(docRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error cancelling leave request:', error);
    throw error;
  }
}

// Real-time listener for employee's leave requests
export function subscribeToEmployeeLeaveRequests(
  employeeId: string,
  callback: (requests: SimpleLeaveRequest[]) => void
): () => void {
  const q = query(
    collection(db, 'leaveRequests'),
    where('employeeId', '==', employeeId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        leaveType: data.leaveType,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        totalDays: data.totalDays,
        reason: data.reason,
        status: data.status,
        approverId: data.approverId,
        approverName: data.approverName,
        approvedAt: data.approvedAt?.toDate(),
        rejectedAt: data.rejectedAt?.toDate(),
        rejectionReason: data.rejectionReason,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
    callback(requests);
  });
}

// Alias for subscribeToEmployeeLeaveRequests (for backward compatibility)
export const subscribeToUserLeaveRequests = subscribeToEmployeeLeaveRequests;

// Real-time listener for pending approvals
export function subscribeToPendingApprovals(
  approverId: string,
  callback: (requests: SimpleLeaveRequest[]) => void
): () => void {
  const q = query(
    collection(db, 'leaveRequests'),
    where('approverId', '==', approverId),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        leaveType: data.leaveType,
        startDate: data.startDate?.toDate() || new Date(),
        endDate: data.endDate?.toDate() || new Date(),
        totalDays: data.totalDays,
        reason: data.reason,
        status: data.status,
        approverId: data.approverId,
        approverName: data.approverName,
        approvedAt: data.approvedAt?.toDate(),
        rejectedAt: data.rejectedAt?.toDate(),
        rejectionReason: data.rejectionReason,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
    callback(requests);
  });
}
