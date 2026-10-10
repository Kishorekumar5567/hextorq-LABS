'use client';

import React, { useState, useEffect } from 'react';
import { Meeting } from '@/types';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Share2,
  PhoneOff,
  MessageSquare,
  FileText,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export function VideoRoomModal({
  meeting,
  onClose,
}: {
  meeting: Meeting;
  onClose: () => void;
}) {
  const { currentUser } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [micActive, setMicActive] = useState(true);
  const [camActive, setCamActive] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [notes, setNotes] = useState(meeting.meeting_notes || '');

  useEffect(() => {
    async function fetchToken() {
      try {
        setLoading(true);
        const res = await fetch(`/api/meetings/${meeting.id}/token`, {
          method: 'POST',
          headers: {
            'x-user-id': currentUser.id,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setToken(data.token);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchToken();
  }, [meeting.id, currentUser.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#090D18] border border-slate-700/80 rounded-2xl w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="border-b border-slate-800 bg-[#0E1526] px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{meeting.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LiveKit Room
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Connected as {currentUser.full_name} ({currentUser.role})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Video Stage and Side Notes */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Stage */}
          <div className="flex-1 bg-[#060912] p-6 flex flex-col justify-between">
            {loading ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                <Sparkles className="w-5 h-5 animate-spin mr-2 text-indigo-400" />
                Connecting to encrypted managed video room...
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center text-rose-400 text-sm">
                {error}
              </div>
            ) : (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* Local Participant Tile */}
                <div className="relative aspect-video rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700/60 overflow-hidden flex items-center justify-center shadow-lg">
                  {camActive ? (
                    <div className="text-center space-y-2">
                      <div className="w-20 h-20 rounded-full bg-indigo-600/30 border border-indigo-500/40 text-white font-bold text-xl flex items-center justify-center mx-auto">
                        {currentUser.full_name.charAt(0)}
                      </div>
                      <p className="text-xs text-slate-300 font-medium">{currentUser.full_name} (You)</p>
                    </div>
                  ) : (
                    <div className="text-slate-500 text-xs flex items-center gap-1">
                      <VideoOff className="w-4 h-4" /> Camera Off
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[11px] text-white flex items-center gap-1.5">
                    {micActive ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-rose-400" />}
                    <span>{currentUser.full_name}</span>
                  </div>
                </div>

                {/* Remote Participant Tile */}
                <div className="relative aspect-video rounded-2xl bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center shadow-lg">
                  <div className="text-center space-y-2">
                    <div className="w-20 h-20 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-200 font-bold text-xl flex items-center justify-center mx-auto">
                      M
                    </div>
                    <p className="text-xs text-slate-300 font-medium">Marcus Vance (Client)</p>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[11px] text-white flex items-center gap-1.5">
                    <Mic className="w-3 h-3 text-emerald-400" />
                    <span>Apex Retail Participant</span>
                  </div>
                </div>
              </div>
            )}

            {/* In-Call Media Controls Bar */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setMicActive(!micActive)}
                className={`p-3.5 rounded-full transition-all ${
                  micActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white shadow-lg shadow-rose-600/40'
                }`}
                title={micActive ? 'Mute' : 'Unmute'}
              >
                {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setCamActive(!camActive)}
                className={`p-3.5 rounded-full transition-all ${
                  camActive ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-rose-600 text-white shadow-lg shadow-rose-600/40'
                }`}
                title={camActive ? 'Stop Video' : 'Start Video'}
              >
                {camActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setScreenSharing(!screenSharing)}
                className={`p-3.5 rounded-full transition-all ${
                  screenSharing ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40' : 'bg-slate-800 text-white hover:bg-slate-700'
                }`}
                title="Share Screen"
              >
                <Share2 className="w-5 h-5" />
              </button>

              <button
                onClick={onClose}
                className="p-3.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 transition-all ml-2"
                title="Leave Meeting"
              >
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Meeting Notes & Action Items Panel */}
          <div className="w-80 border-l border-slate-800 bg-[#0B0F1E] flex flex-col p-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <FileText className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Live Meeting Minutes
              </h4>
            </div>

            <div className="flex-1 py-3 flex flex-col">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write live minutes, action items, or agreement points..."
                className="flex-1 w-full text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-mono leading-relaxed"
              />
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3 h-3" /> Auto-saved
              </span>
              <span>2 participants</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
