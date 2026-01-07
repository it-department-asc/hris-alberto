import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { UserDocument } from '@/types';

// ============================================
// USER PROFILE FUNCTIONS
// ============================================

export async function getUserProfile(uid: string): Promise<UserDocument | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
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
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(uid: string, updates: Partial<UserDocument>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);

    // Remove read-only fields from updates
    const { uid: _, createdAt, createdBy, ...updateData } = updates;

    await updateDoc(userRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
      updatedBy: uid, // Current user updating their own profile
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}