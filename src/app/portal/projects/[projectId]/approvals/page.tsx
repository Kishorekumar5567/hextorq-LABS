'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { Milestone, MilestoneApproval } from '@/types';
import { ShieldCheck, CheckCircle2, FileSignature, X, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ClientApprovalsPage({
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

  const milestones = db.getMilestones(projectId, currentUser);
  const [approvals, setApprovals] = useState<MilestoneApproval[]>(db.approvals.filter(a => a.project_id === projectId));
  const [activeSignMilestone, setActiveSignMilestone] = useState<Milestone | null>(null);
  const [signatureName, setSignatureName] = useState(currentUser.full_name);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSignOff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSignMilestone || !signatureName) return;

    setSubmitting(true);
    try {
      db.approveMilestone(
        projectId,
        activeSignMilestone.id,
        currentUser,
        `${signatureName} [${project.client?.company_name || 'Client'}]`,
        approvalNotes
      );

      setApprovals([...db.approvals.filter(a => a.project_id === projectId)]);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setActiveSignMilestone(null);
      setApprovalNotes('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/portal/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="border-b border-white/[0.06] pb-5">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
            <span>GOVERNANCE</span>
            <span>/</span>
            <span className="text-zinc-300">MILESTONE SIGN-OFFS</span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Formal Milestone Acceptance & Sign-Off</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Cryptographic client authorization chamber. Approving a sprint deliverable certifies acceptance and releases escrow funds.
          </p>
        </div>

        <div className="space-y-3.5">
          {milestones.map((ms, index) => {
            const approvalRecord = approvals.find(a => a.milestone_id === ms.id);
            const isApproved = ms.status === 'approved' || !!approvalRecord;
            const canApprove = ms.status === 'ready_for_review';

            return (
              <div
                key={ms.id}
                className={`p-5 rounded-lg bg-[#0E1017] border transition-all space-y-3.5 ${
                  isApproved
                    ? 'border-emerald-500/30'
                    : canApprove
                    ? 'border-amber-500/30'
                    : 'border-white/[0.07]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center font-mono font-medium text-xs border ${
                      isApproved
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : canApprove
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-white/[0.04] text-zinc-400 border-white/[0.06]'
                    }`}>
                      0{index + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">{ms.title}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>Target: {ms.due_date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-semibold text-zinc-100 text-sm">
                      ${ms.amount.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">{ms.currency}</span>
                    </span>

                    {canApprove && (
                      <button
                        onClick={() => setActiveSignMilestone(ms)}
                        className="btn-primary"
                      >
                        <FileSignature className="w-3.5 h-3.5" />
                        <span>Sign Off Deliverable</span>
                      </button>
                    )}

                    {isApproved && (
                      <span className="flex items-center gap-1 text-[10px] font-mono uppercase text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" /> Formally Approved
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed bg-[#090A0F] p-3 rounded-md border border-white/[0.04]">
                  {ms.description}
                </p>

                {approvalRecord && (
                  <div className="p-3 rounded-md bg-emerald-500/[0.06] border border-emerald-500/20 space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between text-emerald-400">
                      <span>Digital Signature: {approvalRecord.digital_signature}</span>
                      <span className="text-zinc-500 text-[10px]">{new Date(approvalRecord.approved_at).toLocaleString()}</span>
                    </div>
                    {approvalRecord.notes && (
                      <p className="text-zinc-400 text-[11px]">Audit Notes: "{approvalRecord.notes}"</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Digital Sign-off Modal */}
        {activeSignMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="bg-[#0E1017] border border-white/[0.1] rounded-lg p-5 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h3 className="font-semibold text-zinc-100 text-sm">Formal Milestone Acceptance</h3>
                <button onClick={() => setActiveSignMilestone(null)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-md bg-[#090A0F] border border-white/[0.05] space-y-1 text-xs">
                <span className="text-[10px] text-amber-400 font-mono uppercase">DELIVERABLE UNDER REVIEW</span>
                <p className="font-medium text-zinc-200">{activeSignMilestone.title}</p>
                <p className="text-emerald-400 font-mono font-semibold">${activeSignMilestone.amount.toLocaleString()} {activeSignMilestone.currency}</p>
              </div>

              <form onSubmit={handleSignOff} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Your Full Legal Name (Sign-off)</label>
                  <input
                    type="text"
                    required
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Acceptance Remarks (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Verified responsive checkout flow across desktop and mobile."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div className="p-2.5 rounded-md bg-amber-500/[0.06] border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed font-mono">
                  By clicking "Execute Sign-Off", you certify that you have inspected the deliverable and authorize the release of the milestone escrow.
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setActiveSignMilestone(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Execute Sign-Off</span>
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
