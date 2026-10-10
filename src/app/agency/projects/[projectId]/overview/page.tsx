'use client';

import React, { use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  Activity,
  Layers,
  ArrowRight,
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

  return (
    <div className="flex flex-col min-h-full">
      <ProjectHeaderTabs project={project} basePath="/agency/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Project Status</span>
            <p className="text-lg font-bold text-emerald-400 capitalize">
              {project.status.replace('_', ' ')}
            </p>
            <p className="text-[11px] text-slate-500">Health: {project.health.replace('_', ' ')}</p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Total Budget</span>
            <p className="text-lg font-bold text-white">
              ${project.budget.toLocaleString()} {project.currency}
            </p>
            <p className="text-[11px] text-slate-500">Escrow Milestone Model</p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Target Launch Date</span>
            <p className="text-lg font-bold text-white">
              {new Date(project.target_date).toLocaleDateString()}
            </p>
            <p className="text-[11px] text-indigo-400">Sprint 6 in progress</p>
          </div>

          <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Open Tickets</span>
            <p className="text-lg font-bold text-white">
              {tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length}
            </p>
            <p className="text-[11px] text-amber-400">Active tasks and bugs</p>
          </div>
        </div>

        {/* Staging Deployment Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/30 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                ACTIVE VERCEL PREVIEW
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {preview?.git_branch || 'main'}
              </span>
            </div>
            <h3 className="font-bold text-white text-base">
              {preview?.deployment_url || 'No active preview registered'}
            </h3>
            <p className="text-xs text-slate-400">
              Verified with SSL & Visual Feedback SDK. Ready for client review.
            </p>
          </div>

          <Link
            href={`/agency/projects/${projectId}/feedback`}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 shrink-0 self-start sm:self-auto transition-all"
          >
            <span>Launch Review Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 2-Column: Milestones & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Milestones Card */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Milestone Progress</h3>
              <Link href={`/agency/projects/${projectId}/milestones`} className="text-xs text-indigo-400 hover:underline">
                View all →
              </Link>
            </div>

            <div className="space-y-3">
              {milestones.map((ms) => (
                <div
                  key={ms.id}
                  className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white text-xs">{ms.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      ms.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      ms.status === 'ready_for_review' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {ms.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{ms.description}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500">Due: {ms.due_date}</span>
                    <span className="font-semibold text-white">${ms.amount.toLocaleString()} {ms.currency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Stream */}
          <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Append-Only Audit Stream</h3>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                Live
              </span>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 6).map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="text-slate-300 font-medium leading-relaxed">
                      <span className="text-white font-semibold">{act.actor?.full_name || 'System'}:</span>{' '}
                      {act.action.replace('_', ' ')}
                    </p>
                    <p className="text-[10px] text-slate-500">
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
