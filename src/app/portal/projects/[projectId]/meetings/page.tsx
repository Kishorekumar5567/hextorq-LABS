'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { Meeting } from '@/types';
import { Video, Clock } from 'lucide-react';
import { VideoRoomModal } from '@/components/meetings/VideoRoomModal';

export default function ClientMeetingsPage({
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

  const meetings = db.getMeetings(projectId, currentUser);
  const [activeMeeting, setActiveMeeting] = useState<Meeting | null>(null);

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/portal/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Scheduled Video Meetings</h2>
          <p className="text-xs text-slate-400 mt-1">
            Sync with your dedicated engineering leads, review live code, and confirm milestone deliverables.
          </p>
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
                    Client Meeting Room
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
                <span className="text-xs text-slate-500">Host: {m.creator?.full_name || 'Agency Lead'}</span>
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

        {/* LiveKit Video Modal */}
        {activeMeeting && (
          <VideoRoomModal meeting={activeMeeting} onClose={() => setActiveMeeting(null)} />
        )}
      </div>
    </div>
  );
}
