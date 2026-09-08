import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  SEED_CATEGORIES,
  SEED_THREADS,
  SEED_USERS,
  SEED_ANNOUNCEMENTS,
  SeedCategory,
  SeedForum,
  SeedThread,
  SeedPost,
  SeedUser,
  SeedAnnouncement,
} from './initialData';
import prisma from './prisma';

// In-memory memory state for instant zero-config resilience
interface MemoryState {
  users: SeedUser[];
  categories: SeedCategory[];
  forums: SeedForum[];
  threads: SeedThread[];
  announcements: SeedAnnouncement[];
  votes: { postId: string; userId: string; type: string }[];
  reports: { id: string; reporterId: string; threadId?: string; postId?: string; reason: string; status: string; createdAt: Date }[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_DATA_FILE = path.join(DATA_DIR, 'forum-store.json');
const TMP_DATA_FILE = path.join(os.tmpdir(), 'eyedea-forum-store.json');

function loadPersistedState(): MemoryState | null {
  try {
    if (typeof window === 'undefined') {
      // 1. Check /tmp file first (contains serverless runtime updates)
      if (fs.existsSync(TMP_DATA_FILE)) {
        try {
          const raw = fs.readFileSync(TMP_DATA_FILE, 'utf-8');
          const parsed = JSON.parse(raw);
          if (parsed && Array.isArray(parsed.threads) && Array.isArray(parsed.users)) {
            return parsed;
          }
        } catch {
          // ignore corrupted tmp
        }
      }
      // 2. Check repository data file
      if (fs.existsSync(LOCAL_DATA_FILE)) {
        const raw = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.threads) && Array.isArray(parsed.users)) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error('Error loading persisted forum data:', e);
  }
  return null;
}

export function persistState() {
  try {
    if (typeof window === 'undefined') {
      const serialized = JSON.stringify(memoryState, null, 2);
      // Write to /tmp (always writable in AWS Lambda / Vercel serverless)
      try {
        fs.writeFileSync(TMP_DATA_FILE, serialized, 'utf-8');
      } catch {
        // ignore tmp write issues
      }
      // Write to local project data file (works in local development, EROFS on serverless)
      try {
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        fs.writeFileSync(LOCAL_DATA_FILE, serialized, 'utf-8');
      } catch {
        // EROFS in read-only environment is expected
      }
    }
  } catch (e) {
    console.error('Error saving forum data to disk:', e);
  }
}

const globalForStore = globalThis as unknown as {
  __eyedeaMemoryState?: MemoryState;
  __isPrismaAvailable?: boolean | null;
};

const defaultState: MemoryState = {
  users: [...SEED_USERS],
  categories: JSON.parse(JSON.stringify(SEED_CATEGORIES)),
  forums: SEED_CATEGORIES.flatMap((c) => c.forums),
  threads: JSON.parse(JSON.stringify(SEED_THREADS)),
  announcements: [...SEED_ANNOUNCEMENTS],
  votes: [],
  reports: [],
};

const memoryState: MemoryState =
  globalForStore.__eyedeaMemoryState || loadPersistedState() || defaultState;

globalForStore.__eyedeaMemoryState = memoryState;

async function checkPrismaConnection(): Promise<boolean> {
  if (globalForStore.__isPrismaAvailable !== undefined && globalForStore.__isPrismaAvailable !== null) {
    return globalForStore.__isPrismaAvailable;
  }
  const dbUrl = process.env.DATABASE_URL;
  // If no DATABASE_URL or pointing to localhost in production, bypass Prisma immediately
  if (!dbUrl || (process.env.NODE_ENV === 'production' && dbUrl.includes('localhost'))) {
    globalForStore.__isPrismaAvailable = false;
    return false;
  }
  try {
    // Quick test query with a short timeout and safe catch
    const isConn = await Promise.race([
      prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1200)),
    ]);
    globalForStore.__isPrismaAvailable = isConn;
    if (isConn) {
      console.log('✅ Connected to PostgreSQL via Prisma');
    } else {
      console.log('ℹ️ Running with resilient forum store.');
    }
    return isConn;
  } catch {
    globalForStore.__isPrismaAvailable = false;
    return false;
  }
}

// -------------------------------------------------------------
// USER METHODS
// -------------------------------------------------------------

