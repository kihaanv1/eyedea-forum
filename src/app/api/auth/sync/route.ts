import { NextResponse, NextRequest } from 'next/server';
import { verifyToken, verifyVaultToken, signToken, AUTH_COOKIE_NAME, VAULT_COOKIE_NAME } from '@/lib/auth';
import { ensureUserInMemory } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const { token, vaultToken } = await req.json();

    let account = token ? verifyToken(token) : null;
    if (!account && vaultToken) {
      account = verifyVaultToken(vaultToken);
    }

    if (!account) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const hydrated = ensureUserInMemory({
      ...account,
      createdAt: account.createdAt ? new Date(account.createdAt) : new Date(),
    });

    const refreshedToken = signToken({
      id: hydrated.id,
      username: hydrated.username,
      email: hydrated.email,
      role: hydrated.role,
      avatar: hydrated.avatar,
      bio: hydrated.bio,
      reputation: hydrated.reputation,
      website: hydrated.website,
      location: hydrated.location,
      github: hydrated.github,
      twitter: hydrated.twitter,
      themePreference: hydrated.themePreference,
      notifyReplies: hydrated.notifyReplies,
      notifyMentions: hydrated.notifyMentions,
      showOnlineStatus: hydrated.showOnlineStatus,
      createdAt: hydrated.createdAt,
    });

    const res = NextResponse.json({
      success: true,
      user: {
        id: hydrated.id,
        username: hydrated.username,
        email: hydrated.email,
        role: hydrated.role,
        avatar: hydrated.avatar,
        bio: hydrated.bio,
        reputation: hydrated.reputation,
        website: hydrated.website,
        location: hydrated.location,
        github: hydrated.github,
        twitter: hydrated.twitter,
        themePreference: hydrated.themePreference,
        createdAt: hydrated.createdAt,
      },
    });

    res.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: refreshedToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    if (vaultToken) {
      res.cookies.set({
        name: VAULT_COOKIE_NAME,
        value: vaultToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Sync failed' }, { status: 500 });
  }
}
