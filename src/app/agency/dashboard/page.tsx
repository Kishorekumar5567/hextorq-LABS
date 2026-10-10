'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { Project, Meeting } from '@/types';
import {
  FolderGit2,
  DollarSign,
  Eye,
  Calendar,
  ArrowUpRight,
  Plus,
  Clock,
  Video,
  Activity,
  Layers,
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
  const recentActivities = projects.flatMap(p => db.getActivity(p.id, currentUser)).slice(0, 5);

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.07] pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-zinc-100 tracking-tight">
            Agency Operations HQ
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time project deliverables, client review pins, meeting syncs, and milestone billing.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start sm:self-auto transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl ui-surface border border-white/[0.07] space-y-2">
          <span className="text-[11px] font-mono uppercase text-zinc-500">Active Projects</span>
          <div className="text-2xl font-bold text-zinc-100 font-mono">{projects.length}</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            100% on schedule
          </p>
        </div>

        <div className="p-4 rounded-xl ui-surface border border-white/[0.07] space-y-2">
          <span className="text-[11px] font-mono uppercase text-zinc-500">Pending Feedback Pins</span>
          <div className="text-2xl font-bold text-zinc-100 font-mono">{openAnnotations.length}</div>
          <p className="text-[11px] text-amber-400">Review studio tasks</p>
        </div>

        <div className="p-4 rounded-xl ui-surface border border-white/[0.07] space-y-2">
          <span className="text-[11px] font-mono uppercase text-zinc-500">Escrow Invoices Issued</span>
          <div className="text-2xl font-bold text-zinc-100 font-mono">${totalOutstanding.toLocaleString()}</div>
          <p className="text-[11px] text-zinc-400">{outstandingInvoices.length} invoices pending settlement</p>
        </div>

        <div className="p-4 rounded-xl ui-surface border border-white/[0.07] space-y-2">
          <span className="text-[11px] font-mono uppercase text-zinc-500">Upcoming Syncs</span>
          <div className="text-2xl font-bold text-zinc-100 font-mono">{meetings.length}</div>
          <p className="text-[11px] text-zinc-400">LiveKit video room</p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-200">Active Client Projects</h2>
          <Link href="/agency/projects" className="text-xs text-zinc-400 hover:text-white font-medium">
            View All Projects →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj) => {
            const milestones = db.getMilestones(proj.id, currentUser);
            const approvedCount = milestones.filter(m => m.status === 'approved').length;
            const progress = milestones.length > 0 ? Math.round((approvedCount / milestones.length) * 100) : 0;

            return (
              <div
                key={proj.id}
                className="p-5 rounded-xl ui-surface border border-white/[0.07] hover:border-white/[0.15] transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-zinc-500">
                      {proj.client?.name || 'Client Org'}
                    </span>
                    <h3 className="text-base font-bold text-zinc-100 mt-0.5">{proj.name}</h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    {proj.health.replace('_', ' ')}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>Milestones Approved</span>
                    <span className="font-mono text-zinc-200">{approvedCount} / {milestones.length} ({progress}%)</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-zinc-100 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-zinc-300">
                    ${proj.budget.toLocaleString()} {proj.currency}
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/agency/projects/${proj.id}/feedback`}
                      className="px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 text-xs font-medium flex items-center gap-1 border border-white/[0.08]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Studio</span>
                    </Link>
                    <Link
                      href={`/agency/projects/${proj.id}/overview`}
                      className="px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1"
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

      {/* Split Section: Upcoming Meetings & Live Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Meetings */}
        <div className="p-5 rounded-xl ui-surface border border-white/[0.07] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="font-semibold text-zinc-200 text-xs font-mono uppercase">Client Video Syncs</h3>
            <span className="text-[11px] text-zinc-500 font-mono">LiveKit WebRTC</span>
          </div>

          <div className="space-y-3">
            {meetings.map((m) => (
              <div key={m.id} className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/[0.06] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-zinc-200 text-xs">{m.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(m.start_time).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveMeeting(m)}
                  className="px-3 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold flex items-center gap-1 shrink-0"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Call</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Activity */}
        <div className="p-5 rounded-xl ui-surface border border-white/[0.07] space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="font-semibold text-zinc-200 text-xs font-mono uppercase">Append-Only Audit Log</h3>
            <span className="text-[11px] text-zinc-500 font-mono">Real-time Stream</span>
          </div>

          <div className="space-y-2.5">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-start gap-2.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-zinc-300 leading-tight">
                    <strong className="text-zinc-100 font-semibold">{act.actor?.full_name}:</strong>{' '}
                    {act.action.replace('_', ' ')}
                  </p>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-[#0E1017] border border-white/[0.1] rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-semibold text-zinc-100 text-sm">Create New Client Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="text-xs text-zinc-300 block mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NextGen Web Portal"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-md bg-[#08090C] border border-white/[0.1] text-white focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 block mb-1">Client Organization</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-md bg-[#08090C] border border-white/[0.1] text-white focus:outline-none focus:border-zinc-400"
                >
                  {db.clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-300 block mb-1">Budget ($ USD)</label>
                <input
                  type="number"
                  required
                  value={projectBudget}
                  onChange={(e) => setProjectBudget(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-md bg-[#08090C] border border-white/[0.1] text-white focus:outline-none focus:border-zinc-400 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-300 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-md bg-[#08090C] border border-white/[0.1] text-white focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-1.5 rounded-md bg-white/[0.06] text-xs text-zinc-300 hover:bg-white/[0.1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-md bg-zinc-100 text-xs font-semibold text-zinc-950 hover:bg-white"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {activeMeeting && (
        <VideoRoomModal meeting={activeMeeting} onClose={() => setActiveMeeting(null)} />
      )}
    </div>
  );
}
