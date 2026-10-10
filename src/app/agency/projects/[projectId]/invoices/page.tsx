'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { Invoice } from '@/types';
import { CreditCard, Plus, ShieldCheck, DollarSign, Clock, FileText } from 'lucide-react';

export default function AgencyInvoicesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { currentUser, isAgencyAdmin } = useAuth();

  let project;
  try {
    project = db.getProject(projectId, currentUser);
  } catch (err: any) {
    return <div className="p-8 text-center text-rose-400">{err.message}</div>;
  }

  const [invoices, setInvoices] = useState<Invoice[]>(() => db.getInvoices(currentUser, projectId));
  const [showModal, setShowModal] = useState(false);

  // New Invoice Form state
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState(15000);
  const [dueDate, setDueDate] = useState('2026-05-15');
  const [notes, setNotes] = useState('');

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc) return;

    try {
      db.createInvoice(projectId, currentUser, {
        due_date: dueDate,
        notes,
        items: [
          {
            description: desc,
            quantity: 1,
            unit_price: Number(amount),
          },
        ],
      });

      setInvoices(db.getInvoices(currentUser, projectId));
      setShowModal(false);
      setDesc('');
      setNotes('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/agency/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Milestone Invoicing & Escrow</h2>
            <p className="text-xs text-slate-400 mt-1">
              Issue commercial invoices, configure line items, and track client checkout settlements.
            </p>
          </div>

          {isAgencyAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Invoice</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {inv.invoice_number}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                      inv.status === 'issued' ? 'bg-indigo-500/20 text-indigo-400' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2">
                    ${inv.total_amount.toLocaleString()} {inv.currency}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{inv.notes || 'Milestone fee'}</p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <CreditCard className="w-6 h-6" />
                </div>
              </div>

              {/* Line items summary */}
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                {inv.items?.map((item) => (
                  <div key={item.id} className="flex justify-between text-slate-300">
                    <span className="line-clamp-1">{item.description}</span>
                    <span className="font-mono text-white">${item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Issued: {inv.issue_date}</span>
                <span>Due Date: {inv.due_date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Issue Invoice Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="bg-[#0E1524] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="font-bold text-white text-base">Issue Commercial Invoice</h3>
              <form onSubmit={handleCreateInvoice} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Milestone Deliverable / Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Phase 3 1-Click Checkout Completion"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Payment Instructions / Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500"
                  >
                    Issue Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
