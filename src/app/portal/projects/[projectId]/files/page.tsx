'use client';

import React, { use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { FileText, FileCode, Image, Download } from 'lucide-react';

export default function ClientFilesPage({
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

  // Repository strictly returns is_client_visible === true for clients!
  const files = db.getFiles(projectId, currentUser);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/portal/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Project Shared Files</h2>
          <p className="text-xs text-slate-400 mt-1">
            Official project specifications, design tokens, architecture schematics, and deliverables.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-purple-500/30 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  {file.mime_type.includes('pdf') ? (
                    <FileText className="w-5 h-5" />
                  ) : file.mime_type.includes('image') ? (
                    <Image className="w-5 h-5" />
                  ) : (
                    <FileCode className="w-5 h-5" />
                  )}
                </div>
                <span className="text-[10px] text-purple-400 uppercase font-mono">{file.category}</span>
              </div>

              <div>
                <h4 className="font-semibold text-white text-xs line-clamp-1">{file.file_name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{formatBytes(file.file_size)}</p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  {new Date(file.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => alert(`Downloading verified file: ${file.file_name}`)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
