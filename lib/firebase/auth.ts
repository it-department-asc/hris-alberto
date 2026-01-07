import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './config';
import { UserDocument, UserRole, RegistrationData } from '@/types';

// Create user document in Firestore
export async function createUserDocument(
  user: User,
  additionalData: { firstName: string; lastName: string; role?: UserRole }
): Promise<UserDocument> {
  const userRef = doc(db, 'users', user.uid);
  
  const displayName = `${additionalData.firstName} ${additionalData.lastName}`;
  
  const userData: UserDocument = {
    uid: user.uid,
    email: user.email!,
    displayName,
    role: additionalData.role || 'employee',
    
    // Personal Information
    firstName: additionalData.firstName,
    lastName: additionalData.lastName,
    middleName: undefined,
    dateOfBirth: undefined,
    gender: undefined,
    civilStatus: undefined,
    nationality: undefined,
    
    // Contact Information
    personalEmail: undefined,
    mobileNumber: undefined,
    telephoneNumber: undefined,
    presentAddress: undefined,
    permanentAddress: undefined,
    
    // Employment Information
    employeeId: null,
    departmentId: null,
    positionId: undefined,
    hireDate: undefined,
    employmentStatus: undefined,
    
    // Emergency Contact
    emergencyContactName: undefined,
    emergencyContactRelationship: undefined,
    emergencyContactNumber: undefined,
    
    // Profile
    profilePhotoUrl: undefined,
    bio: undefined,
    
    // System Fields
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    createdBy: undefined,
    updatedBy: undefined,
  };

  await setDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return userData;
}

// Get user document from Firestore
export async function getUserDocument(uid: string): Promise<UserDocument | null> {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate() || null,
    } as UserDocument;
  }

  return null;
}

// Update last login timestamp
export async function updateLastLogin(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    lastLoginAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

// Register new user
export async function registerUser(data: RegistrationData): Promise<UserDocument> {
  const { email, password, firstName, lastName } = data;

  // Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update display name in Firebase Auth
  await updateProfile(user, {
    displayName: `${firstName} ${lastName}`,
  });

  // Create user document in Firestore
  const userDocument = await createUserDocument(user, { firstName, lastName });

  return userDocument;
}

// Sign in user
export async function signIn(email: string, password: string): Promise<UserDocument> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Get user document
  const userDocument = await getUserDocument(user.uid);

  if (!userDocument) {
    throw new Error('User document not found. Please contact support.');
  }

  if (!userDocument.isActive) {
    await firebaseSignOut(auth);
    throw new Error('Your account has been deactivated. Please contact HR.');
  }

  // Update last login
  await updateLastLogin(user.uid);

  return userDocument;
}

// Sign out user
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// Send password reset email
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}
