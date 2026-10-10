'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ShieldCheck, Mail, Building } from 'lucide-react';

export default function PortalProfilePage() {
  const { currentUser } = useAuth();
  const clientOrg = db.getClientForUser(currentUser.id);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
      <div className="border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
          <span>PORTAL</span>
          <span>/</span>
          <span className="text-zinc-300">ACCOUNT PROFILE</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Client Account & Credentials</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Review your organization profile, assigned stakeholders, and multi-tenant security boundary.
        </p>
      </div>

      <div className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <img
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
            alt={currentUser.full_name}
            className="w-16 h-16 rounded-md object-cover border border-white/[0.1]"
          />
          <div className="space-y-0.5">
            <h2 className="text-base font-semibold text-zinc-100">{currentUser.full_name}</h2>
            <p className="text-xs text-zinc-400 font-mono">{currentUser.company_title}</p>
            <p className="text-xs text-zinc-500 font-mono">{currentUser.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-white/[0.06] text-xs">
          <div className="p-3.5 rounded-md bg-[#090A0F] border border-white/[0.04] space-y-1">
            <span className="text-zinc-500 text-[10px] font-mono uppercase block">AFFILIATED ORGANIZATION</span>
            <p className="font-semibold text-zinc-200 text-xs">{clientOrg?.name || 'Client Org'}</p>
            <p className="text-zinc-400 text-[11px] font-mono">{clientOrg?.company_name}</p>
          </div>

          <div className="p-3.5 rounded-md bg-[#090A0F] border border-white/[0.04] space-y-1">
            <span className="text-zinc-500 text-[10px] font-mono uppercase block">SECURITY BOUNDARY LEVEL</span>
            <p className="font-semibold text-emerald-400 text-xs flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5" /> Multi-Tenant Isolation Active
            </p>
            <p className="text-zinc-500 text-[11px]">Strictly sandboxed to authorized resources.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
