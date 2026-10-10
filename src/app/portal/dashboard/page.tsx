'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { Project, Invoice, Meeting, Milestone } from '@/types';
import {
  FolderGit2,
  CheckCircle2,
  DollarSign,
  Calendar,
  Eye,
  CreditCard,
  Video,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { PaymentModal } from '@/components/billing/PaymentModal';
import { VideoRoomModal } from '@/components/meetings/VideoRoomModal';

export default function ClientDashboardPage() {
  const { currentUser } = useAuth();
  const clientOrg = db.getClientForUser(currentUser.id);
  const projects = db.getProjects(currentUser);
  const invoices = db.getInvoices(currentUser);
  const unpaidInvoices = invoices.filter(i => i.status === 'issued' || i.status === 'pending');
  const allMilestones = projects.flatMap(p => db.getMilestones(p.id, currentUser));
  const pendingApprovals = allMilestones.filter(m => m.status === 'ready_for_review');
  const meetings = projects.flatMap(p => db.getMeetings(p.id, currentUser));

  const [activePaymentInvoice, setActivePaymentInvoice] = useState<Invoice | null>(null);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Client Organization Welcome Banner */}
      <div className="p-6 rounded-2xl ui-surface border border-white/[0.08] relative overflow-hidden">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase bg-white/[0.06] text-zinc-300 px-2 py-0.5 rounded border border-white/[0.06]">
              {clientOrg?.name || 'Verified Client'}
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs text-zinc-400 font-mono">Tenant Segregated</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight">
            Client Workspace Overview
          </h1>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Welcome back, {currentUser.full_name}. Review active staging builds, sign off on deliverables to release milestone escrow, and settle commercial invoices.
          </p>
        </div>
      </div>

      {/* Action Notice if Milestone is Ready for Review */}
      {pendingApprovals.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-zinc-100 text-xs uppercase tracking-wide font-mono">
              Milestone Sign-Off Required ({pendingApprovals.length})
            </h3>
          </div>
          {pendingApprovals.map((ms) => (
            <div
              key={ms.id}
              className="p-3.5 rounded-lg bg-[#0E1017] border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <h4 className="font-semibold text-zinc-200 text-xs">{ms.title}</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">{ms.description}</p>
                <span className="inline-block mt-1.5 text-xs font-mono font-semibold text-zinc-300">
                  Deliverable Escrow: ${ms.amount.toLocaleString()} {ms.currency}
                </span>
              </div>
              <Link
                href={`/portal/projects/${ms.project_id}/approvals`}
                className="px-3.5 py-1.5 rounded-md bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-all"
              >
                <span>Review & Sign Off</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl ui-surface border border-white/[0.07] space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-500">Authorized Projects</span>
          <div className="text-2xl font-bold text-zinc-100 font-mono">{projects.length}</div>
          <p className="text-[11px] text-emerald-400 font-mono">All sprints active</p>
        </div>

        <div className="p-4 rounded-xl ui-surface border border-white/[0.07] space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-500">Pending Sign-Offs</span>
          <div className="text-2xl font-bold text-zinc-100 font-mono">{pendingApprovals.length}</div>
          <p className="text-[11px] text-zinc-400 font-mono">Awaiting client authorization</p>
        </div>

        <div className="p-4 rounded-xl ui-surface border border-white/[0.07] space-y-1">
          <span className="text-[11px] font-mono uppercase text-zinc-500">Invoices Payable</span>
          <div className="text-2xl font-bold text-zinc-100 font-mono">
            ${unpaidInvoices.reduce((s, i) => s + i.total_amount, 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-400 font-mono">{unpaidInvoices.length} invoices payable</p>
        </div>
      </div>

      {/* Authorized Projects */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Your Development Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const milestones = db.getMilestones(proj.id, currentUser);
            const approvedCount = milestones.filter(m => m.status === 'approved').length;
            const progress = milestones.length > 0 ? Math.round((approvedCount / milestones.length) * 100) : 0;

            return (
              <div
                key={proj.id}
                className="p-5 rounded-xl ui-surface border border-white/[0.07] hover:border-white/[0.15] transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-zinc-100">{proj.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    {proj.health.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Approved Milestones</span>
                    <span className="font-mono text-zinc-200">{approvedCount} / {milestones.length} ({progress}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-zinc-100 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="font-mono text-zinc-400 text-[11px]">
                    Target: {new Date(proj.target_date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/portal/projects/${proj.id}/feedback`}
                      className="px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 text-xs font-medium flex items-center gap-1 border border-white/[0.08]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Studio</span>
                    </Link>
                    <Link
                      href={`/portal/projects/${proj.id}/overview`}
                      className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-200">Commercial Invoices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-5 rounded-xl ui-surface border border-white/[0.07] flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-zinc-100">{inv.invoice_number}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                    inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.06] text-zinc-300'
                  }`}>
                    {inv.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{inv.notes || 'Milestone fee'}</p>
                <p className="text-sm font-bold text-white font-mono pt-1">
                  ${inv.total_amount.toLocaleString()} {inv.currency}
                </p>
              </div>

              {inv.status !== 'paid' ? (
                <button
                  onClick={() => setActivePaymentInvoice(inv)}
                  className="px-3.5 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay Now</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium px-2.5 py-1 rounded-md bg-emerald-500/10">
                  <ShieldCheck className="w-3.5 h-3.5" /> Settled
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Modal */}
      {activePaymentInvoice && (
        <PaymentModal
          invoice={activePaymentInvoice}
          onClose={() => setActivePaymentInvoice(null)}
          onPaymentSuccess={() => {
            window.location.reload();
          }}
        />
      )}

      {/* Video Modal */}
      {activeMeeting && (
        <VideoRoomModal meeting={activeMeeting} onClose={() => setActiveMeeting(null)} />
      )}
    </div>
  );
}
