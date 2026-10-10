'use client';

import React, { use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { ShieldAlert, ArrowRight, GitBranch, Calendar, Ticket, CheckCircle2 } from 'lucide-react';
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
      <div className="p-8 max-w-md mx-auto text-center space-y-4 my-16 bg-[#0E1017] border border-rose-500/30 rounded-lg p-6">
        <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h2 className="text-base font-semibold text-zinc-100">Cross-Client Access Prohibited (403)</h2>
        <p className="text-xs text-zinc-400 leading-relaxed font-mono">
          {err.message}
        </p>
        <Link
          href="/portal/projects"
          className="btn-primary"
        >
          Return to Authorized Projects
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

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="p-4 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[11px] font-mono uppercase tracking-wider">DELIVERY HEALTH</span>
              <span className={`w-2 h-2 rounded-full ${project.health === 'on_track' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </div>
            <p className="text-lg font-semibold text-zinc-100 tracking-tight capitalize">
              {project.health.replace('_', ' ')}
            </p>
            <p className="text-[11px] text-zinc-500 font-mono">All sprint deliverables on schedule</p>
          </div>

          <div className="p-4 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[11px] font-mono uppercase tracking-wider">TARGET LAUNCH</span>
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <p className="text-lg font-semibold text-zinc-100 tracking-tight">
              {new Date(project.target_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-[11px] text-zinc-500 font-mono">Final QA sign-off pending</p>
          </div>

          <div className="p-4 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[11px] font-mono uppercase tracking-wider">CLIENT ISSUES</span>
              <Ticket className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <p className="text-lg font-semibold text-zinc-100 font-mono tracking-tight">
              {tickets.length} <span className="text-xs text-zinc-500 font-normal">active</span>
            </p>
            <p className="text-[11px] text-zinc-500">Feedback and revisions submitted</p>
          </div>
        </div>

        {/* Staging Deployment Box */}
        <div className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                VERCEL PREVIEW READY
              </span>
              {preview?.git_branch && (
                <span className="text-xs text-zinc-400 font-mono flex items-center gap-1 bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.06]">
                  <GitBranch className="w-3 h-3 text-zinc-500" />
                  {preview.git_branch}
                </span>
              )}
            </div>
            <h3 className="font-mono text-xs text-zinc-200">
              {preview?.deployment_url || 'https://staging-preview.vercel.app'}
            </h3>
            <p className="text-xs text-zinc-500">
              Leave point-and-click visual feedback directly on this preview build using the Review Studio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/portal/projects/${projectId}/feedback`}
              className="btn-primary"
            >
              <span>Launch Review Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Milestones Card */}
        <div className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm">Contract Milestones</h3>
              <p className="text-xs text-zinc-500">Review deliverables and authorize milestone escrow releases</p>
            </div>
            <Link href={`/portal/projects/${projectId}/approvals`} className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
              Sign off on milestones →
            </Link>
          </div>

          <div className="space-y-2.5">
            {milestones.map((ms) => (
              <div
                key={ms.id}
                className="p-3.5 rounded-md bg-[#090A0F] border border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-medium text-zinc-200 text-xs">{ms.title}</h4>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{ms.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wide border ${
                    ms.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    ms.status === 'ready_for_review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    'bg-white/[0.04] text-zinc-400 border-white/[0.06]'
                  }`}>
                    {ms.status.replace('_', ' ')}
                  </span>
                  <span className="font-mono font-medium text-zinc-200 text-xs">
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
