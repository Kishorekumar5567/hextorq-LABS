'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { Milestone, MilestoneStatus } from '@/types';
import { CheckCircle2, Clock, ShieldCheck, Plus, AlertCircle } from 'lucide-react';

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
    setMilestones(db.getMilestones(projectId, currentUser));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/agency/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Milestone Roadmap & Sign-Offs</h2>
            <p className="text-xs text-slate-400 mt-1">
              Phased development contracts, deliverable verification, and formal client sign-off records.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {milestones.map((ms, index) => (
            <div
              key={ms.id}
              className={`p-6 rounded-2xl glass-panel border space-y-4 transition-all ${
                ms.status === 'approved' ? 'border-emerald-500/30' :
                ms.status === 'ready_for_review' ? 'border-amber-500/30' :
                'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    ms.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    ms.status === 'ready_for_review' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{ms.title}</h3>
                    <p className="text-xs text-slate-400">Target Date: {ms.due_date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={ms.status}
                    onChange={(e) => handleStatusChange(ms.id, e.target.value as any)}
                    className="text-xs bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="ready_for_review">Ready for Review</option>
                    <option value="approved">Approved</option>
                  </select>

                  <span className="font-bold text-white text-sm">
                    ${ms.amount.toLocaleString()} {ms.currency}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                {ms.description}
              </p>

              {ms.status === 'approved' && ms.approved_at && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 font-medium">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>
                    Formally Approved by Client on {new Date(ms.approved_at).toLocaleString()}. Escrow released.
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
