'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';
import { INITIAL_PROFILES } from '@/lib/data/mock-db';

interface AuthContextType {
  currentUser: UserProfile;
  availableUsers: UserProfile[];
  switchUser: (userId: string) => void;
  isAgencyAdmin: boolean;
  isAgencyStaff: boolean;
  isClient: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_PROFILES[0]); // Alex Rivera by default

  useEffect(() => {
    // Check if stored in localStorage
    const savedUserId = localStorage.getItem('nexus_current_user_id');
    if (savedUserId) {
      const found = INITIAL_PROFILES.find(u => u.id === savedUserId);
      if (found) setCurrentUser(found);
    }
  }, []);

  const switchUser = (userId: string) => {
    const found = INITIAL_PROFILES.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('nexus_current_user_id', found.id);
    }
  };

  const logout = () => {
    // Reset to default admin
    switchUser('user-admin-01');
  };

  const isAgencyAdmin = currentUser.role === 'agency_admin';
  const isAgencyStaff = currentUser.role === 'agency_admin' || currentUser.role === 'agency_developer';
  const isClient = currentUser.role === 'client';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        availableUsers: INITIAL_PROFILES,
        switchUser,
        isAgencyAdmin,
        isAgencyStaff,
        isClient,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
