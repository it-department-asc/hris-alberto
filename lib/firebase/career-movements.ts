import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { CareerMovement, MovementType } from '@/types';

const COLLECTION_NAME = 'careerMovements';

// Get all career movements for an employee
export async function getEmployeeCareerMovements(employeeId: string): Promise<CareerMovement[]> {
  try {
    const movementsRef = collection(db, COLLECTION_NAME);
    const q = query(
      movementsRef,
      where('employeeId', '==', employeeId),
      orderBy('effectiveDate', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        effectiveDate: data.effectiveDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as CareerMovement;
    });
  } catch (error) {
    console.error('Error fetching career movements:', error);
    throw error;
  }
}

// Get a single career movement by ID
export async function getCareerMovementById(id: string): Promise<CareerMovement | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        effectiveDate: data.effectiveDate?.toDate() || new Date(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate(),
      } as CareerMovement;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching career movement:', error);
    throw error;
  }
}

// Get the latest career movement for an employee (to get current position/salary)
export async function getLatestCareerMovement(employeeId: string): Promise<CareerMovement | null> {
  try {
    const movements = await getEmployeeCareerMovements(employeeId);
    return movements.length > 0 ? movements[0] : null;
  } catch (error) {
    console.error('Error fetching latest career movement:', error);
    throw error;
  }
}

// Create a new career movement
export async function createCareerMovement(
  data: {
    employeeId: string;
    movementType: MovementType;
    effectiveDate: Date;
    jobTitle: string;
    departmentId: string | null;
    salary: number;
    previousJobTitle?: string;
    previousDepartmentId?: string | null;
    previousSalary?: number;
    remarks?: string;
  },
  createdBy: string
): Promise<CareerMovement> {
  try {
    const movementsRef = collection(db, COLLECTION_NAME);
    
    // Build the document, excluding undefined values (Firebase doesn't accept undefined)
    const newMovement: Record<string, unknown> = {
      employeeId: data.employeeId,
      movementType: data.movementType,
      effectiveDate: Timestamp.fromDate(data.effectiveDate),
      jobTitle: data.jobTitle,
      departmentId: data.departmentId,
      salary: data.salary,
      createdAt: serverTimestamp(),
      createdBy,
    };
    
    // Only add optional fields if they have values
    if (data.previousJobTitle !== undefined) {
      newMovement.previousJobTitle = data.previousJobTitle;
    }
    if (data.previousDepartmentId !== undefined) {
      newMovement.previousDepartmentId = data.previousDepartmentId;
    }
    if (data.previousSalary !== undefined) {
      newMovement.previousSalary = data.previousSalary;
    }
    if (data.remarks) {
      newMovement.remarks = data.remarks;
    }
    
    const docRef = await addDoc(movementsRef, newMovement);
    
    // Also update the user's current job title and department
    const userRef = doc(db, 'users', data.employeeId);
    await updateDoc(userRef, {
      jobTitle: data.jobTitle,
      departmentId: data.departmentId,
      updatedAt: serverTimestamp(),
      updatedBy: createdBy,
    });
    
    return {
      id: docRef.id,
      ...data,
      createdAt: new Date(),
      createdBy,
    };
  } catch (error) {
    console.error('Error creating career movement:', error);
    throw error;
  }
}

// Update a career movement
export async function updateCareerMovement(
  id: string,
  data: Partial<{
    movementType: MovementType;
    effectiveDate: Date;
    jobTitle: string;
    departmentId: string | null;
    salary: number;
    remarks?: string;
  }>,
  updatedBy: string
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    
    // Get the current movement to check if it's the latest
    const currentDoc = await getDoc(docRef);
    if (!currentDoc.exists()) {
      throw new Error('Career movement not found');
    }
    
    const currentData = currentDoc.data();
    
    const updateData: any = {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy,
    };
    
    if (data.effectiveDate) {
      updateData.effectiveDate = Timestamp.fromDate(data.effectiveDate);
    }
    
    await updateDoc(docRef, updateData);
    
    // Check if this is the latest movement and update user accordingly
    const movements = await getEmployeeCareerMovements(currentData.employeeId);
    if (movements.length > 0 && movements[0].id === id) {
      const userRef = doc(db, 'users', currentData.employeeId);
      await updateDoc(userRef, {
        jobTitle: data.jobTitle || currentData.jobTitle,
        departmentId: data.departmentId !== undefined ? data.departmentId : currentData.departmentId,
        updatedAt: serverTimestamp(),
        updatedBy,
      });
    }
  } catch (error) {
    console.error('Error updating career movement:', error);
    throw error;
  }
}

// Delete a career movement
export async function deleteCareerMovement(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting career movement:', error);
    throw error;
  }
}

// Helper function to determine movement type based on changes
export function determineMovementType(
  previousJobTitle: string | undefined,
  newJobTitle: string,
  previousSalary: number | undefined,
  newSalary: number,
  previousDepartmentId: string | null | undefined,
  newDepartmentId: string | null
): MovementType {
  // If no previous data, it's a hire
  if (!previousJobTitle && !previousSalary) {
    return 'hire';
  }
  
  // If department changed but not position
  if (previousDepartmentId !== newDepartmentId && previousJobTitle === newJobTitle) {
    return 'transfer';
  }
  
  // If only salary changed
  if (previousJobTitle === newJobTitle && previousSalary !== newSalary) {
    return 'salary_adjustment';
  }
  
  // If position changed (could be promotion or demotion based on salary)
  if (previousJobTitle !== newJobTitle) {
    if (previousSalary && newSalary > previousSalary) {
      return 'promotion';
    } else if (previousSalary && newSalary < previousSalary) {
      return 'demotion';
    }
    return 'promotion'; // Default to promotion if we can't determine
  }
  
  return 'salary_adjustment';
}
