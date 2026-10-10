'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Project } from '@/types';
import {
  Layers,
  CheckCircle2,
  Eye,
  Ticket as TicketIcon,
  FolderDown,
  FileText,
  Video,
  CreditCard,
  ExternalLink,
} from 'lucide-react';

function ProjectHeaderTabsContent({
  project,
  basePath, // '/agency/projects' or '/portal/projects'
}: {
  project: Project;
  basePath: string;
}) {
  const pathname = usePathname();
  const currentTab = pathname.split('/').pop() || 'overview';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'milestones', label: 'Milestones & Sign-Offs', icon: CheckCircle2 },
    { id: 'feedback', label: 'Review Studio & Preview', icon: Eye },
    { id: 'tickets', label: 'Tickets & Issues', icon: TicketIcon },
    { id: 'files', label: 'Shared Files', icon: FolderDown },
    { id: 'notes', label: 'Specs & Notes', icon: FileText },
    { id: 'meetings', label: 'Video Meetings', icon: Video },
    { id: 'invoices', label: 'Invoices & Billing', icon: CreditCard },
  ];

  return (
    <div className="border-b border-slate-800 bg-[#0B0F1C]/80 backdrop-blur-md sticky top-0 z-30">
      {/* Project Banner */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {project.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                project.status === 'in_review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-slate-700/40 text-slate-300'
              }`}>
                {project.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-1 line-clamp-1 max-w-2xl">
              {project.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs text-slate-400">Total Budget</span>
              <p className="text-sm font-bold text-white">
                ${project.budget.toLocaleString()} {project.currency}
              </p>
            </div>
            <Link
              href={`${basePath}/${project.id}/feedback`}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Open Review Studio</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto mt-6 -mb-4 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const href = `${basePath}/${project.id}/${tab.id}`;
            const isActive = currentTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={href}
                className={`flex items-center gap-2 px-4 py-3 text-xs md:text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 font-semibold bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ProjectHeaderTabs(props: { project: Project; basePath: string }) {
  return (
    <Suspense fallback={<div className="h-24 bg-[#0B0F1C]/80 border-b border-slate-800" />}>
      <ProjectHeaderTabsContent {...props} />
    </Suspense>
  );
}
