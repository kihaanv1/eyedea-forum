import { NextResponse } from 'next/server';
import { getCurrentUser, hashPassword, verifyPassword, signToken, AUTH_COOKIE_NAME } from '@/lib/auth';
import { getUserProfileWithStats, updateUserProfile, findUserById } from '@/lib/store';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getUserProfileWithStats(session.id);
    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await findUserById(session.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();
    const {
      username,
      bio,
      avatar,
      website,
      location,
      github,
      twitter,
      themePreference,
      notifyReplies,
      notifyMentions,
      showOnlineStatus,
      currentPassword,
      newPassword,
    } = body;

    const updates: {
      username?: string;
      avatar?: string;
      bio?: string;
      website?: string;
      location?: string;
      github?: string;
      twitter?: string;
      themePreference?: 'dark' | 'midnight' | 'system';
      notifyReplies?: boolean;
      notifyMentions?: boolean;
      showOnlineStatus?: boolean;
      passwordHash?: string;
    } = {};

    // Validate username if changing
    if (username && username.trim() !== user.username) {
      const trimmed = username.trim();
      if (trimmed.length < 3 || trimmed.length > 25) {
        return NextResponse.json({ error: 'Username must be between 3 and 25 characters' }, { status: 400 });
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        return NextResponse.json({ error: 'Username can only contain letters, numbers, hyphens and underscores' }, { status: 400 });
      }
      updates.username = trimmed;
    }

    // Validate avatar
    if (avatar !== undefined) {
      updates.avatar = typeof avatar === 'string' ? avatar.trim() : '';
    }

    // Validate bio
    if (bio !== undefined) {
      const trimmedBio = typeof bio === 'string' ? bio.trim() : '';
      if (trimmedBio.length > 300) {
        return NextResponse.json({ error: 'Bio must not exceed 300 characters' }, { status: 400 });
      }
      updates.bio = trimmedBio;
    }

    // Validate website
    if (website !== undefined) {
      const trimmedWebsite = typeof website === 'string' ? website.trim() : '';
      if (trimmedWebsite && !trimmedWebsite.startsWith('http://') && !trimmedWebsite.startsWith('https://')) {
        updates.website = `https://${trimmedWebsite}`;
      } else {
        updates.website = trimmedWebsite;
      }
    }

    // Validate location
    if (location !== undefined) {
      updates.location = typeof location === 'string' ? location.trim().slice(0, 80) : '';
    }

    // Validate github & twitter handles
    if (github !== undefined) {
      updates.github = typeof github === 'string' ? github.trim().replace(/^@/, '').slice(0, 40) : '';
    }
    if (twitter !== undefined) {
      updates.twitter = typeof twitter === 'string' ? twitter.trim().replace(/^@/, '').slice(0, 40) : '';
    }

    // Preferences
    if (themePreference && ['dark', 'midnight', 'system'].includes(themePreference)) {
      updates.themePreference = themePreference;
    }
    if (notifyReplies !== undefined) updates.notifyReplies = Boolean(notifyReplies);
    if (notifyMentions !== undefined) updates.notifyMentions = Boolean(notifyMentions);
    if (showOnlineStatus !== undefined) updates.showOnlineStatus = Boolean(showOnlineStatus);

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
      }

      const isMatch = await verifyPassword(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }

      updates.passwordHash = await hashPassword(newPassword);
    }

    const result = await updateUserProfile(user.id, updates);
    if (!result.success || !result.user) {
      return NextResponse.json({ error: result.error || 'Failed to update profile' }, { status: 400 });
    }

    const updatedUser = result.user;

    // Issue updated auth token
    const token = signToken({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      reputation: updatedUser.reputation,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        avatar: updatedUser.avatar,
        bio: updatedUser.bio,
        reputation: updatedUser.reputation,
        website: updatedUser.website,
        location: updatedUser.location,
        github: updatedUser.github,
        twitter: updatedUser.twitter,
        themePreference: updatedUser.themePreference,
        notifyReplies: updatedUser.notifyReplies,
        notifyMentions: updatedUser.notifyMentions,
        showOnlineStatus: updatedUser.showOnlineStatus,
        createdAt: updatedUser.createdAt,
      },
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

    return response;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal server error updating profile' }, { status: 500 });
  }
}
