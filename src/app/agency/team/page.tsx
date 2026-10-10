'use client';

import React from 'react';
import { db } from '@/lib/data/repository';
import { Mail, Shield, ShieldCheck } from 'lucide-react';

export default function AgencyTeamPage() {
  const agencyStaff = db.profiles.filter(p => p.role === 'agency_admin' || p.role === 'agency_developer');

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
          <span>ORGANIZATION</span>
          <span>/</span>
          <span className="text-zinc-300">STAFF DIRECTORY</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Engineering & Staff Roster</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Engineers, technical directors, and project leads with authenticated administrative clearance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agencyStaff.map((member) => (
          <div
            key={member.id}
            className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] hover:border-white/[0.14] transition-all space-y-4"
          >
            <div className="flex items-center gap-3">
              <img
                src={member.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={member.full_name}
                className="w-10 h-10 rounded-md object-cover border border-white/[0.1]"
              />
              <div>
                <h3 className="font-semibold text-zinc-100 text-sm">{member.full_name}</h3>
                <p className="text-xs text-zinc-400 font-mono">{member.company_title}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-400 font-mono bg-[#090A0F] p-2.5 rounded-md border border-white/[0.04]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span>{member.email}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide border ${
                member.role === 'agency_admin'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-white/[0.04] text-zinc-300 border-white/[0.06]'
              }`}>
                {member.role === 'agency_admin' ? 'Agency Admin' : 'Staff Engineer'}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
