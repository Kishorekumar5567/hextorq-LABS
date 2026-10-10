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
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-[#0A0F1E] border border-purple-500/20 shadow-2xl relative overflow-hidden">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
              {clientOrg?.name || 'Verified Client'}
            </span>
            <span className="text-xs text-slate-400">· Private Portal Session</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {currentUser.full_name.split(' ')[0]}
          </h1>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
            Review active staging builds, sign off on completed deliverables, attend architectural syncs, and settle milestone escrow invoices.
          </p>
        </div>

        <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 opacity-10 pointer-events-none">
          <ShieldCheck className="w-64 h-64 text-purple-400" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Authorized Projects</span>
            <FolderGit2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">{projects.length}</div>
          <p className="text-[11px] text-emerald-400">All deliverables on-track</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pending Milestone Sign-Offs</span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{pendingApprovals.length}</div>
          <p className="text-[11px] text-amber-400">Action requested by agency team</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Invoices Due</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            ${unpaidInvoices.reduce((s, i) => s + i.total_amount, 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">{unpaidInvoices.length} invoices payable</p>
        </div>
      </div>

      {/* Pending Milestones Requiring Approval */}
      {pendingApprovals.length > 0 && (
        <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Milestone Ready for Your Review & Sign-Off</h3>
          </div>
          {pendingApprovals.map((ms) => (
            <div
              key={ms.id}
              className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <h4 className="font-semibold text-white text-sm">{ms.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{ms.description}</p>
                <span className="inline-block mt-2 text-xs font-bold text-emerald-400">
                  Amount: ${ms.amount.toLocaleString()} {ms.currency}
                </span>
              </div>
              <Link
                href={`/portal/projects/${ms.project_id}/approvals`}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-all"
              >
                <span>Review & Sign Off</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Authorized Projects */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Your Development Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((proj) => {
            const milestones = db.getMilestones(proj.id, currentUser);
            const approvedCount = milestones.filter(m => m.status === 'approved').length;
            const progress = milestones.length > 0 ? Math.round((approvedCount / milestones.length) * 100) : 0;

            return (
              <div
                key={proj.id}
                className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-5 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                      {proj.name}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{proj.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {proj.description}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase shrink-0">
                    {proj.health.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Approved Milestones</span>
                    <span className="font-semibold text-white">{approvedCount} / {milestones.length} ({progress}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">
                    Target: {new Date(proj.target_date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/portal/projects/${proj.id}/feedback`}
                      className="px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 flex items-center gap-1 font-medium transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Studio</span>
                    </Link>
                    <Link
                      href={`/portal/projects/${proj.id}/overview`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center gap-1 font-medium transition-colors"
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

      {/* Outstanding Invoices Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Invoices & Milestone Billing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invoices.map((inv) => (
            <div
              key={inv.id}
              className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">{inv.invoice_number}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {inv.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{inv.notes || 'Milestone deliverable payment'}</p>
                <p className="text-sm font-bold text-white pt-1">
                  ${inv.total_amount.toLocaleString()} {inv.currency}
                </p>
              </div>

              {inv.status !== 'paid' ? (
                <button
                  onClick={() => setActivePaymentInvoice(inv)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 shrink-0 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Now</span>
                </button>
              ) : (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold px-3 py-1 rounded-lg bg-emerald-500/10">
                  <ShieldCheck className="w-4 h-4" /> Settled
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
