'use client';

import React, { use } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { db } from '@/lib/data/repository';
import { ProjectHeaderTabs } from '@/components/project/ProjectHeaderTabs';
import { ReviewStudio } from '@/components/studio/ReviewStudio';

export default function AgencyFeedbackPage({
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
      <div className="p-8 text-center text-rose-400">
        <p className="font-semibold">{err.message}</p>
      </div>
    );
  }

  const preview = db.getCurrentPreview(projectId, currentUser);
  const annotations = db.getVisualAnnotations(projectId, currentUser);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <ProjectHeaderTabs project={project} basePath="/agency/projects" />
      <ReviewStudio project={project} initialPreview={preview} annotations={annotations} />
    </div>
  );
}
