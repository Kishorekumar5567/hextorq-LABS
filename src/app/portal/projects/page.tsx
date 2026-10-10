'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { Eye, ArrowRight, GitBranch, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function ClientProjectsPage() {
  const { currentUser } = useAuth();
  const projects = db.getProjects(currentUser);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
          <span>PORTAL</span>
          <span>/</span>
          <span className="text-zinc-300">ACTIVE COMMISSIONS</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Your Development Projects</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Active software deliverables, live staging previews, and formal milestone approvals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((proj) => {
          const milestones = db.getMilestones(proj.id, currentUser);
          const approvedCount = milestones.filter(m => m.status === 'approved').length;
          const progress = milestones.length > 0 ? Math.round((approvedCount / milestones.length) * 100) : 0;
          const currentPreview = db.getCurrentPreview(proj.id, currentUser);

          return (
            <div
              key={proj.id}
              className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] hover:border-white/[0.14] transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-zinc-100 tracking-tight">{proj.name}</h3>
                    {currentPreview?.git_branch && (
                      <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 mt-1">
                        <GitBranch className="w-2.5 h-2.5 text-zinc-500" />
                        <span>{currentPreview.git_branch}</span>
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide border shrink-0 ${
                    proj.health === 'on_track'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {proj.health.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{proj.description}</p>
              </div>

              {/* Progress */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-500 text-[11px]">Milestones Approved</span>
                  <span className="text-zinc-300 text-[11px] font-medium">{approvedCount}/{milestones.length} ({progress}%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-zinc-200 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-zinc-500 font-mono text-[11px]">
                  <Calendar className="w-3 h-3" />
                  <span>Target: {proj.target_date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/portal/projects/${proj.id}/feedback`}
                    className="btn-secondary"
                  >
                    <Eye className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Review Studio</span>
                  </Link>
                  <Link
                    href={`/portal/projects/${proj.id}/overview`}
                    className="btn-secondary"
                  >
                    <span>Workspace</span>
                    <ArrowRight className="w-3 h-3 text-zinc-400" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
