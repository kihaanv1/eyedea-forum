import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createCategory } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { name, description, icon } = await req.json();
    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
    }

    const category = await createCategory({ name, description, icon });
    return NextResponse.json({ success: true, category });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
