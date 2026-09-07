import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getThreadById, togglePinThread, toggleLockThread, deleteThread } from '@/lib/store';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const thread = await getThreadById(params.id);
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }
    return NextResponse.json({ thread });
  } catch (error: any) {
    console.error('Error fetching thread:', error);
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
      return NextResponse.json({ error: 'Forbidden: Moderator or Admin privileges required' }, { status: 403 });
    }

    const { action } = await req.json();

    if (action === 'togglePin') {
      await togglePinThread(params.id);
      return NextResponse.json({ success: true, message: 'Thread pin status updated' });
    }

    if (action === 'toggleLock') {
      await toggleLockThread(params.id);
      return NextResponse.json({ success: true, message: 'Thread lock status updated' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating thread:', error);
    return NextResponse.json({ error: 'Failed to update thread' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const thread = await getThreadById(params.id);
    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    const isAuthorized = user.role === 'ADMIN' || user.role === 'MODERATOR' || user.id === thread.authorId;
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await deleteThread(params.id);
    return NextResponse.json({ success: true, message: 'Thread deleted' });
  } catch (error: any) {
    console.error('Error deleting thread:', error);
    return NextResponse.json({ error: 'Failed to delete thread' }, { status: 500 });
  }
}
