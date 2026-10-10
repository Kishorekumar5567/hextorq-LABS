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
      <div className="flex-1 flex items-center justify-center p-8 bg-[#090A0F]">
        <div className="max-w-md w-full p-6 rounded-lg bg-[#0E1017] border border-rose-500/30 text-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-base font-semibold text-zinc-100">Agency Access Restricted (403)</h2>
          <p className="text-xs text-zinc-400 leading-relaxed font-mono">
            You are currently authenticated as Client ({currentUser.full_name}).
            Clients do not possess permissions to access the internal Agency Operations Workspace.
          </p>
          <div className="pt-2">
            <Link
              href="/portal/dashboard"
              className="btn-primary"
            >
              Go to Client Workspace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-screen bg-[#090A0F]">
      <AgencySidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Agency Top Navbar */}
        <header className="border-b border-white/[0.06] bg-[#0C0E14] px-6 py-2.5 flex items-center justify-between shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">WORKSPACE:</span>
            <span className="text-xs px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-200 font-mono">
              Nexus Engineering Studio
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.06]">
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.full_name}
                className="w-6 h-6 rounded-md object-cover border border-white/[0.1]"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-medium text-zinc-200 leading-none">{currentUser.full_name}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5 leading-none font-mono capitalize">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Routed Content wrapped in Suspense */}
        <main className="flex-1 flex flex-col">
          <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500 font-mono">Loading workspace content...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
