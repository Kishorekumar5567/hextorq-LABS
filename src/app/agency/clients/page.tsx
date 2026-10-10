'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { Users, Building, Mail, Phone, ExternalLink, Plus, ShieldCheck } from 'lucide-react';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Client Directory & Portal Access</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage client organizational accounts, invite stakeholders, and enforce project authorization scopes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Client</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {clients.map((client) => {
          const clientProjects = db.projects.filter(p => p.client_id === client.id);
          const clientInvoices = db.invoices.filter(i => i.client_id === client.id);
          const totalBilled = clientInvoices.reduce((s, i) => s + i.total_amount, 0);

          return (
            <div
              key={client.id}
              className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4 hover:border-indigo-500/40 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-indigo-600/30">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">{client.name}</h3>
                    <p className="text-xs text-slate-400">{client.company_name}</p>
                  </div>
                </div>

                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-semibold border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> Portal Active
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{client.email}</span>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{client.phone}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Assigned Projects</span>
                  <span className="font-bold text-white text-sm">{clientProjects.length}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Total Billed</span>
                  <span className="font-bold text-emerald-400 text-sm">${totalBilled.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <Link
                  href={`/agency/clients/${client.id}`}
                  className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  <span>View Client Dossier</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                {clientProjects.length > 0 && (
                  <Link
                    href={`/agency/projects/${clientProjects[0].id}/overview`}
                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0E1524] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base">Onboard New Client Organization</h3>
            <form onSubmit={handleAddClient} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Organization / Brand Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Health Technologies"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Legal Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Health Inc."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Primary Executive Email</label>
                <input
                  type="email"
                  required
                  placeholder="executive@acmehealth.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
