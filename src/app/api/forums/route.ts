import { NextResponse } from 'next/server';
import { getForumHierarchy, getAnnouncements } from '@/lib/store';

export async function GET() {
  try {
    const [categories, announcements] = await Promise.all([
      getForumHierarchy(),
      getAnnouncements(),
    ]);

    return NextResponse.json({
      categories,
      announcements,
    });
  } catch (error: any) {
    console.error('Error fetching forums:', error);
    return NextResponse.json({ error: 'Failed to fetch forums' }, { status: 500 });
  }
}
