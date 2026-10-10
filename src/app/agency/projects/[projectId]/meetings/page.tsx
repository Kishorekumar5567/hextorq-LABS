'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { Meeting } from '@/types';
import { Video, Plus, Calendar, Clock, X, ShieldCheck } from 'lucide-react';
import { VideoRoomModal } from '@/components/meetings/VideoRoomModal';

export default function AgencyMeetingsPage({
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

  const [meetings, setMeetings] = useState<Meeting[]>(() => db.getMeetings(projectId, currentUser));
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [date, setDate] = useState('2026-04-15T15:00');

  const handleScheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const start = new Date(date).toISOString();
    const end = new Date(new Date(date).getTime() + 3600000).toISOString();

    db.createMeeting(projectId, currentUser, title, desc, start, end, 'America/New_York');
    setMeetings(db.getMeetings(projectId, currentUser));
    setShowModal(false);
    setTitle('');
    setDesc('');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/agency/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
              <span>PROJECT COLLABORATION</span>
              <span>/</span>
              <span className="text-zinc-300">LIVEKIT VIDEO ROOMS</span>
            </div>
            <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Synchronous Reviews & Meetings</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Encrypted WebRTC rooms with screen sharing, pin reviews, and verifiable attendee rosters.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Room</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meetings.map((m) => (
            <div
              key={m.id}
              className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] hover:border-white/[0.14] transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded">
                      LiveKit WebRTC
                    </span>
                    <h3 className="text-sm font-semibold text-zinc-100 mt-1.5">{m.title}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide border shrink-0 ${
                    m.status === 'scheduled'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-white/[0.04] text-zinc-400 border-white/[0.06]'
                  }`}>
                    {m.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{m.description}</p>

                <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono bg-[#090A0F] p-2.5 rounded-md border border-white/[0.05]">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  <span>{new Date(m.start_time).toLocaleString()} ({m.time_zone})</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-xs">
                <span className="text-[11px] text-zinc-500 font-mono">Host: {m.creator?.full_name || 'Lead'}</span>
                <button
                  onClick={() => setActiveMeeting(m)}
                  className="btn-primary"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Session</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Schedule Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="bg-[#0E1017] border border-white/[0.1] rounded-lg p-5 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h3 className="font-semibold text-zinc-100 text-sm">Schedule LiveKit Room</h3>
                <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleScheduleMeeting} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Session Topic</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sprint 7 Architecture Walkthrough"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Agenda & Objectives</label>
                  <textarea
                    rows={3}
                    placeholder="Topics to discuss, review deliverables..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Scheduled Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Create Room
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Video Call Modal */}
        {activeMeeting && (
          <VideoRoomModal
            meeting={activeMeeting}
            onClose={() => setActiveMeeting(null)}
          />
        )}
      </div>
    </div>
  );
}
