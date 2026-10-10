'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { Invoice } from '@/types';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { PaymentModal } from '@/components/billing/PaymentModal';

export default function ClientInvoicesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { currentUser } = useAuth();

  let project;
  try {
    project = db.getProject(projectId, currentUser);
  } catch (err: any) {
    return <div className="p-8 text-center text-rose-400">{err.message}</div>;
  }

  const [invoices, setInvoices] = useState<Invoice[]>(() => db.getInvoices(currentUser, projectId));
  const [activePaymentInvoice, setActivePaymentInvoice] = useState<Invoice | null>(null);

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/portal/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="border-b border-white/[0.06] pb-5">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
            <span>BILLING</span>
            <span>/</span>
            <span className="text-zinc-300">INVOICES & ESCROW</span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Project Invoices & Escrow Funding</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Stripe and Razorpay verified payments. Completed transactions fund milestone escrow vaults.
          </p>
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
                    <p className="text-xs text-zinc-400 mt-0.5">{inv.notes || 'Deliverable milestone allocation'}</p>
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

              <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
                <span className="text-[11px] text-zinc-500 font-mono">Due: {inv.due_date}</span>

                {inv.status !== 'paid' ? (
                  <button
                    onClick={() => setActivePaymentInvoice(inv)}
                    className="btn-primary"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Invoice</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] font-mono uppercase text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" /> Paid & Settled
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {activePaymentInvoice && (
          <PaymentModal
            invoice={activePaymentInvoice}
            onClose={() => setActivePaymentInvoice(null)}
            onPaymentSuccess={() => {
              setInvoices(db.getInvoices(currentUser, projectId));
            }}
          />
        )}
      </div>
    </div>
  );
}
