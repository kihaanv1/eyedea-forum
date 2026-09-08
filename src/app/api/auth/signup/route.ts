import { NextResponse } from 'next/server';
import { hashPassword, signToken, signVaultToken, AUTH_COOKIE_NAME, VAULT_COOKIE_NAME } from '@/lib/auth';
import { findUserByEmailOrUsername, createUser, ensureUserInMemory } from '@/lib/store';

export async function POST(req: Request) {
  try {
    const { username, email, password, bio } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existingUser = await findUserByEmailOrUsername(username.trim());
    if (existingUser) {
      return NextResponse.json({ error: 'Username is already taken' }, { status: 409 });
    }

    const existingEmail = await findUserByEmailOrUsername(email.trim());
    if (existingEmail) {
      return NextResponse.json({ error: 'Email is already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      bio: bio?.trim() || 'New member of EyeDea',
      role: 'USER',
    });

    ensureUserInMemory(user);

    const token = signToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      reputation: user.reputation,
      website: user.website,
      location: user.location,
      github: user.github,
      twitter: user.twitter,
      themePreference: user.themePreference,
      notifyReplies: user.notifyReplies,
      notifyMentions: user.notifyMentions,
      showOnlineStatus: user.showOnlineStatus,
      createdAt: user.createdAt,
    });

    const vaultToken = signVaultToken({
      ...user,
      passwordHash,
      createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : String(user.createdAt),
    });

    const response = NextResponse.json({
      success: true,
      token,
      vaultToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        reputation: user.reputation,
        website: user.website,
        location: user.location,
        github: user.github,
        twitter: user.twitter,
        themePreference: user.themePreference,
        createdAt: user.createdAt,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    response.cookies.set({
      name: VAULT_COOKIE_NAME,
      value: vaultToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
