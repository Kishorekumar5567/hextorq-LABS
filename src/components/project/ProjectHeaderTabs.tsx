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
  ArrowUpRight,
} from 'lucide-react';

function ProjectHeaderTabsContent({
  project,
  basePath,
}: {
  project: Project;
  basePath: string;
}) {
  const pathname = usePathname();
  const currentTab = pathname.split('/').pop() || 'overview';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Layers },
    { id: 'milestones', label: 'Milestones', icon: CheckCircle2 },
    { id: 'feedback', label: 'Review Studio', icon: Eye },
    { id: 'tickets', label: 'Tickets', icon: TicketIcon },
    { id: 'files', label: 'Files', icon: FolderDown },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'meetings', label: 'Meetings', icon: Video },
    { id: 'invoices', label: 'Invoices', icon: CreditCard },
  ];

  return (
    <div className="border-b border-white/[0.07] bg-[#0A0B10]/95 backdrop-blur-md sticky top-0 z-30 select-none">
      <div className="max-w-7xl mx-auto px-6 pt-5 pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-zinc-100 tracking-tight">
                {project.name}
              </h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                project.status === 'in_review' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                'bg-zinc-800 text-zinc-400'
              }`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 line-clamp-1 max-w-2xl">
              {project.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-[11px] text-zinc-500 block font-mono">Total Budget</span>
              <p className="text-xs font-semibold text-zinc-200 font-mono">
                ${project.budget.toLocaleString()} {project.currency}
              </p>
            </div>
            <Link
              href={`${basePath}/${project.id}/feedback`}
              className="px-3.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Launch Studio</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-t border-white/[0.05]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const href = `${basePath}/${project.id}/${tab.id}`;
            const isActive = currentTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={href}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-zinc-100 text-zinc-100 font-semibold'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-zinc-100' : 'text-zinc-500'}`} />
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
    <Suspense fallback={<div className="h-20 bg-[#0A0B10] border-b border-white/[0.07]" />}>
      <ProjectHeaderTabsContent {...props} />
    </Suspense>
  );
}
