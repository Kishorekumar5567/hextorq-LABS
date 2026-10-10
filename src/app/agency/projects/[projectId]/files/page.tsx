'use client';

import React, { useState, use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { ProjectFile } from '@/types';
import {
  FolderDown,
  UploadCloud,
  FileText,
  FileCode,
  Image,
  Lock,
  Download,
  Plus,
  ShieldCheck,
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

    const newFile = db.createFile(
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Project Cloud Storage</h2>
            <p className="text-xs text-slate-400 mt-1">
              Encrypted Supabase Storage buckets for architecture docs, Figma tokens, contracts, and screenshots.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['all', 'specification', 'design', 'contract', 'general'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat === 'all' ? 'All Files' : cat}
            </button>
          ))}
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="p-5 rounded-2xl glass-panel border border-slate-800 hover:border-indigo-500/30 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  {file.mime_type.includes('pdf') ? (
                    <FileText className="w-5 h-5" />
                  ) : file.mime_type.includes('image') ? (
                    <Image className="w-5 h-5" />
                  ) : (
                    <FileCode className="w-5 h-5" />
                  )}
                </div>
                {!file.is_client_visible && (
                  <span className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-semibold">
                    <Lock className="w-2.5 h-2.5" /> Internal
                  </span>
                )}
              </div>

              <div>
                <h4 className="font-semibold text-white text-xs line-clamp-1">{file.file_name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {formatBytes(file.file_size)} · Uploaded by {file.uploader?.full_name || 'Team'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] text-indigo-400 uppercase font-mono">{file.category}</span>
                <button
                  onClick={() => alert(`Simulated signed download URL generated for ${file.file_name}`)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
            <div className="bg-[#0E1524] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="font-bold text-white text-base">Upload Document or Asset</h3>
              <form onSubmit={handleSimulateUpload} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">File Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex_Mobile_Checkout_Spec_v3.pdf"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Category</label>
                  <select
                    value={fileCategory}
                    onChange={(e) => setFileCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="specification">Specification</option>
                    <option value="design">Design Asset</option>
                    <option value="contract">Contract / Legal</option>
                    <option value="general">General</option>
                  </select>
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
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500"
                  >
                    Upload to Bucket
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
