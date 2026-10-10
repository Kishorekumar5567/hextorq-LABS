'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { Invoice } from '@/types';
import { CreditCard, Plus, X } from 'lucide-react';

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
              <span>FINANCIALS</span>
              <span>/</span>
              <span className="text-zinc-300">INVOICE ISSUANCE</span>
            </div>
            <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Commercial Invoices & Escrow</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Issue commercial invoices, configure line items, and monitor client settlement webhooks.
            </p>
          </div>

          {isAgencyAdmin && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue Invoice</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] hover:border-white/[0.14] transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-zinc-400 font-semibold">
                        {inv.invoice_number}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wide border ${
                        inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        'bg-white/[0.04] text-zinc-300 border-white/[0.06]'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-100 font-mono mt-1.5">
                      ${inv.total_amount.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">{inv.currency}</span>
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{inv.notes || 'Milestone deliverable allocation'}</p>
                  </div>

                  <div className="p-2 rounded-md bg-white/[0.04] border border-white/[0.06] text-zinc-300">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>

                {/* Line items summary */}
                <div className="bg-[#090A0F] p-3 rounded-md border border-white/[0.04] space-y-1.5 text-xs">
                  {inv.items?.map((item) => (
                    <div key={item.id} className="flex justify-between text-zinc-400 font-mono text-[11px]">
                      <span className="line-clamp-1">{item.description}</span>
                      <span className="text-zinc-200">${item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>Issued: {inv.issue_date}</span>
                <span>Due Date: {inv.due_date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Issue Invoice Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="bg-[#0E1017] border border-white/[0.1] rounded-lg p-5 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h3 className="font-semibold text-zinc-100 text-sm">Issue Commercial Invoice</h3>
                <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Deliverable / Item Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Phase 3 1-Click Checkout Completion"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Payment Instructions / Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
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
