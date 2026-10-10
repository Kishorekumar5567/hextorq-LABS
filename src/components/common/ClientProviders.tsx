'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth/auth-context';
import { RoleSwitcherBar } from './RoleSwitcherBar';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <RoleSwitcherBar />
        <div className="flex-1 flex flex-col">{children}</div>
      </div>
    </AuthProvider>
  );
}
