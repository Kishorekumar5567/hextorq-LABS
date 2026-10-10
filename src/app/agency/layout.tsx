'use client';

import React, { Suspense } from 'react';
import { AgencySidebar } from '@/components/agency/AgencySidebar';
import { NotificationBell } from '@/components/common/NotificationBell';
import { useAuth } from '@/lib/auth/auth-context';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isAgencyStaff } = useAuth();

  // Route security check: Client cannot view internal agency workspace!
  if (!isAgencyStaff) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-[#080C15]">
        <div className="max-w-md w-full p-8 rounded-2xl glass-panel-elevated border border-rose-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Agency Access Restricted (403)</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            You are currently logged in as a Client (<span className="text-purple-400 font-semibold">{currentUser.full_name}</span>).
            Clients do not have permissions to access the internal Agency Operations Workspace.
          </p>
          <div className="pt-2">
            <Link
              href="/portal/dashboard"
              className="inline-block px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30"
            >
              Go to Client Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-screen bg-[#080C15]">
      <AgencySidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Agency Top Navbar */}
        <header className="border-b border-slate-800/80 bg-[#0A0E1A]/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Workspace:</span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-200 font-medium">
              Nexus Studio (Agency Admin)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.full_name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-white leading-none">{currentUser.full_name}</p>
                <p className="text-[10px] text-indigo-400 mt-0.5 leading-none capitalize">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Routed Content wrapped in Suspense */}
        <main className="flex-1 flex flex-col">
          <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading workspace content...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
