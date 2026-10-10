'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { Calendar, Video, Clock } from 'lucide-react';
import { VideoRoomModal } from '@/components/meetings/VideoRoomModal';
import { Meeting } from '@/types';

export default function AgencyCalendarPage() {
  const { currentUser } = useAuth();
  const [meetings, setMeetings] = useState(db.meetings);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
          <span>SCHEDULE</span>
          <span>/</span>
          <span className="text-zinc-300">CALENDAR TIMELINE</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100 tracking-tight">Synchronous Reviews & Sessions</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Global timeline of client architecture syncs, visual milestone reviews, and LiveKit conference rooms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meetings.map((m) => {
          const project = db.projects.find(p => p.id === m.project_id);
          return (
            <div
              key={m.id}
              className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] hover:border-white/[0.14] transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded">
                      {project?.name || 'Client Project'}
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
                <span className="text-[11px] text-zinc-500 font-mono">Host: {m.creator?.full_name || 'Team Lead'}</span>
                <button
                  onClick={() => setActiveMeeting(m)}
                  className="btn-primary"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Session</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {activeMeeting && (
        <VideoRoomModal meeting={activeMeeting} onClose={() => setActiveMeeting(null)} />
      )}
    </div>
  );
}
