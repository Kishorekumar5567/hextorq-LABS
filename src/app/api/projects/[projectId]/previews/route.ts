import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/repository';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const authHeader = req.headers.get('x-user-id') || 'user-admin-01'; // Simulated authenticated user
    const user = db.profiles.find(p => p.id === authHeader);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid user session' }, { status: 401 });
    }

    if (user.role === 'client') {
      return NextResponse.json({ error: 'Forbidden: Clients cannot register previews' }, { status: 403 });
    }

    const body = await req.json();
    const { deployment_id, deployment_url, git_branch, git_commit_sha } = body;

    if (!deployment_id || !deployment_url) {
      return NextResponse.json(
        { error: 'Bad Request: deployment_id and deployment_url are required' },
        { status: 400 }
      );
    }

    // Host validation
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(deployment_url);
    } catch {
      return NextResponse.json({ error: 'Bad Request: Invalid URL format' }, { status: 400 });
    }

    if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost') {
      return NextResponse.json(
        { error: 'Security Policy: Previews must use HTTPS' },
        { status: 400 }
      );
    }

    const hostname = parsedUrl.hostname;
    const allowedHostsEnv = process.env.ALLOWED_PREVIEW_HOSTS || '.vercel.app,.nexus-clients.com';
    const allowedSuffixes = allowedHostsEnv.split(',').map(s => s.trim());

    const isHostApproved =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      allowedSuffixes.some(suffix => hostname.endsWith(suffix));

    if (!isHostApproved) {
      return NextResponse.json(
        { error: `Security Policy Violation: Host ${hostname} is not in the approved Vercel domain policy.` },
        { status: 403 }
      );
    }

    const preview = db.registerPreview(projectId, user, {
      deployment_id,
      deployment_url,
      git_branch,
      git_commit_sha,
    });

    return NextResponse.json({
      success: true,
      preview: {
        id: preview.id,
        deployment_id: preview.deployment_id,
        deployment_url: preview.deployment_url,
        git_branch: preview.git_branch,
        git_commit_sha: preview.git_commit_sha,
        status: preview.status,
        verified_at: preview.verified_at,
        is_current: preview.is_current,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
    const authHeader = req.headers.get('x-user-id') || 'user-admin-01';
    const user = db.profiles.find(p => p.id === authHeader);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const previews = db.getPreviews(projectId, user);
    return NextResponse.json({ success: true, previews });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
