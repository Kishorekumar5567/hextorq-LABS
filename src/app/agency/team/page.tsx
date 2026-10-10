'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ShieldCheck, UserCheck, Mail, Shield } from 'lucide-react';

export default function AgencyTeamPage() {
  const agencyStaff = db.profiles.filter(p => p.role === 'agency_admin' || p.role === 'agency_developer');

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Agency Team & Access Control</h1>
        <p className="text-xs text-slate-400 mt-1">
          Engineers, architects, and administrators with access to the Nexus Studio workspace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {agencyStaff.map((member) => (
          <div
            key={member.id}
            className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4 hover:border-indigo-500/30 transition-all"
          >
            <div className="flex items-center gap-3.5">
              <img
                src={member.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={member.full_name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/30"
              />
              <div>
                <h3 className="font-bold text-white text-base">{member.full_name}</h3>
                <p className="text-xs text-indigo-400">{member.company_title}</p>
              </div>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span>{member.email}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                member.role === 'agency_admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
              }`}>
                {member.role.replace('_', ' ')}
              </span>
              <span className="text-[11px] text-slate-500">Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