export function ensureUserInMemory(user: {
  id: string;
  username: string;
  email: string;
  role?: 'USER' | 'MODERATOR' | 'ADMIN';
  avatar?: string | null;
  bio?: string | null;
  reputation?: number;
  website?: string | null;
  location?: string | null;
  github?: string | null;
  twitter?: string | null;
  themePreference?: 'dark' | 'midnight' | 'system';
  notifyReplies?: boolean;
  notifyMentions?: boolean;
  showOnlineStatus?: boolean;
  createdAt?: string | Date;
  passwordHash?: string;
}): SeedUser {
  const existing = memoryState.users.find(
    (u) => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase()
  );

  if (existing) {
    if (user.avatar !== undefined && user.avatar !== null) existing.avatar = user.avatar;
    if (user.bio !== undefined && user.bio !== null) existing.bio = user.bio;
    if (user.website !== undefined && user.website !== null) existing.website = user.website;
    if (user.location !== undefined && user.location !== null) existing.location = user.location;
    if (user.github !== undefined && user.github !== null) existing.github = user.github;
    if (user.twitter !== undefined && user.twitter !== null) existing.twitter = user.twitter;
    if (user.themePreference) existing.themePreference = user.themePreference;
    if (user.notifyReplies !== undefined) existing.notifyReplies = user.notifyReplies;
    if (user.notifyMentions !== undefined) existing.notifyMentions = user.notifyMentions;
    if (user.showOnlineStatus !== undefined) existing.showOnlineStatus = user.showOnlineStatus;
    if (user.reputation !== undefined) existing.reputation = user.reputation;
    if (user.passwordHash) existing.passwordHash = user.passwordHash;
    persistState();
    return existing;
  }

  const newUser: SeedUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    passwordHash: user.passwordHash || '',
    role: user.role || 'USER',
    avatar: user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`,
    bio: user.bio || 'New member of EyeDea',
    reputation: user.reputation ?? 10,
    website: user.website || '',
    location: user.location || '',
    github: user.github || '',
    twitter: user.twitter || '',
    themePreference: user.themePreference || 'dark',
    notifyReplies: user.notifyReplies !== false,
    notifyMentions: user.notifyMentions !== false,
    showOnlineStatus: user.showOnlineStatus !== false,
    createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
  };

  memoryState.users.push(newUser);
  persistState();
  return newUser;
}

export async function findUserByEmailOrUsername(identifier: string): Promise<SeedUser | null> {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: identifier }, { username: identifier }],
        },
      });
      if (user) {
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role as 'USER' | 'MODERATOR' | 'ADMIN',
          avatar: user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`,
          bio: user.bio || '',
          website: user.website || '',
          location: user.location || '',
          github: user.github || '',
          twitter: user.twitter || '',
          themePreference: (user.themePreference as any) || 'dark',
          notifyReplies: user.notifyReplies !== false,
          notifyMentions: user.notifyMentions !== false,
          showOnlineStatus: user.showOnlineStatus !== false,
          reputation: user.reputation,
          createdAt: user.createdAt,
        };
      }
    } catch (e) {
      console.warn('Prisma findUserByEmailOrUsername error, falling back:', e);
    }
  }

  let user = memoryState.users.find(
    (u) => u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase()
  );

  if (!user) {
    const persisted = loadPersistedState();
    if (persisted && Array.isArray(persisted.users)) {
      for (const pu of persisted.users) {
        if (!memoryState.users.some((m) => m.id === pu.id)) {
          memoryState.users.push(pu);
        }
      }
      user = memoryState.users.find(
        (u) => u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase()
      );
    }
  }

  return user ? { ...user } : null;
}

