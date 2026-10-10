'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { ProjectNote } from '@/types';
import { FileText, Plus, Lock, Globe, Clock } from 'lucide-react';

export default function AgencyNotesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { currentUser, isAgencyStaff } = useAuth();

  let project;
  try {
    project = db.getProject(projectId, currentUser);
  } catch (err: any) {
    return <div className="p-8 text-center text-rose-400">{err.message}</div>;
  }

  const [notes, setNotes] = useState<ProjectNote[]>(() => db.getNotes(projectId, currentUser));
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Product Specs');
  const [isClientVisible, setIsClientVisible] = useState(true);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    db.createNote(projectId, currentUser, title, content, category, isClientVisible);
    setNotes(db.getNotes(projectId, currentUser));
    setShowModal(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/agency/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Project Documentation & Notes</h2>
            <p className="text-xs text-slate-400 mt-1">
              Architecture specs, client vision briefs, and developer implementation guidelines.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Note</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-6 rounded-2xl glass-panel border space-y-3 transition-all ${
                !note.is_client_visible
                  ? 'border-amber-500/30 bg-amber-950/10'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  {note.category}
                </span>
                {!note.is_client_visible ? (
                  <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                    <Lock className="w-2.5 h-2.5" /> Agency Internal Only
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-semibold">
                    <Globe className="w-2.5 h-2.5" /> Client Visible
                  </span>
                )}
              </div>

              <h3 className="font-bold text-white text-base">{note.title}</h3>
              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>By {note.author?.full_name || 'Team'}</span>
                <span>{new Date(note.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="bg-[#0E1524] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="font-bold text-white text-base">Create Note</h3>
              <form onSubmit={handleCreateNote} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Content</label>
                  <textarea
                    rows={4}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isClientVisible}
                    onChange={(e) => setIsClientVisible(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Make visible in Client Portal</span>
                </label>

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
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
