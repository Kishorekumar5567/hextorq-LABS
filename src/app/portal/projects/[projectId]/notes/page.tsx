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
        <div className="border-b border-white/[0.06] pb-5">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
            <span>DOCS</span>
            <span>/</span>
            <span className="text-zinc-300">PROJECT BRIEFS</span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Project Documentation & Architecture Briefs</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Product strategy, success criteria, and engineering agreements shared by your agency team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="p-5 rounded-lg bg-[#0E1017] border border-white/[0.07] hover:border-white/[0.14] transition-all space-y-3.5 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 rounded">
                    {note.category}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    <Globe className="w-2.5 h-2.5" /> Client Brief
                  </span>
                </div>

                <h3 className="font-semibold text-zinc-100 text-sm">{note.title}</h3>
                <p className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.05] flex items-center justify-between text-[11px] text-zinc-500 font-mono">
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