export async function findUserById(id: string): Promise<SeedUser | null> {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (user) {
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role as 'USER' | 'MODERATOR' | 'ADMIN',
          avatar: user.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`,
          bio: user.bio || '',
          website: user.website || '',
          location: user.location || '',
          github: user.github || '',
          twitter: user.twitter || '',
          themePreference: (user.themePreference as any) || 'dark',
          notifyReplies: user.notifyReplies !== false,
          notifyMentions: user.notifyMentions !== false,
          showOnlineStatus: user.showOnlineStatus !== false,
          reputation: user.reputation,
          createdAt: user.createdAt,
        };
      }
    } catch (e) {
      console.warn('Prisma findUserById error, falling back:', e);
    }
  }

  let user = memoryState.users.find((u) => u.id === id);
  if (!user) {
    const persisted = loadPersistedState();
    if (persisted && Array.isArray(persisted.users)) {
      for (const pu of persisted.users) {
        if (!memoryState.users.some((m) => m.id === pu.id)) {
          memoryState.users.push(pu);
        }
      }
      user = memoryState.users.find((u) => u.id === id);
    }
  }

  return user ? { ...user } : null;
}

export async function createUser(data: {
  username: string;
  email: string;
  passwordHash: string;
  bio?: string;
  avatar?: string;
  website?: string;
  location?: string;
  github?: string;
  twitter?: string;
  themePreference?: 'dark' | 'midnight' | 'system';
  role?: 'USER' | 'MODERATOR' | 'ADMIN';
}): Promise<SeedUser> {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    try {
      const created = await prisma.user.create({
        data: {
          username: data.username,
          email: data.email,
          passwordHash: data.passwordHash,
          bio: data.bio || 'New member of EyeDea',
          avatar: data.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${data.username}`,
          website: data.website || '',
          location: data.location || '',
          github: data.github || '',
          twitter: data.twitter || '',
          themePreference: data.themePreference || 'dark',
          role: data.role || 'USER',
          reputation: 10,
        },
      });

      const memUser: SeedUser = {
        id: created.id,
        username: created.username,
        email: created.email,
        passwordHash: created.passwordHash,
        role: created.role as 'USER' | 'MODERATOR' | 'ADMIN',
        avatar: created.avatar || '',
        bio: created.bio || '',
        website: created.website || '',
        location: created.location || '',
        github: created.github || '',
        twitter: created.twitter || '',
        themePreference: (created.themePreference as any) || 'dark',
        reputation: created.reputation,
        createdAt: created.createdAt,
      };

      if (!memoryState.users.some((u) => u.id === created.id)) {
        memoryState.users.push(memUser);
        persistState();
      }

      return memUser;
    } catch (err) {
      console.warn('Prisma createUser failed, falling back to resilient memory store:', err);
    }
  }

  const newUser: SeedUser = {
    id: `user-${Date.now()}`,
    username: data.username,
    email: data.email,
    passwordHash: data.passwordHash,
    bio: data.bio || 'New member of EyeDea',
    avatar: data.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${data.username}`,
    website: data.website || '',
    location: data.location || '',
    github: data.github || '',
    twitter: data.twitter || '',
    themePreference: data.themePreference || 'dark',
    notifyReplies: true,
    notifyMentions: true,
    showOnlineStatus: true,
    role: data.role || 'USER',
    reputation: 10,
    createdAt: new Date(),
  };

  memoryState.users.push(newUser);
  persistState();
  return newUser;
}

export async function getAllUsers(): Promise<SeedUser[]> {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return users.map((u) => {
        const mem = memoryState.users.find((m) => m.id === u.id);
        return {
          id: u.id,
          username: u.username,
          email: u.email,
          passwordHash: '',
          role: u.role as 'USER' | 'MODERATOR' | 'ADMIN',
          avatar: u.avatar || '',
          bio: u.bio || '',
          reputation: u.reputation,
          isBanned: u.isBanned,
          website: u.website || mem?.website || '',
          location: u.location || mem?.location || '',
          github: u.github || mem?.github || '',
          twitter: u.twitter || mem?.twitter || '',
          themePreference: (u.themePreference as any) || mem?.themePreference || 'dark',
          notifyReplies: u.notifyReplies !== false,
          notifyMentions: u.notifyMentions !== false,
          showOnlineStatus: u.showOnlineStatus !== false,
          createdAt: u.createdAt,
        };
      });
    } catch (e) {
      console.warn('Prisma getAllUsers error, falling back:', e);
    }
  }

  // Merge any users persisted in tmp
  const persisted = loadPersistedState();
  if (persisted && Array.isArray(persisted.users)) {
    for (const pu of persisted.users) {
      if (!memoryState.users.some((m) => m.id === pu.id)) {
        memoryState.users.push(pu);
      }
    }
  }

  return memoryState.users.map((u) => ({
    ...u,
    isBanned: !!u.isBanned,
    passwordHash: '',
  }));
}

export async function updateUserRole(userId: string, role: 'USER' | 'MODERATOR' | 'ADMIN'): Promise<boolean> {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
    return true;
  }

  const user = memoryState.users.find((u) => u.id === userId);
  if (user) {
    user.role = role;
    persistState();
    return true;
  }
  return false;
}

export async function toggleUserBan(userId: string): Promise<boolean> {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: !user.isBanned },
    });
    return true;
  }

  const user = memoryState.users.find((u) => u.id === userId);
  if (user) {
    user.isBanned = !user.isBanned;
    persistState();
    return true;
  }
  return false;
}

export async function adminUpdateUser(
  userId: string,
  data: {
    username?: string;
    avatar?: string;
    bio?: string;
    role?: 'USER' | 'MODERATOR' | 'ADMIN';
    isBanned?: boolean;
    website?: string;
    location?: string;
    github?: string;
    twitter?: string;
  }
): Promise<{ success: boolean; error?: string; user?: SeedUser }> {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: {
          username: { equals: data.username, mode: 'insensitive' },
          NOT: { id: userId },
        },
      });
      if (existing) {
        return { success: false, error: 'Username is already taken by another member' };
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.username ? { username: data.username } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.role ? { role: data.role } : {}),
        ...(data.isBanned !== undefined ? { isBanned: data.isBanned } : {}),
      },
    });

    let mem = memoryState.users.find((u) => u.id === userId);
    if (!mem) {
      mem = {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        passwordHash: updated.passwordHash,
        role: updated.role as 'USER' | 'MODERATOR' | 'ADMIN',
        avatar: updated.avatar || '',
        bio: updated.bio || '',
        reputation: updated.reputation,
        isBanned: updated.isBanned,
        createdAt: updated.createdAt,
      };
      memoryState.users.push(mem);
    }
    if (data.username) mem.username = data.username;
    if (data.avatar !== undefined) mem.avatar = data.avatar;
    if (data.bio !== undefined) mem.bio = data.bio;
    if (data.role) mem.role = data.role;
    if (data.isBanned !== undefined) mem.isBanned = data.isBanned;
    if (data.website !== undefined) mem.website = data.website;
    if (data.location !== undefined) mem.location = data.location;
    if (data.github !== undefined) mem.github = data.github;
    if (data.twitter !== undefined) mem.twitter = data.twitter;
    persistState();

    return {
      success: true,
      user: {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        passwordHash: updated.passwordHash,
        role: updated.role as 'USER' | 'MODERATOR' | 'ADMIN',
        avatar: updated.avatar || '',
        bio: updated.bio || '',
        reputation: updated.reputation,
        isBanned: updated.isBanned,
        website: mem?.website || '',
        location: mem?.location || '',
        github: mem?.github || '',
        twitter: mem?.twitter || '',
        themePreference: mem?.themePreference || 'dark',
        notifyReplies: mem?.notifyReplies !== false,
        notifyMentions: mem?.notifyMentions !== false,
        showOnlineStatus: mem?.showOnlineStatus !== false,
        createdAt: updated.createdAt,
      },
    };
  }

  // Memory fallback
  const user = memoryState.users.find((u) => u.id === userId);
  if (!user) return { success: false, error: 'User not found' };

  if (data.username && data.username.toLowerCase() !== user.username.toLowerCase()) {
    const existing = memoryState.users.find(
      (u) => u.id !== userId && u.username.toLowerCase() === data.username!.toLowerCase()
    );
    if (existing) {
      return { success: false, error: 'Username is already taken by another member' };
    }
    user.username = data.username;
  }

  if (data.avatar !== undefined) user.avatar = data.avatar;
  if (data.bio !== undefined) user.bio = data.bio;
  if (data.role) user.role = data.role;
  if (data.isBanned !== undefined) user.isBanned = data.isBanned;
  if (data.website !== undefined) user.website = data.website;
  if (data.location !== undefined) user.location = data.location;
  if (data.github !== undefined) user.github = data.github;
  if (data.twitter !== undefined) user.twitter = data.twitter;

  persistState();
  return { success: true, user: { ...user } };
}

export async function updateUserProfile(
  userId: string,
  data: {
    username?: string;
    avatar?: string;
    bio?: string;
    passwordHash?: string;
    website?: string;
    location?: string;
    github?: string;
    twitter?: string;
    themePreference?: 'dark' | 'midnight' | 'system';
    notifyReplies?: boolean;
    notifyMentions?: boolean;
    showOnlineStatus?: boolean;
  }
): Promise<{ success: boolean; error?: string; user?: SeedUser }> {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: {
          username: { equals: data.username, mode: 'insensitive' },
          NOT: { id: userId },
        },
      });
      if (existing) {
        return { success: false, error: 'Username is already taken by another member' };
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.username ? { username: data.username } : {}),
        ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.passwordHash ? { passwordHash: data.passwordHash } : {}),
      },
    });

    let mem = memoryState.users.find((u) => u.id === userId);
    if (!mem) {
      mem = {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        passwordHash: updated.passwordHash,
        role: updated.role as 'USER' | 'MODERATOR' | 'ADMIN',
        avatar: updated.avatar || '',
        bio: updated.bio || '',
        reputation: updated.reputation,
        isBanned: updated.isBanned,
        createdAt: updated.createdAt,
      };
      memoryState.users.push(mem);
    }
    if (data.username) mem.username = data.username;
    if (data.avatar !== undefined) mem.avatar = data.avatar;
    if (data.bio !== undefined) mem.bio = data.bio;
    if (data.passwordHash) mem.passwordHash = data.passwordHash;
    if (data.website !== undefined) mem.website = data.website;
    if (data.location !== undefined) mem.location = data.location;
    if (data.github !== undefined) mem.github = data.github;
    if (data.twitter !== undefined) mem.twitter = data.twitter;
    if (data.themePreference !== undefined) mem.themePreference = data.themePreference;
    if (data.notifyReplies !== undefined) mem.notifyReplies = data.notifyReplies;
    if (data.notifyMentions !== undefined) mem.notifyMentions = data.notifyMentions;
    if (data.showOnlineStatus !== undefined) mem.showOnlineStatus = data.showOnlineStatus;
    persistState();

    return {
      success: true,
      user: {
        id: updated.id,
        username: updated.username,
        email: updated.email,
        passwordHash: updated.passwordHash,
        role: updated.role as 'USER' | 'MODERATOR' | 'ADMIN',
        avatar: updated.avatar || '',
        bio: updated.bio || '',
        reputation: updated.reputation,
        isBanned: updated.isBanned,
        website: mem?.website || '',
        location: mem?.location || '',
        github: mem?.github || '',
        twitter: mem?.twitter || '',
        themePreference: mem?.themePreference || 'dark',
        notifyReplies: mem?.notifyReplies !== false,
        notifyMentions: mem?.notifyMentions !== false,
        showOnlineStatus: mem?.showOnlineStatus !== false,
        createdAt: updated.createdAt,
      },
    };
  }

  // Memory fallback
  const user = memoryState.users.find((u) => u.id === userId);
  if (!user) return { success: false, error: 'User not found' };

  if (data.username && data.username.toLowerCase() !== user.username.toLowerCase()) {
    const existing = memoryState.users.find(
      (u) => u.id !== userId && u.username.toLowerCase() === data.username!.toLowerCase()
    );
    if (existing) {
      return { success: false, error: 'Username is already taken by another member' };
    }
    user.username = data.username;
  }

  if (data.avatar !== undefined) user.avatar = data.avatar;
  if (data.bio !== undefined) user.bio = data.bio;
  if (data.passwordHash) user.passwordHash = data.passwordHash;
  if (data.website !== undefined) user.website = data.website;
  if (data.location !== undefined) user.location = data.location;
  if (data.github !== undefined) user.github = data.github;
  if (data.twitter !== undefined) user.twitter = data.twitter;
  if (data.themePreference !== undefined) user.themePreference = data.themePreference;
  if (data.notifyReplies !== undefined) user.notifyReplies = data.notifyReplies;
  if (data.notifyMentions !== undefined) user.notifyMentions = data.notifyMentions;
  if (data.showOnlineStatus !== undefined) user.showOnlineStatus = data.showOnlineStatus;

  persistState();
  return { success: true, user: { ...user } };
}

export async function getUserProfileWithStats(userId: string) {
  let mem = memoryState.users.find((u) => u.id === userId);
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: { threads: true, posts: true },
          },
        },
      });
      if (user) {
        if (!mem) {
          mem = {
            id: user.id,
            username: user.username,
            email: user.email,
            passwordHash: user.passwordHash,
            role: user.role as 'USER' | 'MODERATOR' | 'ADMIN',
            avatar: user.avatar || '',
            bio: user.bio || '',
            reputation: user.reputation,
            isBanned: user.isBanned,
            website: user.website || '',
            location: user.location || '',
            github: user.github || '',
            twitter: user.twitter || '',
            themePreference: (user.themePreference as any) || 'dark',
            notifyReplies: user.notifyReplies !== false,
            notifyMentions: user.notifyMentions !== false,
            showOnlineStatus: user.showOnlineStatus !== false,
            createdAt: user.createdAt,
          };
          memoryState.users.push(mem);
          persistState();
        }

        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          bio: user.bio,
          reputation: user.reputation,
          isBanned: user.isBanned,
          website: user.website || mem?.website || '',
          location: user.location || mem?.location || '',
          github: user.github || mem?.github || '',
          twitter: user.twitter || mem?.twitter || '',
          themePreference: (user.themePreference as any) || mem?.themePreference || 'dark',
          notifyReplies: user.notifyReplies !== false,
          notifyMentions: user.notifyMentions !== false,
          showOnlineStatus: user.showOnlineStatus !== false,
          createdAt: user.createdAt,
          threadCount: user._count.threads,
          postCount: user._count.posts,
        };
      }
    } catch (e) {
      console.warn('Prisma getUserProfileWithStats error, falling back:', e);
    }
  }

  let user = memoryState.users.find((u) => u.id === userId);
  if (!user) {
    const persisted = loadPersistedState();
    if (persisted && Array.isArray(persisted.users)) {
      for (const pu of persisted.users) {
        if (!memoryState.users.some((m) => m.id === pu.id)) {
          memoryState.users.push(pu);
        }
      }
      user = memoryState.users.find((u) => u.id === userId);
    }
  }
  if (!user) return null;

  const threadCount = memoryState.threads.filter((t) => t.authorId === userId).length;
  let postCount = 0;
  memoryState.threads.forEach((t) => {
    postCount += t.posts.filter((p) => p.authorId === userId).length;
  });

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    reputation: user.reputation,
    isBanned: !!user.isBanned,
    website: user.website || '',
    location: user.location || '',
    github: user.github || '',
    twitter: user.twitter || '',
    themePreference: user.themePreference || 'dark',
    notifyReplies: user.notifyReplies !== false,
    notifyMentions: user.notifyMentions !== false,
    showOnlineStatus: user.showOnlineStatus !== false,
    createdAt: user.createdAt,
    threadCount,
    postCount,
  };
}

// -------------------------------------------------------------
// FORUM & CATEGORY METHODS
// -------------------------------------------------------------

export interface ForumWithStats extends SeedForum {
  threadCount: number;
  postCount: number;
  latestPost?: {
    threadId: string;
    threadTitle: string;
    authorUsername: string;
    authorAvatar: string;
    createdAt: Date;
  } | null;
}

export interface CategoryWithForums extends SeedCategory {
  forums: ForumWithStats[];
}

export async function getForumHierarchy(): Promise<CategoryWithForums[]> {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        forums: {
          orderBy: { sortOrder: 'asc' },
          include: {
            threads: {
              include: {
                posts: {
                  include: {
                    author: true,
                  },
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    return categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || 'Folder',
      sortOrder: cat.sortOrder,
      forums: cat.forums.map((f) => {
        let totalPosts = 0;
        let latestPostInfo: ForumWithStats['latestPost'] = null;

        f.threads.forEach((t) => {
          totalPosts += t.posts.length;
          if (t.posts[0]) {
            const p = t.posts[0];
            if (!latestPostInfo || new Date(p.createdAt) > new Date(latestPostInfo.createdAt)) {
              latestPostInfo = {
                threadId: t.id,
                threadTitle: t.title,
                authorUsername: p.author.username,
                authorAvatar: p.author.avatar || '',
                createdAt: p.createdAt,
              };
            }
          }
        });

        return {
          id: f.id,
          categoryId: f.categoryId,
          name: f.name,
          slug: f.slug,
          description: f.description,
          icon: f.icon || 'MessageSquare',
          isLocked: f.isLocked,
          sortOrder: f.sortOrder,
          threadCount: f.threads.length,
          postCount: totalPosts,
          latestPost: latestPostInfo,
        };
      }),
    }));
  }

  // Memory fallback
  return memoryState.categories.map((cat) => ({
    ...cat,
    forums: cat.forums.map((f) => {
      const threads = memoryState.threads.filter((t) => t.forumId === f.id);
      let postCount = 0;
      let latestPost: ForumWithStats['latestPost'] = null;

      threads.forEach((t) => {
        postCount += t.posts.length;
        t.posts.forEach((p) => {
          if (!latestPost || new Date(p.createdAt) > new Date(latestPost.createdAt)) {
            const author = memoryState.users.find((u) => u.id === p.authorId);
            latestPost = {
              threadId: t.id,
              threadTitle: t.title,
              authorUsername: author?.username || 'Member',
              authorAvatar: author?.avatar || '',
              createdAt: p.createdAt,
            };
          }
        });
      });

      return {
        ...f,
        threadCount: threads.length,
        postCount,
        latestPost,
      };
    }),
  }));
}

export async function getForumBySlug(slug: string) {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    const forum = await prisma.forum.findUnique({
      where: { slug },
      include: {
        category: true,
        threads: {
          orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
          include: {
            author: true,
            posts: {
              include: { author: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            _count: {
              select: { posts: true },
            },
          },
        },
      },
    });

    if (!forum) return null;

    return {
      ...forum,
      threads: forum.threads.map((t) => ({
        id: t.id,
        forumId: t.forumId,
        title: t.title,
        slug: t.slug,
        isPinned: t.isPinned,
        isLocked: t.isLocked,
        viewCount: t.viewCount,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        author: {
          id: t.author.id,
          username: t.author.username,
          avatar: t.author.avatar,
          role: t.author.role,
        },
        replyCount: Math.max(0, t._count.posts - 1),
        latestPost: t.posts[0]
          ? {
              authorUsername: t.posts[0].author.username,
              authorAvatar: t.posts[0].author.avatar,
              createdAt: t.posts[0].createdAt,
            }
          : null,
      })),
    };
  }

  // Memory fallback
  const forum = memoryState.forums.find((f) => f.slug === slug);
  if (!forum) return null;

  const category = memoryState.categories.find((c) => c.id === forum.categoryId);
  const threads = memoryState.threads
    .filter((t) => t.forumId === forum.id)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .map((t) => {
      const author = memoryState.users.find((u) => u.id === t.authorId);
      const latest = [...t.posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      const latestAuthor = latest ? memoryState.users.find((u) => u.id === latest.authorId) : null;

      return {
        id: t.id,
        forumId: t.forumId,
        title: t.title,
        slug: t.slug,
        isPinned: t.isPinned,
        isLocked: t.isLocked,
        viewCount: t.viewCount,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        author: {
          id: author?.id || 'unknown',
          username: author?.username || 'Member',
          avatar: author?.avatar,
          role: author?.role || 'USER',
        },
        replyCount: Math.max(0, t.posts.length - 1),
        latestPost: latest
          ? {
              authorUsername: latestAuthor?.username || 'Member',
              authorAvatar: latestAuthor?.avatar,
              createdAt: latest.createdAt,
            }
          : null,
      };
    });

  return {
    ...forum,
    category,
    threads,
  };
}

// -------------------------------------------------------------
// THREAD & POST METHODS
// -------------------------------------------------------------

export async function getThreadById(id: string) {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    const thread = await prisma.thread.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        forum: {
          include: { category: true },
        },
        author: true,
        posts: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: true,
            votes: true,
          },
        },
      },
    });

    if (!thread) return null;

    // Increment view count asynchronously
    prisma.thread.update({
      where: { id: thread.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    return thread;
  }

  // Memory fallback: match by ID OR slug
  const thread = memoryState.threads.find((t) => t.id === id || t.slug === id);
  if (!thread) return null;

  thread.viewCount += 1;
  const forum = memoryState.forums.find((f) => f.id === thread.forumId);
  const category = forum ? memoryState.categories.find((c) => c.id === forum.categoryId) : null;
  const author = memoryState.users.find((u) => u.id === thread.authorId);

  const postsWithAuthor = thread.posts.map((p) => {
    const postAuthor = memoryState.users.find((u) => u.id === p.authorId);
    const postVotes = memoryState.votes.filter((v) => v.postId === p.id);
    return {
      ...p,
      author: postAuthor || {
        id: 'unknown',
        username: 'Member',
        avatar: '',
        role: 'USER',
        reputation: 10,
        createdAt: new Date(),
      },
      votes: postVotes,
    };
  });

  return {
    ...thread,
    forum: forum ? { ...forum, category } : null,
    author: author || { id: 'unknown', username: 'Member', avatar: '', role: 'USER', reputation: 10, createdAt: new Date() },
    posts: postsWithAuthor,
  };
}

export async function createThread(data: {
  forumId: string;
  authorId: string;
  title: string;
  content: string;
}) {
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .substring(0, 80);

  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    const thread = await prisma.thread.create({
      data: {
        forumId: data.forumId,
        authorId: data.authorId,
        title: data.title,
        slug: `${slug}-${Date.now().toString(36)}`,
        posts: {
          create: {
            authorId: data.authorId,
            content: data.content,
            isFirstPost: true,
          },
        },
      },
      include: {
        posts: true,
      },
    });

    // Award reputation points for creating an idea
    prisma.user.update({
      where: { id: data.authorId },
      data: { reputation: { increment: 5 } },
    }).catch(() => {});

    return thread;
  }

  // Memory fallback
  const threadId = `thread-${Date.now()}`;
  const postId = `post-${Date.now()}`;
  const newPost: SeedPost = {
    id: postId,
    threadId,
    authorId: data.authorId,
    content: data.content,
    isFirstPost: true,
    upvotes: 0,
    createdAt: new Date(),
  };

  const newThread: SeedThread = {
    id: threadId,
    forumId: data.forumId,
    authorId: data.authorId,
    title: data.title,
    slug: `${slug}-${Date.now().toString(36)}`,
    isPinned: false,
    isLocked: false,
    viewCount: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    posts: [newPost],
  };

  memoryState.threads.unshift(newThread);

  const author = memoryState.users.find((u) => u.id === data.authorId);
  if (author) author.reputation += 5;

  persistState();

  return newThread;
}

export async function createPost(data: {
  threadId: string;
  authorId: string;
  content: string;
}) {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    const targetThread = await prisma.thread.findFirst({
      where: {
        OR: [{ id: data.threadId }, { slug: data.threadId }],
      },
    });
    if (!targetThread) throw new Error('Thread not found');

    const post = await prisma.post.create({
      data: {
        threadId: targetThread.id,
        authorId: data.authorId,
        content: data.content,
        isFirstPost: false,
      },
      include: {
        author: true,
      },
    });

    // Update thread updatedAt timestamp
    await prisma.thread.update({
      where: { id: targetThread.id },
      data: { updatedAt: new Date() },
    });

    // Award reputation points for replying
    prisma.user.update({
      where: { id: data.authorId },
      data: { reputation: { increment: 2 } },
    }).catch(() => {});

    return post;
  }

  // Memory fallback: match by ID OR slug
  const thread = memoryState.threads.find((t) => t.id === data.threadId || t.slug === data.threadId);
  if (!thread) throw new Error('Thread not found');

  const post: SeedPost = {
    id: `post-${Date.now()}`,
    threadId: thread.id,
    authorId: data.authorId,
    content: data.content,
    isFirstPost: false,
    upvotes: 0,
    createdAt: new Date(),
  };

  thread.posts.push(post);
  thread.updatedAt = new Date();

  const author = memoryState.users.find((u) => u.id === data.authorId);
  if (author) author.reputation += 2;

  persistState();

  return { ...post, author };
}

export async function toggleVotePost(
  postId: string,
  userId: string
): Promise<{ upvotes: number; userVoted: boolean; authorId?: string; authorReputation?: number }> {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true, upvotes: true },
    });
    if (!post) return { upvotes: 0, userVoted: false };

    const existing = await prisma.vote.findUnique({
      where: {
        postId_userId: { postId, userId },
      },
    });

    if (existing) {
      await prisma.vote.delete({ where: { id: existing.id } });
      const updated = await prisma.post.update({
        where: { id: postId },
        data: { upvotes: { decrement: 1 } },
      });

      let authorRep: number | undefined;
      // Deduct reputation if reaction is removed by another member
      if (post.authorId !== userId) {
        const updatedAuthor = await prisma.user.update({
          where: { id: post.authorId },
          data: { reputation: { decrement: 5 } },
        });
        authorRep = updatedAuthor.reputation;

        const memAuthor = memoryState.users.find((u) => u.id === post.authorId);
        if (memAuthor) {
          memAuthor.reputation = Math.max(0, memAuthor.reputation - 5);
          persistState();
        }
      }

      return {
        upvotes: Math.max(0, updated.upvotes),
        userVoted: false,
        authorId: post.authorId,
        authorReputation: authorRep,
      };
    } else {
      await prisma.vote.create({
        data: { postId, userId, type: 'UP' },
      });
      const updated = await prisma.post.update({
        where: { id: postId },
        data: { upvotes: { increment: 1 } },
      });

      let authorRep: number | undefined;
      // Award reputation to author when someone reacts to their post
      if (post.authorId !== userId) {
        const updatedAuthor = await prisma.user.update({
          where: { id: post.authorId },
          data: { reputation: { increment: 5 } },
        });
        authorRep = updatedAuthor.reputation;

        const memAuthor = memoryState.users.find((u) => u.id === post.authorId);
        if (memAuthor) {
          memAuthor.reputation += 5;
          persistState();
        }
      }

      return {
        upvotes: updated.upvotes,
        userVoted: true,
        authorId: post.authorId,
        authorReputation: authorRep,
      };
    }
  }

  // Memory fallback
  const voteIdx = memoryState.votes.findIndex((v) => v.postId === postId && v.userId === userId);
  let post: SeedPost | undefined;
  for (const t of memoryState.threads) {
    post = t.posts.find((p) => p.id === postId);
    if (post) break;
  }

  if (!post) return { upvotes: 0, userVoted: false };

  const postAuthor = memoryState.users.find((u) => u.id === post.authorId);

  if (voteIdx >= 0) {
    memoryState.votes.splice(voteIdx, 1);
    post.upvotes = Math.max(0, post.upvotes - 1);
    if (post.authorId !== userId && postAuthor) {
      postAuthor.reputation = Math.max(0, postAuthor.reputation - 5);
    }
    persistState();
    return {
      upvotes: post.upvotes,
      userVoted: false,
      authorId: post.authorId,
      authorReputation: postAuthor?.reputation,
    };
  } else {
    memoryState.votes.push({ postId, userId, type: 'UP' });
    post.upvotes += 1;
    if (post.authorId !== userId && postAuthor) {
      postAuthor.reputation += 5;
    }
    persistState();
    return {
      upvotes: post.upvotes,
      userVoted: true,
      authorId: post.authorId,
      authorReputation: postAuthor?.reputation,
    };
  }
}

// -------------------------------------------------------------
// ADMIN & MODERATION METHODS
// -------------------------------------------------------------

export async function getAdminStats() {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    const [userCount, threadCount, postCount, reportCount] = await Promise.all([
      prisma.user.count(),
      prisma.thread.count(),
      prisma.post.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
    ]);
    return {
      users: userCount,
      threads: threadCount,
      posts: postCount,
      pendingReports: reportCount,
      isDatabaseConnected: true,
    };
  }

  const postCount = memoryState.threads.reduce((sum, t) => sum + t.posts.length, 0);
  return {
    users: memoryState.users.length,
    threads: memoryState.threads.length,
    posts: postCount,
    pendingReports: memoryState.reports.filter((r) => r.status === 'PENDING').length,
    isDatabaseConnected: false,
  };
}

export async function togglePinThread(threadId: string): Promise<boolean> {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    const thread = await prisma.thread.findFirst({
      where: { OR: [{ id: threadId }, { slug: threadId }] },
    });
    if (!thread) return false;
    await prisma.thread.update({
      where: { id: thread.id },
      data: { isPinned: !thread.isPinned },
    });
    return true;
  }

  const thread = memoryState.threads.find((t) => t.id === threadId || t.slug === threadId);
  if (thread) {
    thread.isPinned = !thread.isPinned;
    persistState();
    return true;
  }
  return false;
}

export async function toggleLockThread(threadId: string): Promise<boolean> {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    const thread = await prisma.thread.findFirst({
      where: { OR: [{ id: threadId }, { slug: threadId }] },
    });
    if (!thread) return false;
    await prisma.thread.update({
      where: { id: thread.id },
      data: { isLocked: !thread.isLocked },
    });
    return true;
  }

  const thread = memoryState.threads.find((t) => t.id === threadId || t.slug === threadId);
  if (thread) {
    thread.isLocked = !thread.isLocked;
    persistState();
    return true;
  }
  return false;
}

export async function deleteThread(threadId: string): Promise<boolean> {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    const thread = await prisma.thread.findFirst({
      where: { OR: [{ id: threadId }, { slug: threadId }] },
    });
    if (!thread) return false;
    await prisma.thread.delete({ where: { id: thread.id } });
    return true;
  }

  const index = memoryState.threads.findIndex((t) => t.id === threadId || t.slug === threadId);
  if (index >= 0) {
    memoryState.threads.splice(index, 1);
    persistState();
    return true;
  }
  return false;
}

export async function getAnnouncements(): Promise<SeedAnnouncement[]> {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    const ann = await prisma.announcement.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    return ann.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      authorId: a.authorId,
      isActive: a.isActive,
      priority: a.priority as 'INFO' | 'WARNING' | 'CRITICAL',
      createdAt: a.createdAt,
    }));
  }

  return memoryState.announcements.filter((a) => a.isActive);
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  authorId: string;
  priority?: 'INFO' | 'WARNING' | 'CRITICAL';
}) {
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    return prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        authorId: data.authorId,
        priority: data.priority || 'INFO',
        isActive: true,
      },
    });
  }

  const ann: SeedAnnouncement = {
    id: `ann-${Date.now()}`,
    title: data.title,
    content: data.content,
    authorId: data.authorId,
    priority: data.priority || 'INFO',
    isActive: true,
    createdAt: new Date(),
  };
  memoryState.announcements.unshift(ann);
  persistState();
  return ann;
}

export async function createCategory(data: { name: string; description: string; icon?: string }) {
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    return prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        icon: data.icon || 'Folder',
        sortOrder: 99,
      },
    });
  }

  const newCat: SeedCategory = {
    id: `cat-${Date.now()}`,
    name: data.name,
    slug,
    description: data.description,
    icon: data.icon || 'Folder',
    sortOrder: memoryState.categories.length + 1,
    forums: [],
  };
  memoryState.categories.push(newCat);
  persistState();
  return newCat;
}

export async function createForum(data: {
  categoryId: string;
  name: string;
  description: string;
  icon?: string;
}) {
  const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const usePrisma = await checkPrismaConnection();
  if (usePrisma) {
    return prisma.forum.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        slug,
        description: data.description,
        icon: data.icon || 'MessageSquare',
      },
    });
  }

  const cat = memoryState.categories.find((c) => c.id === data.categoryId);
  const newForum: SeedForum = {
    id: `forum-${Date.now()}`,
    categoryId: data.categoryId,
    name: data.name,
    slug,
    description: data.description,
    icon: data.icon || 'MessageSquare',
    isLocked: false,
    sortOrder: (cat?.forums.length || 0) + 1,
  };

  if (cat) {
    cat.forums.push(newForum);
  }
  memoryState.forums.push(newForum);
  persistState();
  return newForum;
}
