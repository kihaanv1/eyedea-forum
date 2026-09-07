import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createForum } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { categoryId, name, description, icon } = await req.json();
    if (!categoryId || !name || !description) {
      return NextResponse.json({ error: 'Category, name, and description are required' }, { status: 400 });
    }

    const forum = await createForum({ categoryId, name, description, icon });
    return NextResponse.json({ success: true, forum });
  } catch (error: any) {
    console.error('Error creating forum:', error);
    return NextResponse.json({ error: 'Failed to create forum' }, { status: 500 });
  }
}
