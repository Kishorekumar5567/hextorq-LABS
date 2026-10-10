'use client';

import React, { use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Milestone Roadmap</h2>
            <p className="text-xs text-slate-400 mt-1">
              Phased development timeline, deliverable verification, and sign-offs.
            </p>
          </div>

          <Link
            href={`/portal/projects/${projectId}/approvals`}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>Execute Milestone Sign-Off</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-4">
          {milestones.map((ms, index) => (
            <div
              key={ms.id}
              className={`p-6 rounded-2xl glass-panel border space-y-3 transition-all ${
                ms.status === 'approved' ? 'border-emerald-500/30' :
                ms.status === 'ready_for_review' ? 'border-amber-500/40 bg-amber-950/10' :
                'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    ms.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    ms.status === 'ready_for_review' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
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
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                    ms.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                    ms.status === 'ready_for_review' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {ms.status.replace('_', ' ')}
                  </span>
                  <span className="font-bold text-white text-sm">
                    ${ms.amount.toLocaleString()} {ms.currency}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {ms.description}
              </p>

              {ms.status === 'ready_for_review' && (
                <div className="pt-2 flex justify-end">
                  <Link
                    href={`/portal/projects/${projectId}/approvals`}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow flex items-center gap-1"
                  >
                    <span>Sign Off on Milestone</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
