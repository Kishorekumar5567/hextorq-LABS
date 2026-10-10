'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { Meeting } from '@/types';
import { Video, Plus, Calendar, Clock, Sparkles } from 'lucide-react';
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Video Meetings & Architectural Syncs</h2>
            <p className="text-xs text-slate-400 mt-1">
              Encrypted video rooms powered by LiveKit with client attendees and live minutes.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {meetings.map((m) => (
            <div
              key={m.id}
              className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    LiveKit Encrypted Room
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{m.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{m.description}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase shrink-0">
                  {m.status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>{new Date(m.start_time).toLocaleString()} ({m.time_zone})</span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500">Host: {m.creator?.full_name || 'Team Lead'}</span>
                <button
                  onClick={() => setActiveMeeting(m)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-1.5 transition-all"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Video Call</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Schedule Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="bg-[#0E1524] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="font-bold text-white text-base">Schedule Meeting</h3>
              <form onSubmit={handleScheduleMeeting} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Meeting Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sprint 7 Architecture Walkthrough"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Agenda / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Topics to discuss, review deliverables..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-purple-600 text-xs font-semibold text-white hover:bg-purple-500"
                  >
                    Create Room
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
    </div>
  );
}
