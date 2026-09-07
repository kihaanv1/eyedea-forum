import { NextResponse } from 'next/server';
import { getCurrentUser, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { updateUserProfile, findUserById } from '@/lib/store';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
};

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Please log in to upload an avatar' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = (formData.get('file') || formData.get('avatar')) as File | null;
    const targetUserIdOverride = formData.get('userId') as string | null;

    // Only ADMIN can upload avatars on behalf of other users
    let targetUserId = session.id;
    if (targetUserIdOverride && targetUserIdOverride.trim() && targetUserIdOverride !== session.id) {
      if (session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized: Only admins can manage other users’ avatars' }, { status: 403 });
      }
      targetUserId = targetUserIdOverride.trim();
    }

    const targetUser = await findUserById(targetUserId);
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File is too large. Maximum size allowed is 5MB.' }, { status: 400 });
    }

    const mimeType = file.type;
    const extension = ALLOWED_MIME_TYPES[mimeType];
    if (!extension) {
      return NextResponse.json({
        error: 'Invalid file format. Please upload a JPEG, PNG, WebP, GIF, or SVG image.',
      }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let avatarUrl = '';
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
      await mkdir(uploadDir, { recursive: true });
      const safeFilename = `avatar-${targetUserId}-${Date.now()}.${extension}`;
      const filePath = path.join(uploadDir, safeFilename);
      await writeFile(filePath, buffer);
      avatarUrl = `/uploads/avatars/${safeFilename}`;
    } catch (fsErr) {
      console.warn('Filesystem avatar write failed, falling back to base64 data URI:', fsErr);
      avatarUrl = `data:${mimeType};base64,${buffer.toString('base64')}`;
    }

    const updateResult = await updateUserProfile(targetUserId, { avatar: avatarUrl });
    if (!updateResult.success || !updateResult.user) {
      return NextResponse.json({ error: updateResult.error || 'Failed to save avatar to profile' }, { status: 500 });
    }

    const updatedUser = updateResult.user;
    const response = NextResponse.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      avatarUrl,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        reputation: updatedUser.reputation,
      },
    });

    // If session user updated their own avatar, renew the auth token cookie
    if (targetUserId === session.id) {
      const token = signToken({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
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
    console.error('Avatar upload error:', error);
    return NextResponse.json({ error: 'Failed to process avatar upload' }, { status: 500 });
  }
}
