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

  // Repository returns ONLY invoices belonging to this client!
  const [invoices, setInvoices] = useState<Invoice[]>(() => db.getInvoices(currentUser, projectId));
  const [activePaymentInvoice, setActivePaymentInvoice] = useState<Invoice | null>(null);

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/portal/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Project Invoices & Escrow</h2>
          <p className="text-xs text-slate-400 mt-1">
            Authorize milestone payments with Stripe or Razorpay. All transactions are cryptographically verified.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-400">
                      {inv.invoice_number}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                      inv.status === 'issued' ? 'bg-purple-500/20 text-purple-300' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-2">
                    ${inv.total_amount.toLocaleString()} {inv.currency}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{inv.notes || 'Deliverable fee'}</p>
                </div>

                <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400">
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

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">Due: {inv.due_date}</span>

                {inv.status !== 'paid' ? (
                  <button
                    onClick={() => setActivePaymentInvoice(inv)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Invoice</span>
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold px-3 py-1 rounded-lg bg-emerald-500/10">
                    <ShieldCheck className="w-4 h-4" /> Paid & Settled
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
