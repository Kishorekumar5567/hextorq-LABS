'use client';

import React, { use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import {
  ExternalLink,
  ShieldCheck,
  Activity,
  ArrowRight,
  GitBranch,
  Calendar,
  DollarSign,
  Ticket,
} from 'lucide-react';
import Link from 'next/link';

export default function AgencyProjectOverviewPage({
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
      <div className="p-8 text-center text-rose-400">
        <p className="font-semibold">{err.message}</p>
      </div>
    );
  }

  const milestones = db.getMilestones(projectId, currentUser);
  const preview = db.getCurrentPreview(projectId, currentUser);
  const activities = db.getActivity(projectId, currentUser);
  const tickets = db.getTickets(projectId, currentUser);
  const openTickets = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed');

  return (
    <div className="flex flex-col min-h-full">
      <ProjectHeaderTabs project={project} basePath="/agency/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[11px] font-mono uppercase tracking-wider">PROJECT HEALTH</span>
              <span className={`w-2 h-2 rounded-full ${project.health === 'on_track' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </div>
            <p className="text-lg font-semibold text-zinc-100 tracking-tight capitalize">
              {project.status.replace('_', ' ')}
            </p>
            <p className="text-[11px] text-zinc-500 font-mono">Status: {project.health.replace('_', ' ')}</p>
          </div>

          <div className="p-4 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[11px] font-mono uppercase tracking-wider">ESCROW BUDGET</span>
              <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <p className="text-lg font-semibold text-zinc-100 font-mono tracking-tight">
              ${project.budget.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">{project.currency}</span>
            </p>
            <p className="text-[11px] text-zinc-500">Milestone escrow released upon signature</p>
          </div>

          <div className="p-4 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[11px] font-mono uppercase tracking-wider">TARGET LAUNCH</span>
              <Calendar className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <p className="text-lg font-semibold text-zinc-100 tracking-tight">
              {new Date(project.target_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            <p className="text-[11px] text-zinc-500 font-mono">Current Sprint on schedule</p>
          </div>

          <div className="p-4 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-2">
            <div className="flex items-center justify-between text-zinc-500">
              <span className="text-[11px] font-mono uppercase tracking-wider">ACTIVE ISSUES</span>
              <Ticket className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            <p className="text-lg font-semibold text-zinc-100 font-mono tracking-tight">
              {openTickets.length} <span className="text-xs text-zinc-500 font-normal">open</span>
            </p>
            <p className="text-[11px] text-zinc-500">Client reviews & engineering tasks</p>
          </div>
        </div>

        {/* Staging Deployment Banner */}
        <div className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                VERCEL PREVIEW ACTIVE
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
              Visual Feedback SDK initialized with secure DOM sanitization. Clients can pin feedback directly.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/agency/projects/${projectId}/feedback`}
              className="btn-primary"
            >
              <span>Launch Review Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2-Column: Milestones & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Milestones Card */}
          <div className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="font-semibold text-zinc-100 text-sm">Milestones & Deliverables</h3>
                <p className="text-xs text-zinc-500">Client approval releases milestone escrow funds</p>
              </div>
              <Link href={`/agency/projects/${projectId}/milestones`} className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                View all →
              </Link>
            </div>

            <div className="space-y-2.5">
              {milestones.map((ms) => (
                <div
                  key={ms.id}
                  className="p-3 rounded-md bg-[#090A0F] border border-white/[0.06] space-y-1.5 hover:border-white/[0.12] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-zinc-200 text-xs">{ms.title}</h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase tracking-wide border ${
                      ms.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      ms.status === 'ready_for_review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-white/[0.04] text-zinc-400 border-white/[0.06]'
                    }`}>
                      {ms.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">{ms.description}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 text-zinc-500 font-mono">
                    <span>Due: {ms.due_date}</span>
                    <span className="text-zinc-300 font-medium">${ms.amount.toLocaleString()} {ms.currency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Stream */}
          <div className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="font-semibold text-zinc-100 text-sm">Audit Activity Stream</h3>
                <p className="text-xs text-zinc-500">Cryptographically verifiable immutable audit log</p>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Live
              </span>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 6).map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs border-b border-white/[0.03] pb-2.5 last:border-0 last:pb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                  <div className="space-y-0.5 flex-1">
                    <p className="text-zinc-300 text-xs leading-relaxed">
                      <span className="text-zinc-100 font-medium">{act.actor?.full_name || 'System'}:</span>{' '}
                      <span className="text-zinc-400">{act.action.replace('_', ' ')}</span>
                    </p>
                    <p className="text-[10px] text-zinc-600 font-mono">
                      {new Date(act.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
