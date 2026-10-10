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
        <div className="border-b border-white/[0.06] pb-5">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
            <span>VAULT</span>
            <span>/</span>
            <span className="text-zinc-300">PROJECT DELIVERABLES</span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Project Artifacts & Shared Files</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Architecture specifications, contracts, and export bundles signed by the engineering team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {files.map((file) => (
            <div
              key={file.id}
              className="p-4 rounded-lg bg-[#0E1017] border border-white/[0.07] hover:border-white/[0.14] transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-md bg-white/[0.04] border border-white/[0.06] text-zinc-300">
                    {file.mime_type.includes('pdf') ? (
                      <FileText className="w-4 h-4" />
                    ) : file.mime_type.includes('image') ? (
                      <Image className="w-4 h-4" />
                    ) : (
                      <FileCode className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">{file.category}</span>
                </div>

                <div>
                  <h4 className="font-medium text-zinc-100 text-xs line-clamp-1">{file.file_name}</h4>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{formatBytes(file.file_size)}</p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-xs">
                <span className="text-[11px] text-zinc-500 font-mono">
                  {new Date(file.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => alert(`Downloading verified file: ${file.file_name}`)}
                  className="btn-secondary py-1 px-2"
                  title="Download File"
                >
                  <Download className="w-3 h-3 text-zinc-400" />
                  <span className="text-[11px]">Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
