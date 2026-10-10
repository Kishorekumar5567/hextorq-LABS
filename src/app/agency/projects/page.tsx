'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { Plus, Search, Eye, ArrowRight, GitBranch, Layers, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AgencyProjectsPage() {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const allProjects = db.getProjects(currentUser);
  const filteredProjects = allProjects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.description.toLowerCase().includes(search.toLowerCase()) ||
                          (p.client?.name && p.client.name.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Page Title & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
            <span>AGENCY WORKSPACE</span>
            <span>/</span>
            <span className="text-zinc-300">CLIENT PROJECTS</span>
          </div>
          <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Active Projects Portfolio</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Production builds, staging previews, escrow milestones, and client sign-off pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/agency/dashboard"
            className="btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Client Project</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-[#0E1017] rounded-lg border border-white/[0.07]">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects, clients, deliverables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-md bg-[#090A0F] border border-white/[0.07] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
          />
        </div>

        {/* Status Pill Filter */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Projects' },
            { id: 'active', label: 'Active' },
            { id: 'in_review', label: 'In Review' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                statusFilter === tab.id
                  ? 'bg-white/[0.1] text-zinc-100 border border-white/[0.12]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((proj) => {
          const milestones = db.getMilestones(proj.id, currentUser);
          const approvedCount = milestones.filter(m => m.status === 'approved').length;
          const progress = milestones.length > 0 ? Math.round((approvedCount / milestones.length) * 100) : 0;
          const currentPreview = db.getCurrentPreview(proj.id, currentUser);

          return (
            <div
              key={proj.id}
              className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] hover:border-white/[0.16] transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded">
                        {proj.client?.name || 'Client Org'}
                      </span>
                      {currentPreview?.git_branch && (
                        <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
                          <GitBranch className="w-2.5 h-2.5 text-zinc-500" />
                          <span>{currentPreview.git_branch}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-zinc-100 mt-1.5 tracking-tight">{proj.name}</h3>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide border shrink-0 ${
                    proj.health === 'on_track'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : proj.health === 'at_risk'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                  }`}>
                    {proj.health.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              {/* Milestones & Progress */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 text-[11px]">Milestones Approved</span>
                  <span className="font-mono text-zinc-300 text-[11px] font-medium">
                    {approvedCount}/{milestones.length} ({progress}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-zinc-200 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Footer / Meta & Actions */}
              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 block">ESCROW BUDGET</span>
                  <span className="font-mono text-sm font-semibold text-zinc-100">
                    ${proj.budget.toLocaleString()} <span className="text-xs text-zinc-500 font-normal">{proj.currency}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/agency/projects/${proj.id}/feedback`}
                    className="btn-secondary"
                  >
                    <Eye className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Review Studio</span>
                  </Link>
                  <Link
                    href={`/agency/projects/${proj.id}/overview`}
                    className="btn-secondary"
                  >
                    <span>Overview</span>
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
