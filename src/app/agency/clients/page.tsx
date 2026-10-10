'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { Building, Mail, Phone, ExternalLink, Plus, ShieldCheck, X } from 'lucide-react';
import Link from 'next/link';

export default function AgencyClientsPage() {
  const { currentUser } = useAuth();
  const [clients, setClients] = useState(db.clients);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Client Form state
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    const newClient = {
      id: `client-${Date.now().toString(36)}`,
      agency_id: db.agency.id,
      name,
      company_name: company || name,
      email,
      phone,
      portal_access_enabled: true,
      created_at: new Date().toISOString(),
    };

    db.clients.push(newClient);
    setClients([...db.clients]);
    setShowAddModal(false);
    setName('');
    setEmail('');
    setCompany('');
    setPhone('');
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
            <span>AGENCY DIRECTORY</span>
            <span>/</span>
            <span className="text-zinc-300">CLIENT ORGANIZATIONS</span>
          </div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Enterprise Client Accounts</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Client accounts, authorized stakeholders, NDAs, and project governance permissions.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Onboard Client</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clients.map((client) => {
          const clientProjects = db.projects.filter(p => p.client_id === client.id);
          const clientInvoices = db.invoices.filter(i => i.client_id === client.id);
          const totalBilled = clientInvoices.reduce((s, i) => s + i.total_amount, 0);

          return (
            <div
              key={client.id}
              className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] hover:border-white/[0.14] transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-200 font-mono text-xs font-semibold">
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-100 text-sm">{client.name}</h3>
                      <p className="text-xs text-zinc-500 font-mono">{client.company_name}</p>
                    </div>
                  </div>

                  <span className="flex items-center gap-1 text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" /> Portal Active
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-400 font-mono bg-[#090A0F] p-3 rounded-md border border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-md bg-[#090A0F] border border-white/[0.04] text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-mono uppercase">ASSIGNED PROJECTS</span>
                    <span className="font-mono font-semibold text-zinc-200 text-sm">{clientProjects.length}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px] font-mono uppercase">TOTAL BILLED</span>
                    <span className="font-mono font-semibold text-emerald-400 text-sm">${totalBilled.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
                <Link
                  href={`/agency/clients/${client.id}`}
                  className="text-zinc-400 hover:text-zinc-200 font-medium flex items-center gap-1 transition-colors"
                >
                  <span>View Client Dossier</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                {clientProjects.length > 0 && (
                  <Link
                    href={`/agency/projects/${clientProjects[0].id}/overview`}
                    className="btn-secondary py-1 px-2.5"
                  >
                    Open Project
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-[#0E1017] border border-white/[0.1] rounded-lg p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <h3 className="font-semibold text-zinc-100 text-sm">Onboard Client Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-zinc-300">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddClient} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Organization / Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Health Technologies"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Legal Company Entity</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Health Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Primary Executive Contact Email</label>
                <input
                  type="email"
                  required
                  placeholder="executive@acmehealth.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
