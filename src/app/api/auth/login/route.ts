import { NextResponse, NextRequest } from 'next/server';
import { verifyPassword, signToken, signVaultToken, verifyVaultToken, AUTH_COOKIE_NAME, VAULT_COOKIE_NAME } from '@/lib/auth';
import { findUserByEmailOrUsername, ensureUserInMemory } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password, clientVaultToken } = body;

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Username/email and password are required' }, { status: 400 });
    }

    const trimmed = identifier.trim();
    let user = await findUserByEmailOrUsername(trimmed);

    // If user not in server memory/store, attempt recovery from cookies or client vault
    if (!user) {
      const cookieVault = req.cookies.get(VAULT_COOKIE_NAME)?.value;
      const vaultCandidate = cookieVault || clientVaultToken;

      if (vaultCandidate) {
        const recovered = verifyVaultToken(vaultCandidate);
        if (
          recovered &&
          (recovered.username.toLowerCase() === trimmed.toLowerCase() ||
            recovered.email.toLowerCase() === trimmed.toLowerCase())
        ) {
          user = ensureUserInMemory({
            ...recovered,
            createdAt: recovered.createdAt ? new Date(recovered.createdAt) : new Date(),
          });
        }
      }
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

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
    console.error('Login error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
