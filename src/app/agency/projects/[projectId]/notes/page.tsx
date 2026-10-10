'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { ProjectNote } from '@/types';
import { Plus, Lock, Globe, X } from 'lucide-react';

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
              <span>DOCS</span>
              <span>/</span>
              <span className="text-zinc-300">TECHNICAL NOTES</span>
            </div>
            <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Project Documentation & Architecture Briefs</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Sprint specifications, client vision briefs, and developer implementation guidelines.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className={`p-5 rounded-lg bg-[#0E1017] border transition-all space-y-3.5 flex flex-col justify-between ${
                !note.is_client_visible
                  ? 'border-amber-500/30'
                  : 'border-white/[0.07] hover:border-white/[0.14]'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded">
                    {note.category}
                  </span>
                  {!note.is_client_visible ? (
                    <span className="flex items-center gap-1 text-[9px] font-mono uppercase bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20">
                      <Lock className="w-2.5 h-2.5" /> Agency Internal
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                      <Globe className="w-2.5 h-2.5" /> Client Visible
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-zinc-100 text-sm">{note.title}</h3>
                <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>By {note.author?.full_name || 'Team'}</span>
                <span>{new Date(note.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="bg-[#0E1017] border border-white/[0.1] rounded-lg p-5 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h3 className="font-semibold text-zinc-100 text-sm">Create Architecture Note</h3>
                <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNote} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Content (Markdown)</label>
                  <textarea
                    rows={4}
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-zinc-300 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isClientVisible}
                    onChange={(e) => setIsClientVisible(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-zinc-200 focus:ring-0"
                  />
                  <span>Make visible in Client Workspace</span>
                </label>

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
