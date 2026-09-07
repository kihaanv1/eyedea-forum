import { NextResponse } from 'next/server';
import { getCurrentUser, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { updateUserProfile, findUserById } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
    }

    let targetUserId = session.id;
    try {
      const body = await req.json();
      if (body?.userId && body.userId.trim() !== session.id) {
        if (session.role !== 'ADMIN') {
          return NextResponse.json({ error: 'Unauthorized: Only admins can manage other users’ avatars' }, { status: 403 });
        }
        targetUserId = body.userId.trim();
      }
    } catch {
      // Body may be empty, defaults to session.id
    }

    const targetUser = await findUserById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateResult = await updateUserProfile(targetUserId, { avatar: '' });
    if (!updateResult.success || !updateResult.user) {
      return NextResponse.json({ error: updateResult.error || 'Failed to remove avatar' }, { status: 500 });
    }

    const updatedUser = updateResult.user;
    const response = NextResponse.json({
      success: true,
      message: 'Avatar removed successfully',
      avatarUrl: '',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: '',
      },
    });

    if (targetUserId === session.id) {
      const token = signToken({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: '',
        reputation: updatedUser.reputation,
      });

      response.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    return response;
  } catch (error: any) {
    console.error('Avatar remove error:', error);
    return NextResponse.json({ error: 'Failed to remove avatar' }, { status: 500 });
  }
}
