'use client';

import React, { use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { Globe } from 'lucide-react';

export default function ClientNotesPage({
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

  // Repository returns only client-visible notes!
  const notes = db.getNotes(projectId, currentUser);

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/portal/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Project Documentation & Briefs</h2>
          <p className="text-xs text-slate-400 mt-1">
            Product strategy, success criteria, and engineering agreements shared by your development team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                  {note.category}
                </span>
                <span className="flex items-center gap-1 text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-semibold">
                  <Globe className="w-2.5 h-2.5" /> Client Brief
                </span>
              </div>

              <h3 className="font-bold text-white text-base">{note.title}</h3>
              <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>By {note.author?.full_name || 'Agency Team'}</span>
                <span>{new Date(note.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
