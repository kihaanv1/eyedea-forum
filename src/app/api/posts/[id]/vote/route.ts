import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { toggleVotePost } from '@/lib/store';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'You must be logged in to upvote' }, { status: 401 });
    }

    const result = await toggleVotePost(params.id, user.id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error voting post:', error);
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
  }
}
