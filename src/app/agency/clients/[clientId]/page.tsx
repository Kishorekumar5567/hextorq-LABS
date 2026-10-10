'use client';

import React, { use } from 'react';
import { db } from '@/lib/data/repository';
import { Building, Mail, Phone, ShieldCheck, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AgencyClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = use(params);
  const client = db.clients.find(c => c.id === clientId);

  if (!client) {
    return (
      <div className="p-8 text-center text-zinc-500 font-mono text-xs">
        <p>Client organization not found.</p>
        <Link href="/agency/clients" className="text-zinc-300 underline mt-2 inline-block">
          ← Back to clients
        </Link>
      </div>
    );
  }

  const projects = db.projects.filter(p => p.client_id === client.id);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <Link href="/agency/clients" className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 transition-colors font-mono">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to client directory
      </Link>

      <div className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-200 font-mono text-sm font-semibold">
              {client.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-zinc-100 tracking-tight">{client.name}</h1>
              <p className="text-xs text-zinc-500 font-mono">{client.company_name}</p>
            </div>
          </div>

          <span className="flex items-center gap-1 text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5" /> Multi-Tenant Portal Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/[0.06] text-xs font-mono text-zinc-400">
          <div>Email: <strong className="text-zinc-200">{client.email}</strong></div>
          <div>Phone: <strong className="text-zinc-200">{client.phone || 'N/A'}</strong></div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-100">Client Projects ({projects.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div key={proj.id} className="p-4 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-zinc-100 text-sm">{proj.name}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{proj.description}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {proj.health.replace('_', ' ')}
                </span>
              </div>
              <div className="pt-2.5 border-t border-white/[0.05] flex justify-between items-center text-xs">
                <span className="font-mono font-medium text-zinc-200">${proj.budget.toLocaleString()} {proj.currency}</span>
                <Link
                  href={`/agency/projects/${proj.id}/overview`}
                  className="btn-secondary py-1 px-2.5"
                >
                  <span>Open Workspace</span>
                  <ArrowRight className="w-3 h-3 text-zinc-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
