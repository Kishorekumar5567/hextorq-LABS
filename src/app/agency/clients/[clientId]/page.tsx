'use client';

import React, { use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { Building, Mail, Phone, ShieldCheck, ArrowLeft, ArrowUpRight } from 'lucide-react';
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
      <div className="p-8 text-center text-slate-400">
        <p>Client organization not found.</p>
        <Link href="/agency/clients" className="text-indigo-400 text-xs mt-2 inline-block">
          ← Back to clients
        </Link>
      </div>
    );
  }

  const projects = db.projects.filter(p => p.client_id === client.id);
  const invoices = db.invoices.filter(i => i.client_id === client.id);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <Link href="/agency/clients" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to clients
      </Link>

      <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/30">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{client.name}</h1>
              <p className="text-xs text-slate-400">{client.company_name}</p>
            </div>
          </div>

          <span className="flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-semibold border border-emerald-500/20 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4" /> Multi-Tenant Portal Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
          <div>Email: <strong className="text-white">{client.email}</strong></div>
          <div>Phone: <strong className="text-white">{client.phone || 'N/A'}</strong></div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Client Projects ({projects.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <div key={proj.id} className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-white text-base">{proj.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{proj.description}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                  {proj.health.replace('_', ' ')}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800/80 flex justify-between items-center text-xs">
                <span className="font-bold text-white">${proj.budget.toLocaleString()} {proj.currency}</span>
                <Link
                  href={`/agency/projects/${proj.id}/overview`}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 flex items-center gap-1 font-medium"
                >
                  <span>Open Workspace</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
