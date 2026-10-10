'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { Milestone, MilestoneStatus } from '@/types';
import { CheckCircle2, ShieldCheck, DollarSign, Calendar } from 'lucide-react';

export default function AgencyMilestonesPage({
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

  const [milestones, setMilestones] = useState<Milestone[]>(() => db.getMilestones(projectId, currentUser));

  const handleStatusChange = (milestoneId: string, newStatus: MilestoneStatus) => {
    const ms = db.milestones.find(m => m.id === milestoneId);
    if (!ms) return;
    ms.status = newStatus;
    if (newStatus === 'approved' && !ms.approved_at) {
      ms.approved_at = new Date().toISOString();
    }
    setMilestones(db.getMilestones(projectId, currentUser));
  };

  const totalBudget = milestones.reduce((sum, m) => sum + m.amount, 0);
  const approvedBudget = milestones.filter(m => m.status === 'approved').reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/agency/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
              <span>PROJECT CONTRACT</span>
              <span>/</span>
              <span className="text-zinc-300">ESCROW ROADMAP</span>
            </div>
            <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Milestones & Sign-Off Schedule</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Deliverable verification, escrow release triggers, and cryptographically logged sign-offs.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[#0E1017] border border-white/[0.07] px-4 py-2 rounded-lg text-xs font-mono">
            <div>
              <span className="text-zinc-500 text-[10px] block">SETTLED</span>
              <span className="text-emerald-400 font-semibold">${approvedBudget.toLocaleString()}</span>
            </div>
            <span className="text-zinc-700">/</span>
            <div>
              <span className="text-zinc-500 text-[10px] block">TOTAL</span>
              <span className="text-zinc-200 font-semibold">${totalBudget.toLocaleString()} {project.currency}</span>
            </div>
          </div>
        </div>

        {/* Milestone Cards */}
        <div className="space-y-3.5">
          {milestones.map((ms, index) => {
            const isApproved = ms.status === 'approved';
            return (
              <div
                key={ms.id}
                className={`p-5 rounded-lg bg-[#0E1017] border transition-all space-y-3.5 ${
                  isApproved
                    ? 'border-emerald-500/30'
                    : ms.status === 'ready_for_review'
                    ? 'border-amber-500/30'
                    : 'border-white/[0.07]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center font-mono font-medium text-xs border ${
                      isApproved
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : ms.status === 'ready_for_review'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-white/[0.04] text-zinc-400 border-white/[0.06]'
                    }`}>
                      0{index + 1}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">{ms.title}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>Due {ms.due_date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={ms.status}
                      onChange={(e) => handleStatusChange(ms.id, e.target.value as any)}
                      className="text-xs bg-[#090A0F] border border-white/[0.08] text-zinc-200 rounded-md px-2.5 py-1 focus:outline-none focus:border-zinc-500 font-mono"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="ready_for_review">Ready for Review</option>
                      <option value="approved">Approved</option>
                    </select>

                    <span className="font-mono font-semibold text-zinc-100 text-sm">
                      ${ms.amount.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">{ms.currency}</span>
                    </span>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 leading-relaxed bg-[#090A0F] p-3 rounded-md border border-white/[0.04]">
                  {ms.description}
                </div>

                {isApproved && ms.approved_at && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/[0.06] p-2.5 rounded-md border border-emerald-500/20 font-mono">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>
                      Cryptographically Signed & Approved on {new Date(ms.approved_at).toLocaleString()}. Escrow funds settled.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
