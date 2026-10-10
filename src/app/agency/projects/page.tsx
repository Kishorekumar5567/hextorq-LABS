'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { FolderGit2, Plus, Search, Filter, ArrowUpRight, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AgencyProjectsPage() {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const allProjects = db.getProjects(currentUser);
  const filteredProjects = allProjects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Client Projects Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage active software development projects, milestones, budgets, and client previews.
          </p>
        </div>

        <Link
          href="/agency/dashboard"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl glass-panel border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="in_review">In Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((proj) => {
          const milestones = db.getMilestones(proj.id, currentUser);
          const approvedCount = milestones.filter(m => m.status === 'approved').length;
          const progress = milestones.length > 0 ? Math.round((approvedCount / milestones.length) * 100) : 0;

          return (
            <div
              key={proj.id}
              className="p-6 rounded-2xl glass-panel border border-slate-800 hover:border-indigo-500/40 transition-all space-y-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    {proj.client?.name || 'Client Org'}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">{proj.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {proj.description}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase shrink-0">
                  {proj.health.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Deliverables Approved</span>
                  <span className="font-semibold text-white">{approvedCount} / {milestones.length} ({progress}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="font-bold text-white">
                  ${proj.budget.toLocaleString()} {proj.currency}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/agency/projects/${proj.id}/feedback`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review Studio</span>
                  </Link>
                  <Link
                    href={`/agency/projects/${proj.id}/overview`}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center gap-1 font-medium transition-colors"
                  >
                    <span>Manage</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
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
