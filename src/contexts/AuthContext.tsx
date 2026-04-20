import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Fetch or create profile
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          const isAdminEmail = firebaseUser.email === 'kamrannizamani35@gmail.com';
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'User',
            role: isAdminEmail ? 'admin' : 'student',
            subjects: [],
            dailyGoalMinutes: 120,
            createdAt: Date.now()
          };
          await setDoc(userDocRef, newProfile);
          setProfile(newProfile);
        } else {
          const data = userDoc.data() as UserProfile;
          // Auto-upgrade owner to admin if they aren't already
          if (firebaseUser.email === 'kamrannizamani35@gmail.com' && data.role !== 'admin') {
            await updateDoc(userDocRef, { role: 'admin' });
          }
          setProfile(data);
        }

        // Listen for profile changes
        const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          }
        });

        return () => {
          unsubscribeProfile();
        };
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const logout = async () => {
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
