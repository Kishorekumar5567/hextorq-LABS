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
  ShieldAlert,
  Building,
} from 'lucide-react';

const PORTAL_ITEMS = [
  { label: 'Portal Overview', href: '/portal/dashboard', icon: LayoutDashboard },
  { label: 'My Projects', href: '/portal/projects', icon: FolderGit2 },
  { label: 'Notifications', href: '/portal/notifications', icon: Bell },
  { label: 'Company Profile', href: '/portal/profile', icon: User },
];

function PortalSidebarContent() {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const clientOrg = db.getClientForUser(currentUser.id);

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#090D18] flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand */}
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-tight">
              {clientOrg ? clientOrg.name : 'Client Portal'}
            </h1>
            <p className="text-[11px] text-purple-400 font-medium">Secured Client Environment</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {PORTAL_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 font-semibold'
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

      {/* Security isolation badge */}
      <div className="p-4 m-3 rounded-xl bg-purple-950/20 border border-purple-500/20">
        <div className="flex items-center gap-1.5 text-xs text-purple-300 font-medium mb-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Tenant Isolated</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Strictly authorized to {clientOrg?.company_name || 'your organization'}.
        </p>
      </div>
    </aside>
  );
}

export function PortalSidebar() {
  return (
    <Suspense fallback={<aside className="w-64 border-r border-slate-800/80 bg-[#090D18] shrink-0 min-h-screen" />}>
      <PortalSidebarContent />
    </Suspense>
  );
}
