import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';

interface AuthContextType {
  user: { uid: string; email: string; displayName?: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  login: () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ uid: string; email: string; displayName?: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (userData: any) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setProfile(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const userData = JSON.parse(stored);
          const res = await fetch(`/api/user/${userData.uid}`);
          if (res.ok) {
            const freshData = await res.json();
            setUser(freshData);
            setProfile(freshData);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Error fetching user session:", error);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
