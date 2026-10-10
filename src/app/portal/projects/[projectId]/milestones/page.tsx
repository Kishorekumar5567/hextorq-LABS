'use client';

import React, { use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { ShieldCheck, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ClientMilestonesPage({
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

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/portal/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
              <span>CONTRACT</span>
              <span>/</span>
              <span className="text-zinc-300">DELIVERABLE ROADMAP</span>
            </div>
            <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Milestone Progress & Sign-Offs</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Phased development timeline, deliverable verification, and formal client authorizations.
            </p>
          </div>

          <Link
            href={`/portal/projects/${projectId}/approvals`}
            className="btn-primary"
          >
            <span>Execute Sign-Off</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3.5">
          {milestones.map((ms, index) => {
            const isApproved = ms.status === 'approved';
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wide border ${
                      isApproved ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      canApprove ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-white/[0.04] text-zinc-400 border-white/[0.06]'
                    }`}>
                      {ms.status.replace('_', ' ')}
                    </span>
                    <span className="font-mono font-semibold text-zinc-100 text-sm">
                      ${ms.amount.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">{ms.currency}</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed bg-[#090A0F] p-3 rounded-md border border-white/[0.04]">
                  {ms.description}
                </p>

                {canApprove && (
                  <div className="pt-1 flex justify-end">
                    <Link
                      href={`/portal/projects/${projectId}/approvals`}
                      className="btn-primary"
                    >
                      <span>Sign Off on Deliverable</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
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
