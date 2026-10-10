'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { Calendar, Video, Clock, Plus } from 'lucide-react';
import { VideoRoomModal } from '@/components/meetings/VideoRoomModal';
import { Meeting } from '@/types';

export default function AgencyCalendarPage() {
  const { currentUser } = useAuth();
  const [meetings, setMeetings] = useState(db.meetings);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Agency Meetings & Calendar</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global schedule of client reviews, architectural demos, and milestone sign-offs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {meetings.map((m) => {
          const project = db.projects.find(p => p.id === m.project_id);
          return (
            <div
              key={m.id}
              className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4 hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    {project?.name || 'Client Project'}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{m.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{m.description}</p>
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
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-1.5 transition-all"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Join Video Call</span>
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
