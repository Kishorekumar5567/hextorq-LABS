'use client';

import React, { Suspense } from 'react';
import { PortalSidebar } from '@/components/portal/PortalSidebar';
import { NotificationBell } from '@/components/common/NotificationBell';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser } = useAuth();
  const clientOrg = db.getClientForUser(currentUser.id);

  return (
    <div className="flex flex-1 min-h-screen bg-[#070A14]">
      <PortalSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Portal Top Navbar */}
        <header className="border-b border-slate-800/80 bg-[#090D18]/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">Authenticated Client:</span>
            <span className="text-xs px-2.5 py-1 rounded-md bg-purple-950/40 text-purple-300 font-medium border border-purple-500/20">
              {clientOrg?.name || 'Verified Client'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt={currentUser.full_name}
                className="w-7 h-7 rounded-full object-cover ring-2 ring-purple-500/30"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-white leading-none">{currentUser.full_name}</p>
                <p className="text-[10px] text-purple-400 mt-0.5 leading-none">Client Executive</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Routed Content wrapped in Suspense */}
        <main className="flex-1 flex flex-col">
          <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading portal content...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
