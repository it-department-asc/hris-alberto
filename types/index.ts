// User roles for RBAC
export type UserRole = 'admin' | 'hr' | 'payroll' | 'manager' | 'employee';

// User document structure in Firestore (users collection)
export interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  employeeId: string | null; // Links to employees collection
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

// Registration form data
export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

// Login form data
export interface LoginData {
  email: string;
  password: string;
}

// Auth context state
export interface AuthState {
  user: UserDocument | null;
  loading: boolean;
  error: string | null;
}
