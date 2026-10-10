'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Calendar,
  ShieldCheck,
  Settings,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/agency/dashboard', icon: LayoutDashboard },
  { label: 'Clients', href: '/agency/clients', icon: Users },
  { label: 'Projects', href: '/agency/projects', icon: FolderGit2 },
  { label: 'Meetings & Calendar', href: '/agency/calendar', icon: Calendar },
  { label: 'Team', href: '/agency/team', icon: ShieldCheck },
  { label: 'Settings', href: '/agency/settings', icon: Settings },
];

function AgencySidebarContent() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#0A0E1A] flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-tight">Nexus Studio</h1>
            <p className="text-[11px] text-indigo-400 font-medium">Agency Workspace</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Workspace Health Indicator */}
      <div className="p-4 m-3 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <span>Staging Clusters</span>
          <span className="text-emerald-400 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Operational
          </span>
        </div>
        <p className="text-[11px] text-slate-500">2 previews active · 0 failing builds</p>
      </div>
    </aside>
  );
}

export function AgencySidebar() {
  return (
    <Suspense fallback={<aside className="w-64 border-r border-slate-800/80 bg-[#0A0E1A] shrink-0 min-h-screen" />}>
      <AgencySidebarContent />
    </Suspense>
  );
}
