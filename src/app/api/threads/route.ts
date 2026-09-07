import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createThread } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to create a thread' }, { status: 401 });
    }

    const { forumId, title, content } = await req.json();

    if (!forumId || !title || !content) {
      return NextResponse.json({ error: 'Forum, title, and content are required' }, { status: 400 });
    }

    if (title.trim().length < 5) {
      return NextResponse.json({ error: 'Title must be at least 5 characters long' }, { status: 400 });
    }

    if (content.trim().length < 10) {
      return NextResponse.json({ error: 'Content must be at least 10 characters long' }, { status: 400 });
    }

    const thread = await createThread({
      forumId,
      authorId: user.id,
      title: title.trim(),
      content: content.trim(),
    });

    return NextResponse.json({ success: true, thread });
  } catch (error: any) {
    console.error('Error creating thread:', error);
    return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 });
  }
}
