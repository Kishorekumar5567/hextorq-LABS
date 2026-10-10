'use client';

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { Eye, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ClientProjectsPage() {
  const { currentUser } = useAuth();
  const projects = db.getProjects(currentUser);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Your Projects</h1>
        <p className="text-xs text-slate-400 mt-1">
          Active development projects assigned to your organization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((proj) => {
          const milestones = db.getMilestones(proj.id, currentUser);
          const approvedCount = milestones.filter(m => m.status === 'approved').length;
          const progress = milestones.length > 0 ? Math.round((approvedCount / milestones.length) * 100) : 0;

          return (
            <div
              key={proj.id}
              className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4 hover:border-purple-500/40 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{proj.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.description}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase shrink-0">
                  {proj.health.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Approved Milestones</span>
                  <span className="font-semibold text-white">{approvedCount} / {milestones.length} ({progress}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Target: {proj.target_date}</span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/portal/projects/${proj.id}/feedback`}
                    className="px-3 py-1.5 rounded-lg bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 border border-purple-500/30 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review Studio</span>
                  </Link>
                  <Link
                    href={`/portal/projects/${proj.id}/overview`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 flex items-center gap-1 font-medium transition-colors"
                  >
                    <span>View Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
