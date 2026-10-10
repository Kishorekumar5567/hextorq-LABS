'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { User, Building, ShieldCheck, Mail, Lock } from 'lucide-react';

export default function PortalProfilePage() {
  const { currentUser } = useAuth();
  const clientOrg = db.getClientForUser(currentUser.id);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Client Account Profile</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your organization profile, assigned stakeholders, and tenant access scope.
        </p>
      </div>

      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <img
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
            alt={currentUser.full_name}
            className="w-20 h-20 rounded-2xl object-cover ring-2 ring-purple-500/40"
          />
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">{currentUser.full_name}</h2>
            <p className="text-xs text-purple-400 font-medium">{currentUser.company_title}</p>
            <p className="text-xs text-slate-400">{currentUser.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 text-[11px]">Organization</span>
            <p className="font-bold text-white">{clientOrg?.name || 'Client Org'}</p>
            <p className="text-slate-400 text-[11px]">{clientOrg?.company_name}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-500 text-[11px]">Security Isolation Level</span>
            <p className="font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Multi-Tenant RLS Enforced
            </p>
            <p className="text-slate-400 text-[11px]">Strictly sandboxed to authorized resources.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
