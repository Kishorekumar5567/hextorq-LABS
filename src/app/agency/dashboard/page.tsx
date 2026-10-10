'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { Project, Meeting } from '@/types';
import {
  FolderGit2,
  DollarSign,
  AlertCircle,
  Eye,
  Calendar,
  ArrowUpRight,
  Plus,
  Clock,
  Sparkles,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { VideoRoomModal } from '@/components/meetings/VideoRoomModal';

export default function AgencyDashboardPage() {
  const { currentUser } = useAuth();
  const projects = db.getProjects(currentUser);
  const invoices = db.getInvoices(currentUser);
  const allAnnotations = projects.flatMap(p => db.getVisualAnnotations(p.id, currentUser));
  const openAnnotations = allAnnotations.filter(a => a.status !== 'resolved');
  const outstandingInvoices = invoices.filter(i => i.status === 'issued' || i.status === 'pending');
  const totalOutstanding = outstandingInvoices.reduce((sum, i) => sum + i.total_amount, 0);
  const meetings = projects.flatMap(p => db.getMeetings(p.id, currentUser));

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);

  // New project form state
  const [projectName, setProjectName] = useState('');
  const [projectBudget, setProjectBudget] = useState(50000);
  const [projectDesc, setProjectDesc] = useState('');
  const [clientId, setClientId] = useState('client-apex-01');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      db.createProject(
        {
          agency_id: db.agency.id,
          client_id: clientId,
          name: projectName,
          slug: projectName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          description: projectDesc,
          status: 'active',
          health: 'on_track',
          budget: Number(projectBudget),
          currency: 'USD',
          start_date: new Date().toISOString().split('T')[0],
          target_date: '2026-08-30',
        },
        currentUser
      );
      setShowCreateModal(false);
      setProjectName('');
      setProjectDesc('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Agency Operations HQ
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Real-time project health, client review pins, meeting rooms, and escrow invoices.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Client Project</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel-interactive border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Projects</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{projects.length}</div>
            <p className="text-[11px] text-emerald-400 mt-0.5">100% On-Track Deliverables</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel-interactive border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Pending Feedback Pins</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{openAnnotations.length}</div>
            <p className="text-[11px] text-amber-400 mt-0.5">Awaiting team resolution</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel-interactive border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Outstanding Invoices</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              ${totalOutstanding.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{outstandingInvoices.length} invoices issued</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-panel-interactive border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Upcoming Meetings</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{meetings.length}</div>
            <p className="text-[11px] text-purple-400 mt-0.5">LiveKit Video Enabled</p>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Managed Client Projects</h2>
          <Link href="/agency/projects" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
            View All Projects →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {projects.map((proj) => {
            const milestones = db.getMilestones(proj.id, currentUser);
            const approvedCount = milestones.filter(m => m.status === 'approved').length;
            const progress = milestones.length > 0 ? Math.round((approvedCount / milestones.length) * 100) : 0;

            return (
              <div
                key={proj.id}
                className="p-6 rounded-2xl glass-panel border border-slate-800/80 hover:border-indigo-500/40 transition-all space-y-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      {proj.client?.name || 'Client Org'}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{proj.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase shrink-0">
                    {proj.health.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Milestones Completed</span>
                    <span className="font-semibold text-white">{approvedCount} / {milestones.length} ({progress}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
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

      {/* Upcoming Video Meetings */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Scheduled Client Video Meetings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-2xl glass-panel border border-slate-800 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-purple-400 uppercase">
                  Apex Commerce Redesign
                </span>
                <h4 className="font-bold text-white text-sm">{m.title}</h4>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(m.start_time).toLocaleString()} ({m.time_zone})</span>
                </div>
              </div>

              <button
                onClick={() => setActiveMeeting(m)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 shrink-0 transition-all"
              >
                <Video className="w-4 h-4" />
                <span>Join Video Room</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* New Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0E1524] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-white text-base">Create New Client Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NextGen Web Portal"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Client Organization</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                >
                  {db.clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Budget ($ USD)</label>
                <input
                  type="number"
                  required
                  value={projectBudget}
                  onChange={(e) => setProjectBudget(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Room Modal */}
      {activeMeeting && (
        <VideoRoomModal meeting={activeMeeting} onClose={() => setActiveMeeting(null)} />
      )}
    </div>
  );
}
