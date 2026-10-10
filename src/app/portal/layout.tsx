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
    <div className="flex flex-1 min-h-screen bg-[#090A0F]">
      <PortalSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Portal Top Navbar */}
        <header className="border-b border-white/[0.06] bg-[#0C0E14] px-6 py-2.5 flex items-center justify-between shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">CLIENT ORG:</span>
            <span className="text-xs px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-zinc-200 font-mono">
              {clientOrg?.name || 'Verified Client'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NotificationBell />
            <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.06]">
              <img
                src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt={currentUser.full_name}
                className="w-6 h-6 rounded-md object-cover border border-white/[0.1]"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-medium text-zinc-200 leading-none">{currentUser.full_name}</p>
                <p className="text-[10px] text-zinc-500 mt-0.5 leading-none font-mono">Client Executive</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Routed Content wrapped in Suspense */}
        <main className="flex-1 flex flex-col">
          <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500 font-mono">Loading portal content...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
