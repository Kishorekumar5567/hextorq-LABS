'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import {
  LayoutDashboard,
  FolderGit2,
  Bell,
  User,
  ShieldCheck,
  Building2,
  ChevronDown,
} from 'lucide-react';

const PORTAL_ITEMS = [
  { label: 'Overview', href: '/portal/dashboard', icon: LayoutDashboard },
  { label: 'Assigned Projects', href: '/portal/projects', icon: FolderGit2 },
  { label: 'Activity & Alerts', href: '/portal/notifications', icon: Bell },
  { label: 'Organization Profile', href: '/portal/profile', icon: User },
];

function PortalSidebarContent() {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const clientOrg = db.getClientForUser(currentUser.id);

  return (
    <aside className="w-60 border-r border-white/[0.07] bg-[#0A0B10] flex flex-col justify-between shrink-0 min-h-screen select-none">
      <div>
        {/* Client Organization Header */}
        <div className="p-3.5 border-b border-white/[0.07]">
          <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-zinc-800 border border-white/10 text-zinc-100 font-bold text-xs flex items-center justify-center font-mono">
                {clientOrg?.name.charAt(0) || 'C'}
              </div>
              <div className="text-left">
                <span className="font-semibold text-zinc-100 text-xs block leading-tight truncate max-w-[120px]">
                  {clientOrg ? clientOrg.name : 'Client Portal'}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono block">Authorized Client</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>

        {/* Navigation */}
        <div className="px-3 pt-4 pb-2">
          <span className="px-2 text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-medium">
            Client Portal
          </span>
          <nav className="mt-1.5 space-y-0.5">
            {PORTAL_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/portal/dashboard'
                ? pathname === '/portal/dashboard'
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/[0.08] text-zinc-100 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-white/[0.07]">
        <div className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
          <img
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
            alt={currentUser.full_name}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-zinc-200 truncate leading-tight">{currentUser.full_name}</p>
            <p className="text-[10px] text-zinc-500 truncate leading-tight mt-0.5">{clientOrg?.company_name || 'Client Org'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function PortalSidebar() {
  return (
    <Suspense fallback={<aside className="w-60 border-r border-white/[0.07] bg-[#0A0B10] shrink-0 min-h-screen" />}>
      <PortalSidebarContent />
    </Suspense>
  );
}
