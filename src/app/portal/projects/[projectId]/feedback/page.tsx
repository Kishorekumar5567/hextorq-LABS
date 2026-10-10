'use client';

import React, { use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { ReviewStudio } from '@/components/studio/ReviewStudio';
import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function ClientFeedbackPage({
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
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4 my-16">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Cross-Client Access Prohibited (403)</h2>
        <p className="text-xs text-slate-400">{err.message}</p>
        <Link href="/portal/projects" className="inline-block px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold">
          Return to My Projects
        </Link>
      </div>
    );
  }

  const preview = db.getCurrentPreview(projectId, currentUser);
  const annotations = db.getVisualAnnotations(projectId, currentUser);

  return (
    <div className="flex flex-col min-h-screen">
      <ProjectHeaderTabs project={project} basePath="/portal/projects" />
      <ReviewStudio project={project} initialPreview={preview} annotations={annotations} />
    </div>
  );
}
