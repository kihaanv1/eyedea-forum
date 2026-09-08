import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'ideasphere_jwt_secret_default_key_2026';
const TOKEN_NAME = 'ideasphere_session';
export const VAULT_COOKIE_NAME = 'ideasphere_vault';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  avatar?: string | null;
  bio?: string | null;
  reputation: number;
  website?: string | null;
  location?: string | null;
  github?: string | null;
  twitter?: string | null;
  themePreference?: 'dark' | 'midnight' | 'system';
  notifyReplies?: boolean;
  notifyMentions?: boolean;
  showOnlineStatus?: boolean;
  createdAt?: string | Date;
}

export interface VaultAccount extends AuthUser {
  passwordHash?: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(user: Partial<AuthUser> & { id: string; username: string; email: string; role: 'USER' | 'MODERATOR' | 'ADMIN'; reputation: number }): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      bio: user.bio || '',
      reputation: user.reputation ?? 10,
      website: user.website || '',
      location: user.location || '',
      github: user.github || '',
      twitter: user.twitter || '',
      themePreference: user.themePreference || 'dark',
      notifyReplies: user.notifyReplies !== false,
      notifyMentions: user.notifyMentions !== false,
      showOnlineStatus: user.showOnlineStatus !== false,
      createdAt: user.createdAt || new Date().toISOString(),
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch {
    return null;
  }
}

export function signVaultToken(account: VaultAccount): string {
  return jwt.sign(account, JWT_SECRET, { expiresIn: '365d' });
}

export function verifyVaultToken(token: string): VaultAccount | null {
  try {
    return jwt.verify(token, JWT_SECRET) as VaultAccount;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(TOKEN_NAME)?.value;
    if (!token) return null;
    const user = verifyToken(token);
    if (!user) return null;

    // Auto-hydrate memory store if running in a fresh serverless lambda instance
    try {
      const { ensureUserInMemory } = await import('./store');
      ensureUserInMemory(user);
    } catch {
      // ignore
    }

    return user;
  } catch {
    return null;
  }
}

export const AUTH_COOKIE_NAME = TOKEN_NAME;

