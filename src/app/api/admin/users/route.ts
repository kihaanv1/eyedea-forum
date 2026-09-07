import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllUsers, updateUserRole, toggleUserBan, adminUpdateUser } from '@/lib/store';

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

    const body = await req.json();
    const { userId, action, role } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

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

    if (action === 'updateUserSettings') {
      const {
        username,
        avatar,
        bio,
        role: newRole,
        isBanned,
        website,
        location,
        github,
        twitter,
      } = body;

      if (newRole && !['USER', 'MODERATOR', 'ADMIN'].includes(newRole)) {
        return NextResponse.json({ error: 'Invalid role specified' }, { status: 400 });
      }

      if (username) {
        const trimmed = username.trim();
        if (trimmed.length < 3 || trimmed.length > 25) {
          return NextResponse.json({ error: 'Username must be between 3 and 25 characters' }, { status: 400 });
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
          return NextResponse.json({ error: 'Username can only contain letters, numbers, hyphens, and underscores' }, { status: 400 });
        }
      }

      const res = await adminUpdateUser(userId, {
        username: username?.trim(),
        avatar: avatar !== undefined ? (typeof avatar === 'string' ? avatar.trim() : '') : undefined,
        bio: bio !== undefined ? (typeof bio === 'string' ? bio.trim().slice(0, 300) : '') : undefined,
        role: newRole,
        isBanned: isBanned !== undefined ? Boolean(isBanned) : undefined,
        website: website !== undefined ? (typeof website === 'string' ? website.trim() : '') : undefined,
        location: location !== undefined ? (typeof location === 'string' ? location.trim().slice(0, 80) : '') : undefined,
        github: github !== undefined ? (typeof github === 'string' ? github.trim().replace(/^@/, '').slice(0, 40) : '') : undefined,
        twitter: twitter !== undefined ? (typeof twitter === 'string' ? twitter.trim().replace(/^@/, '').slice(0, 40) : '') : undefined,
      });

      if (!res.success || !res.user) {
        return NextResponse.json({ error: res.error || 'Failed to update user settings' }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'User settings updated successfully',
        user: res.user,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
