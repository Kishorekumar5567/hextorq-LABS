'use client';

import React, { use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { ShieldAlert, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ClientProjectOverviewPage({
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
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4 my-16">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Cross-Client Access Prohibited (403)</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          {err.message}
        </p>
        <Link
          href="/portal/projects"
          className="inline-block px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
        >
          Return to My Authorized Projects
        </Link>
      </div>
    );
  }

  const milestones = db.getMilestones(projectId, currentUser);
  const preview = db.getCurrentPreview(projectId, currentUser);
  const tickets = db.getTickets(projectId, currentUser);

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/portal/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Development Health</span>
            <p className="text-lg font-bold text-emerald-400 uppercase">
              {project.health.replace('_', ' ')}
            </p>
            <p className="text-[11px] text-slate-500">Agreed Sprint Deliverables</p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Target Launch</span>
            <p className="text-lg font-bold text-white">
              {new Date(project.target_date).toLocaleDateString()}
            </p>
            <p className="text-[11px] text-purple-400">Milestone 3 in review</p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Open Tickets & Feedback</span>
            <p className="text-lg font-bold text-white">{tickets.length}</p>
            <p className="text-[11px] text-slate-500">Tracked in client portal</p>
          </div>
        </div>

        {/* Staging Deployment Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/30 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                LATEST STAGING BUILD
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {preview?.git_branch || 'main'}
              </span>
            </div>
            <h3 className="font-bold text-white text-base">
              {preview?.deployment_url || 'No active preview registered'}
            </h3>
            <p className="text-xs text-slate-400">
              Pin feedback directly on this preview using our Visual Review Studio.
            </p>
          </div>

          <Link
            href={`/portal/projects/${projectId}/feedback`}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-all"
          >
            <span>Launch Review Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Milestones Card */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Deliverable Milestones</h3>
            <Link href={`/portal/projects/${projectId}/approvals`} className="text-xs text-purple-400 hover:underline">
              Sign off on milestones →
            </Link>
          </div>

          <div className="space-y-3">
            {milestones.map((ms) => (
              <div
                key={ms.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-semibold text-white text-xs">{ms.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{ms.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                    ms.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                    ms.status === 'ready_for_review' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {ms.status.replace('_', ' ')}
                  </span>
                  <span className="font-semibold text-white text-xs">
                    ${ms.amount.toLocaleString()} {ms.currency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
