import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAdminStats } from '@/lib/store';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const stats = await getAdminStats();
    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}
