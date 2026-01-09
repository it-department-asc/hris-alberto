import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';
import { createNotification } from './notifications';
import { getAllEmployees } from './employees';

// Upload announcement image to Firebase Storage
export async function uploadAnnouncementImage(file: File): Promise<string> {
  try {
    const timestamp = Date.now();
    const fileName = `announcements/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Delete announcement image from Firebase Storage
export async function deleteAnnouncementImage(imageUrl: string): Promise<void> {
  try {
    // Extract the path from the URL
    const storageRef = ref(storage, imageUrl);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    // Don't throw - image might already be deleted
  }
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'event' | 'policy' | 'urgent' | 'celebration';
  priority: 'low' | 'normal' | 'high';
  imageUrl?: string;
  authorId: string;
  authorName: string;
  isPinned: boolean;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnnouncementInput {
  title: string;
  content: string;
  category: Announcement['category'];
  priority: Announcement['priority'];
  imageUrl?: string;
  isPinned?: boolean;
  expiresAt?: Date;
}

// Create a new announcement
export async function createAnnouncement(
  authorId: string,
  authorName: string,
  data: AnnouncementInput
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'announcements'), {
      title: data.title,
      content: data.content,
      category: data.category,
      priority: data.priority,
      imageUrl: data.imageUrl || null,
      authorId,
      authorName,
      isPinned: data.isPinned || false,
      isActive: true,
      expiresAt: data.expiresAt ? Timestamp.fromDate(data.expiresAt) : null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Notify all employees about the new announcement
    const employees = await getAllEmployees();
    const notificationPromises = employees.map(emp => 
      createNotification(
        emp.uid,
        'announcement',
        data.priority === 'high' || data.priority === 'normal' 
          ? `📢 New Announcement: ${data.title}`
          : `New Announcement: ${data.title}`,
        data.content.substring(0, 100) + (data.content.length > 100 ? '...' : ''),
        { link: `/bulletin-board?highlight=${docRef.id}`, announcementId: docRef.id }
      )
    );

    await Promise.all(notificationPromises);

    return docRef.id;
  } catch (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
}

// Update an announcement
export async function updateAnnouncement(
  announcementId: string,
  data: Partial<AnnouncementInput>
): Promise<void> {
  try {
    const docRef = doc(db, 'announcements', announcementId);
    
    // Build update object, filtering out undefined values
    const updateData: Record<string, any> = {
      updatedAt: serverTimestamp(),
    };
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;
    if (data.isPinned !== undefined) updateData.isPinned = data.isPinned;
    // For expiresAt, use null to clear the field if not provided
    if ('expiresAt' in data) {
      updateData.expiresAt = data.expiresAt ? Timestamp.fromDate(data.expiresAt) : null;
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error('Error updating announcement:', error);
    throw error;
  }
}

// Delete an announcement
export async function deleteAnnouncement(announcementId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'announcements', announcementId));
  } catch (error) {
    console.error('Error deleting announcement:', error);
    throw error;
  }
}

// Toggle pin status
export async function toggleAnnouncementPin(announcementId: string, isPinned: boolean): Promise<void> {
  try {
    const docRef = doc(db, 'announcements', announcementId);
    await updateDoc(docRef, {
      isPinned,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error toggling pin:', error);
    throw error;
  }
}

// Get single announcement
export async function getAnnouncement(announcementId: string): Promise<Announcement | null> {
  try {
    const docSnap = await getDoc(doc(db, 'announcements', announcementId));
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        expiresAt: data.expiresAt?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Announcement;
    }
    return null;
  } catch (error) {
    console.error('Error getting announcement:', error);
    throw error;
  }
}

// Subscribe to all active announcements
export function subscribeToAnnouncements(
  callback: (announcements: Announcement[]) => void
): () => void {
  const q = query(
    collection(db, 'announcements'),
    where('isActive', '==', true),
    orderBy('isPinned', 'desc'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const now = new Date();
    const announcements = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          expiresAt: data.expiresAt?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Announcement;
      })
      .filter(a => !a.expiresAt || a.expiresAt > now);
    
    callback(announcements);
  });
}

// Get upcoming birthdays (within next 30 days)
export function subscribeToUpcomingBirthdays(
  callback: (birthdays: { uid: string; displayName: string; birthday: Date; daysUntil: number; department?: string }[]) => void
): () => void {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    const birthdays = snapshot.docs
      .map(doc => {
        const data = doc.data();
        if (!data.dateOfBirth) return null;
        
        const birthdayData = data.dateOfBirth;
        let birthday: Date;
        
        if (birthdayData?.seconds) {
          birthday = new Date(birthdayData.seconds * 1000);
        } else if (birthdayData instanceof Date) {
          birthday = birthdayData;
        } else if (typeof birthdayData === 'string') {
          birthday = new Date(birthdayData);
        } else {
          return null;
        }

        // Calculate this year's birthday
        const thisYearBirthday = new Date(currentYear, birthday.getMonth(), birthday.getDate());
        
        // If birthday has passed this year, use next year
        if (thisYearBirthday < today) {
          thisYearBirthday.setFullYear(currentYear + 1);
        }
        
        const diffTime = thisYearBirthday.getTime() - today.getTime();
        const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Only include birthdays within the next 30 days
        if (daysUntil > 30) return null;
        
        return {
          uid: doc.id,
          displayName: data.displayName || `${data.firstName} ${data.lastName}`,
          birthday: thisYearBirthday,
          daysUntil,
          department: data.departmentId,
          profilePhotoUrl: data.profilePhotoUrl,
        };
      })
      .filter((b): b is NonNullable<typeof b> => b !== null)
      .sort((a, b) => a.daysUntil - b.daysUntil);
    
    callback(birthdays);
  });
}

// Category colors and icons
export const announcementCategories = {
  general: { label: 'General', color: 'bg-slate-100 text-slate-700', icon: '📋' },
  event: { label: 'Event', color: 'bg-blue-100 text-blue-700', icon: '🎉' },
  policy: { label: 'Policy', color: 'bg-amber-100 text-amber-700', icon: '📜' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700', icon: '🚨' },
  celebration: { label: 'Celebration', color: 'bg-pink-100 text-pink-700', icon: '🎊' },
};

export const priorityConfig = {
  low: { label: 'Low', color: 'text-slate-500' },
  normal: { label: 'Normal', color: 'text-blue-500' },
  high: { label: 'High', color: 'text-red-500' },
};
