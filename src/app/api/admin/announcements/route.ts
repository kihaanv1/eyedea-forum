import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createAnnouncement } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { title, content, priority } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const announcement = await createAnnouncement({
      title,
      content,
      authorId: user.id,
      priority,
    });

    return NextResponse.json({ success: true, announcement });
  } catch (error: any) {
    console.error('Error creating announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
