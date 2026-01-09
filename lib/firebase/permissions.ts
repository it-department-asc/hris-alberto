import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import { UserPermissions, ModulePermission, ModuleName, PermissionLevel } from '@/types';

// Default modules list
export const ALL_MODULES: { name: ModuleName; label: string; description: string }[] = [
  { name: 'dashboard', label: 'Dashboard', description: 'View dashboard and analytics' },
  { name: 'employees', label: 'Employees', description: 'Manage employee records' },
  { name: 'departments', label: 'Departments', description: 'Manage departments' },
  { name: 'attendance', label: 'Attendance', description: 'View and manage attendance' },
  { name: 'leave', label: 'Leave Management', description: 'Manage leave requests' },
  { name: 'payroll', label: 'Payroll', description: 'Process and view payroll' },
  { name: 'organization', label: 'Organization', description: 'Manage organization settings' },
  { name: 'org-chart', label: 'Org Chart', description: 'View organization chart' },
  { name: 'settings', label: 'Settings', description: 'System settings' },
  { name: 'policy-advisor', label: 'Policy Advisor', description: 'AI policy assistant' },
];

// Get default permissions (all modules with 'none' access)
export function getDefaultPermissions(): ModulePermission[] {
  return ALL_MODULES.map(module => ({
    module: module.name,
    level: 'none' as PermissionLevel,
  }));
}

// Get user permissions
export async function getUserPermissions(userId: string): Promise<UserPermissions | null> {
  try {
    const docRef = doc(db, 'userPermissions', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userId: data.userId,
        permissions: data.permissions || getDefaultPermissions(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        updatedBy: data.updatedBy || '',
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user permissions:', error);
    throw error;
  }
}

// Create or update user permissions
export async function setUserPermissions(
  userId: string,
  permissions: ModulePermission[],
  updatedBy: string
): Promise<void> {
  try {
    const docRef = doc(db, 'userPermissions', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        permissions,
        updatedAt: serverTimestamp(),
        updatedBy,
      });
    } else {
      await setDoc(docRef, {
        userId,
        permissions,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedBy,
      });
    }
  } catch (error) {
    console.error('Error setting user permissions:', error);
    throw error;
  }
}

// Update single module permission
export async function updateModulePermission(
  userId: string,
  moduleName: ModuleName,
  level: PermissionLevel,
  updatedBy: string
): Promise<void> {
  try {
    const existing = await getUserPermissions(userId);
    let permissions = existing?.permissions || getDefaultPermissions();

    // Update the specific module
    const moduleIndex = permissions.findIndex(p => p.module === moduleName);
    if (moduleIndex >= 0) {
      permissions[moduleIndex].level = level;
    } else {
      permissions.push({ module: moduleName, level });
    }

    await setUserPermissions(userId, permissions, updatedBy);
  } catch (error) {
    console.error('Error updating module permission:', error);
    throw error;
  }
}

// Real-time listener for user permissions
export function subscribeToUserPermissions(
  userId: string,
  callback: (permissions: UserPermissions | null) => void
): () => void {
  const docRef = doc(db, 'userPermissions', userId);

  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        id: docSnap.id,
        userId: data.userId,
        permissions: data.permissions || getDefaultPermissions(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        updatedBy: data.updatedBy || '',
      });
    } else {
      callback(null);
    }
  });
}

// Check if user has permission for a module
export function hasPermission(
  permissions: ModulePermission[] | null | undefined,
  moduleName: ModuleName,
  requiredLevel: 'view' | 'edit'
): boolean {
  if (!permissions) return false;

  const modulePermission = permissions.find(p => p.module === moduleName);
  if (!modulePermission) return false;

  if (requiredLevel === 'view') {
    return modulePermission.level === 'view' || modulePermission.level === 'edit';
  }

  return modulePermission.level === 'edit';
}
