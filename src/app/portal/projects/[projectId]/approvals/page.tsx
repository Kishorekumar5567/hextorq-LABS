'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { Milestone, MilestoneApproval } from '@/types';
import { ShieldCheck, CheckCircle2, AlertCircle, FileSignature, Sparkles } from 'lucide-react';
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
      const approval = db.approveMilestone(
        projectId,
        activeSignMilestone.id,
        currentUser,
        `${signatureName} [${project.client?.company_name || 'Client'}]`,
        approvalNotes
      );

      setApprovals([...db.approvals.filter(a => a.project_id === projectId)]);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
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
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Milestone Deliverable Sign-Offs</h2>
          <p className="text-xs text-slate-400 mt-1">
            Review completed sprint deliverables and execute formal cryptographic digital sign-off to release escrow.
          </p>
        </div>

        <div className="space-y-4">
          {milestones.map((ms, index) => {
            const approvalRecord = approvals.find(a => a.milestone_id === ms.id);
            const isApproved = ms.status === 'approved' || !!approvalRecord;
            const canApprove = ms.status === 'ready_for_review';

            return (
              <div
                key={ms.id}
                className={`p-6 rounded-2xl glass-panel border space-y-4 transition-all ${
                  isApproved ? 'border-emerald-500/30 bg-emerald-950/5' :
                  canApprove ? 'border-amber-500/40 bg-amber-950/10' :
                  'border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      isApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      canApprove ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{ms.title}</h3>
                      <p className="text-xs text-slate-400">Target Date: {ms.due_date}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-sm">
                      ${ms.amount.toLocaleString()} {ms.currency}
                    </span>

                    {canApprove && (
                      <button
                        onClick={() => setActiveSignMilestone(ms)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
                      >
                        <FileSignature className="w-4 h-4" />
                        <span>Sign Off Deliverable</span>
                      </button>
                    )}

                    {isApproved && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <ShieldCheck className="w-4 h-4" /> Formally Approved
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  {ms.description}
                </p>

                {approvalRecord && (
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-emerald-400 font-semibold">
                      <span>Digital Signature: {approvalRecord.digital_signature}</span>
                      <span>{new Date(approvalRecord.approved_at).toLocaleString()}</span>
                    </div>
                    {approvalRecord.notes && (
                      <p className="text-slate-300 text-[11px]">Notes: "{approvalRecord.notes}"</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Digital Sign-off Modal */}
        {activeSignMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="bg-[#0E1524] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="font-bold text-white text-base">Formal Milestone Sign-Off</h3>
                <button onClick={() => setActiveSignMilestone(null)} className="text-slate-400 hover:text-white text-sm">
                  ✕
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <span className="text-[10px] text-amber-400 font-bold uppercase">Deliverable Under Review</span>
                <p className="font-semibold text-white">{activeSignMilestone.title}</p>
                <p className="text-emerald-400 font-bold">${activeSignMilestone.amount.toLocaleString()} {activeSignMilestone.currency}</p>
              </div>

              <form onSubmit={handleSignOff} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Your Full Name (Digital Signature)</label>
                  <input
                    type="text"
                    required
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Approval Notes or Remarks (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Tested on staging mobile checkout; all deliverables verified."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
                  By clicking "Execute Sign-Off", you certify that you have reviewed the deliverables and authorize the release of the milestone escrow.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveSignMilestone(null)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
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
