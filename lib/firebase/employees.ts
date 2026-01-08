import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  doc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  addDoc,
  setDoc
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { db, auth } from './config';
import { UserDocument, UserRole } from '@/types';

// ============================================
// EMPLOYEE FUNCTIONS
// ============================================

export async function getAllEmployees(): Promise<UserDocument[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('displayName'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      lastLoginAt: doc.data().lastLoginAt?.toDate() || null,
      dateOfBirth: doc.data().dateOfBirth?.toDate(),
      hireDate: doc.data().hireDate?.toDate(),
    })) as UserDocument[];
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
}

export async function getActiveEmployees(): Promise<UserDocument[]> {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('isActive', '==', true), orderBy('displayName'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      lastLoginAt: doc.data().lastLoginAt?.toDate() || null,
      dateOfBirth: doc.data().dateOfBirth?.toDate(),
      hireDate: doc.data().hireDate?.toDate(),
    })) as UserDocument[];
  } catch (error) {
    console.error('Error fetching active employees:', error);
    throw error;
  }
}

export async function getEmployeeById(uid: string): Promise<UserDocument | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        uid: userSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastLoginAt: data.lastLoginAt?.toDate() || null,
        dateOfBirth: data.dateOfBirth?.toDate(),
        hireDate: data.hireDate?.toDate(),
      } as UserDocument;
    }

    return null;
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw error;
  }
}

export async function updateEmployee(uid: string, updates: Partial<UserDocument>, updatedBy: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);

    // Remove read-only fields from updates
    const { uid: _, createdAt, createdBy, ...updateData } = updates;

    // Filter out undefined values - Firestore doesn't accept undefined
    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== undefined)
    );

    await updateDoc(userRef, {
      ...cleanedData,
      updatedAt: serverTimestamp(),
      updatedBy,
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
}

export async function createEmployee(employeeData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId?: string;
  employeeId?: string;
  middleName?: string;
  mobileNumber?: string;
  personalEmail?: string;
  hireDate?: Date;
  employmentStatus?: string;
}, createdBy: string): Promise<UserDocument> {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, employeeData.email, employeeData.password);
    const user = userCredential.user;

    // Update display name in Firebase Auth
    const displayName = `${employeeData.firstName} ${employeeData.lastName}`;
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    const userData: Omit<UserDocument, 'createdAt' | 'updatedAt'> & { createdAt: any; updatedAt: any } = {
      uid: user.uid,
      email: employeeData.email,
      displayName,
      role: employeeData.role,
      firstName: employeeData.firstName,
      lastName: employeeData.lastName,
      middleName: employeeData.middleName,
      employeeId: employeeData.employeeId || null,
      departmentId: employeeData.departmentId || null,
      mobileNumber: employeeData.mobileNumber,
      personalEmail: employeeData.personalEmail,
      hireDate: employeeData.hireDate,
      employmentStatus: employeeData.employmentStatus as any,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: null,
      createdBy,
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    return {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as UserDocument;
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
}

export async function toggleEmployeeStatus(uid: string, isActive: boolean, updatedBy: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      isActive,
      updatedAt: serverTimestamp(),
      updatedBy,
    });
  } catch (error) {
    console.error('Error toggling employee status:', error);
    throw error;
  }
}

// Generate next employee ID
export async function generateNextEmployeeId(): Promise<string> {
  try {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    
    let maxNumber = 0;
    snapshot.docs.forEach(doc => {
      const employeeId = doc.data().employeeId;
      if (employeeId && employeeId.startsWith('AG_')) {
        const num = parseInt(employeeId.replace('AG_', ''), 10);
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    const nextNumber = maxNumber + 1;
    return `AG_${nextNumber.toString().padStart(4, '0')}`;
  } catch (error) {
    console.error('Error generating employee ID:', error);
    return `AG_${Date.now().toString().slice(-4)}`;
  }
}
