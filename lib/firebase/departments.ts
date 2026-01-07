import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from './config';
import { Department } from '@/types';

// ============================================
// DEPARTMENT FUNCTIONS
// ============================================

export async function getDepartments(): Promise<Department[]> {
  try {
    const departmentsRef = collection(db, 'departments');
    const q = query(departmentsRef, where('isActive', '==', true), orderBy('name'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Department[];
  } catch (error) {
    console.error('Error fetching departments:', error);
    throw error;
  }
}

export async function getDepartmentStats(departmentId: string, managerId: string | null): Promise<{
  employeeCount: number;
  managerName: string | null;
}> {
  try {
    // Get employee count for this department from users collection
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('departmentId', '==', departmentId), where('isActive', '==', true));
    const userSnapshot = await getDocs(userQuery);
    const employeeCount = userSnapshot.size;

    // Get manager name if managerId is provided
    let managerName = null;
    if (managerId) {
      try {
        const managerDoc = await getDoc(doc(db, 'users', managerId));
        if (managerDoc.exists()) {
          managerName = managerDoc.data().displayName || null;
        }
      } catch (error) {
        console.warn('Could not fetch manager name:', error);
      }
    }

    return { employeeCount, managerName };
  } catch (error) {
    console.error('Error fetching department stats:', error);
    return { employeeCount: 0, managerName: null };
  }
}