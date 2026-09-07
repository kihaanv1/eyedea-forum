import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllUsers, updateUserRole, toggleUserBan } from '@/lib/store';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const users = await getAllUsers();
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { userId, action, role } = await req.json();

    if (action === 'updateRole' && role) {
      if (!['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
      }
      await updateUserRole(userId, role);
      return NextResponse.json({ success: true, message: `Role updated to ${role}` });
    }

    if (action === 'toggleBan') {
      await toggleUserBan(userId);
      return NextResponse.json({ success: true, message: 'User ban status updated' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
