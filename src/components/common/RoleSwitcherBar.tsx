'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Shield, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export function RoleSwitcherBar() {
  const { currentUser, availableUsers, switchUser, isAgencyStaff } = useAuth();

  // Keyboard shortcut listener for fast switching (Alt+1, Alt+2, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && ['1', '2', '3', '4'].includes(e.key)) {
        const index = parseInt(e.key, 10) - 1;
        if (availableUsers[index]) {
          switchUser(availableUsers[index].id);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [availableUsers, switchUser]);

  return (
    <div className="bg-[#0B0D13] border-b border-white/[0.07] px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3 shrink-0 z-50 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="tracking-wide">SIMULATED SESSION</span>
        </div>
        <span className="text-zinc-600 hidden md:inline">|</span>
        <span className="text-zinc-500 text-[11px] hidden md:inline">
          Switch persona to verify multi-tenant data boundaries:
        </span>
      </div>

      <div className="flex items-center gap-1 bg-[#131620] p-0.5 rounded-lg border border-white/[0.06]">
        {availableUsers.map((u, i) => {
          const isActive = u.id === currentUser.id;
          return (
            <button
              key={u.id}
              onClick={() => switchUser(u.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                isActive
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <span>{u.full_name}</span>
              <span className={`text-[9px] px-1 py-0.2 rounded font-mono uppercase ${
                isActive
                  ? 'bg-zinc-300 text-zinc-800'
                  : 'bg-white/[0.06] text-zinc-400'
              }`}>
                {u.role === 'agency_admin' ? 'Admin' : u.role === 'agency_developer' ? 'Dev' : 'Client'}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-3 text-[11px]">
        {isAgencyStaff ? (
          <Link
            href="/agency/dashboard"
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 font-medium transition-colors"
          >
            <span>Agency Operations</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        ) : (
          <Link
            href="/portal/dashboard"
            className="flex items-center gap-1 text-zinc-400 hover:text-zinc-100 font-medium transition-colors"
          >
            <span>Client Workspace</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </div>
  );
}
