'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Calendar,
  ShieldCheck,
  Settings,
  ChevronDown,
  Layers,
  CircleDot,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Overview', href: '/agency/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/agency/projects', icon: FolderGit2, badge: '2' },
  { label: 'Clients', href: '/agency/clients', icon: Users },
  { label: 'Calendar & Syncs', href: '/agency/calendar', icon: Calendar, badge: '1' },
  { label: 'Engineering Team', href: '/agency/team', icon: ShieldCheck },
  { label: 'Settings', href: '/agency/settings', icon: Settings },
];

function AgencySidebarContent() {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  return (
    <aside className="w-60 border-r border-white/[0.07] bg-[#0A0B10] flex flex-col justify-between shrink-0 min-h-screen select-none">
      <div>
        {/* Workspace Brand / Selector */}
        <div className="p-3.5 border-b border-white/[0.07]">
          <div className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-zinc-100 text-zinc-950 font-bold text-xs flex items-center justify-center font-mono">
                N
              </div>
              <div className="text-left">
                <span className="font-semibold text-zinc-100 text-xs block leading-tight">Nexus Studio</span>
                <span className="text-[10px] text-zinc-500 font-mono block">Agency Operations</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>

        {/* Navigation */}
        <div className="px-3 pt-4 pb-2">
          <span className="px-2 text-[10px] font-mono uppercase text-zinc-500 tracking-wider font-medium">
            Workspace
          </span>
          <nav className="mt-1.5 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/agency/dashboard'
                ? pathname === '/agency/dashboard'
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/[0.08] text-zinc-100 font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-zinc-700 text-zinc-200' : 'bg-white/[0.06] text-zinc-500'
                    }`}>
                      {item.badge}
                    </span>
                  )}
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
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={currentUser.full_name}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-white/10"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-zinc-200 truncate leading-tight">{currentUser.full_name}</p>
            <p className="text-[10px] text-zinc-500 truncate leading-tight mt-0.5">{currentUser.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function AgencySidebar() {
  return (
    <Suspense fallback={<aside className="w-60 border-r border-white/[0.07] bg-[#0A0B10] shrink-0 min-h-screen" />}>
      <AgencySidebarContent />
    </Suspense>
  );
}
