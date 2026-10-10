'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { ProjectFile } from '@/types';
import {
  UploadCloud,
  FileText,
  FileCode,
  Image,
  Lock,
  Download,
  X,
  FileCheck,
} from 'lucide-react';

export default function AgencyFilesPage({
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

  const [files, setFiles] = useState<ProjectFile[]>(() => db.getFiles(projectId, currentUser));
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload form state
  const [fileName, setFileName] = useState('');
  const [fileCategory, setFileCategory] = useState<ProjectFile['category']>('specification');
  const [isClientVisible, setIsClientVisible] = useState(true);

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;

    db.createFile(
      projectId,
      currentUser,
      fileName,
      Math.floor(Math.random() * 8000000) + 500000,
      fileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
      fileCategory,
      isClientVisible
    );

    setFiles(db.getFiles(projectId, currentUser));
    setShowUploadModal(false);
    setFileName('');
  };

  const filteredFiles = files.filter(f => categoryFilter === 'all' || f.category === categoryFilter);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/agency/projects" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-1">
              <span>PROJECT ASSETS</span>
              <span>/</span>
              <span className="text-zinc-300">CLOUD STORAGE</span>
            </div>
            <h2 className="text-xl font-semibold text-zinc-100 tracking-tight">Project Artifacts & Deliverables</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Cryptographically signed downloads, technical specifications, and client deliverable vaults.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Artifact</span>
          </button>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'specification', 'design', 'contract', 'general'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded text-xs font-mono uppercase tracking-wide transition-all ${
                categoryFilter === cat
                  ? 'bg-white/[0.1] text-zinc-100 border border-white/[0.12]'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
              }`}
            >
              {cat === 'all' ? 'All Files' : cat}
            </button>
          ))}
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredFiles.map((file) => (
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
                  {!file.is_client_visible && (
                    <span className="flex items-center gap-1 text-[9px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded">
                      <Lock className="w-2.5 h-2.5" /> Agency Internal
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-medium text-zinc-100 text-xs line-clamp-1">{file.file_name}</h4>
                  <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                    {formatBytes(file.file_size)} · {file.uploader?.full_name || 'Staff'}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-white/[0.05] flex items-center justify-between text-xs">
                <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-wider">{file.category}</span>
                <button
                  onClick={() => alert(`Generated signed URL for ${file.file_name}`)}
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

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="bg-[#0E1017] border border-white/[0.1] rounded-lg p-5 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h3 className="font-semibold text-zinc-100 text-sm">Upload Deliverable</h3>
                <button onClick={() => setShowUploadModal(false)} className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSimulateUpload} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Artifact Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Architecture_Topology_v2.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono uppercase text-zinc-400 block mb-1">Vault Category</label>
                  <select
                    value={fileCategory}
                    onChange={(e) => setFileCategory(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-md bg-[#090A0F] border border-white/[0.08] text-zinc-200 focus:outline-none focus:border-zinc-500 font-mono"
                  >
                    <option value="specification">Specification</option>
                    <option value="design">Design Asset</option>
                    <option value="contract">Contract / Legal</option>
                    <option value="general">General</option>
                  </select>
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
                    onClick={() => setShowUploadModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    Save Artifact
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
