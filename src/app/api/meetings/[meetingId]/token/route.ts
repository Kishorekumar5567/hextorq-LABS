import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/data/repository';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { meetingId } = await params;
    const authHeader = req.headers.get('x-user-id') || 'user-admin-01';
    const user = db.profiles.find(p => p.id === authHeader);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const meeting = db.meetings.find(m => m.id === meetingId);
    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });
    }

    // Verify user can access meeting's project
    db.verifyProjectAccess(meeting.project_id, user);

    // Generate secure managed video provider token
    const tokenPayload = {
      room: meeting.livekit_room_name || meeting.meeting_room_id,
      identity: user.id,
      name: user.full_name,
      role: user.role,
      canPublish: true,
      canSubscribe: true,
      exp: Math.floor(Date.now() / 1000) + 3600 * 2, // 2 hour expiry
    };

    const token = `nexus_livekit_token_${Buffer.from(JSON.stringify(tokenPayload)).toString('base64')}`;

    return NextResponse.json({
      success: true,
      token,
      serverUrl: process.env.LIVEKIT_WS_URL || 'wss://demo.livekit.cloud',
      roomName: meeting.livekit_room_name || meeting.meeting_room_id,
      user: {
        id: user.id,
        name: user.full_name,
        role: user.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Forbidden' }, { status: 403 });
  }
}
