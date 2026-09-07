import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getThreadById, createPost } from '@/lib/store';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to reply' }, { status: 401 });
    }

    const thread = await getThreadById(params.id);
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    if (thread.isLocked && user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'This thread is locked by moderators.' }, { status: 403 });
    }

    const { content } = await req.json();
    if (!content || content.trim().length < 2) {
      return NextResponse.json({ error: 'Reply content cannot be empty' }, { status: 400 });
    }

    const post = await createPost({
      threadId: thread.id,
      authorId: user.id,
      content: content.trim(),
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to post reply' }, { status: 500 });
  }
}
