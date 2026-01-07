'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import {
  getUserDocument,
  signIn as firebaseSignIn,
  signOut as firebaseSignOut,
  registerUser as firebaseRegister,
  resetPassword as firebaseResetPassword,
} from '@/lib/firebase/auth';
import { UserDocument, RegistrationData } from '@/types';

interface AuthContextType {
  user: UserDocument | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDocument = await getUserDocument(firebaseUser.uid);
          setUser(userDocument);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user document:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const userDocument = await firebaseSignIn(email, password);
    setUser(userDocument);
  };

  const signOut = async () => {
    await firebaseSignOut();
    setUser(null);
  };

  const register = async (data: RegistrationData) => {
    const userDocument = await firebaseRegister(data);
    setUser(userDocument);
  };

  const resetPassword = async (email: string) => {
    await firebaseResetPassword(email);
  };

  const refreshUser = async () => {
    try {
      if (auth.currentUser) {
        const userDocument = await getUserDocument(auth.currentUser.uid);
        setUser(userDocument);
      }
    } catch (error) {
      console.error('Error refreshing user document:', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    register,
    resetPassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
