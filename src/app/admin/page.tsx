'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  FolderPlus,
  PlusCircle,
  Megaphone,
  CheckCircle2,
  Database,
  Search,
  Lock,
  UserCheck,
  Ban,
  Activity,
  ArrowUpRight,
  Settings,
  Camera,
  Upload,
  Trash2,
  Shuffle,
  Edit3,
  X,
  Check,
  Globe,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { RoleBadge } from '@/components/Badge';

interface AdminStats {
  users: number;
  threads: number;
  posts: number;
  pendingReports: number;
  isDatabaseConnected: boolean;
}

interface UserItem {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  avatar?: string;
  bio?: string;
  reputation: number;
  isBanned?: boolean;
  website?: string;
  location?: string;
  github?: string;
  twitter?: string;
  createdAt: string;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  forums: {
    id: string;
    name: string;
    description: string;
  }[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'users' | 'announcements'>('overview');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');

  // Category creation form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Folder');

  // Board creation form state
  const [targetCatId, setTargetCatId] = useState('');
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');
  const [newBoardIcon, setNewBoardIcon] = useState('MessageSquare');

  // Announcement form state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'INFO' | 'WARNING' | 'CRITICAL'>('INFO');

  // Edit User Settings Modal state
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editRole, setEditRole] = useState<'USER' | 'MODERATOR' | 'ADMIN'>('USER');
  const [editReputation, setEditReputation] = useState(10);
  const [editIsBanned, setEditIsBanned] = useState(false);
  const [editWebsite, setEditWebsite] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [editTwitter, setEditTwitter] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Avatar upload for admin editing user
  const adminFileInputRef = useRef<HTMLInputElement | null>(null);
  const [adminUploadFile, setAdminUploadFile] = useState<File | null>(null);
  const [adminUploadPreview, setAdminUploadPreview] = useState<string | null>(null);
  const [isAdminUploadingAvatar, setIsAdminUploadingAvatar] = useState(false);

  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    checkAdminAuth();
  }, []);

  const checkAdminAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user && (data.user.role === 'ADMIN' || data.user.role === 'MODERATOR')) {
        setCurrentUser(data.user);
        loadDashboardData();
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [statsRes, usersRes, forumsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/forums'),
      ]);

      if (statsRes.ok) {
        const d = await statsRes.json();
        setStats(d.stats);
      }

      if (usersRes.ok) {
        const d = await usersRes.json();
        setUsers(d.users);
      }

      if (forumsRes.ok) {
        const d = await forumsRes.json();
        setCategories(d.categories);
        if (d.categories[0]) setTargetCatId(d.categories[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCatName.trim(),
          description: newCatDesc.trim(),
          icon: newCatIcon,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create category');

      setActionSuccess(`Category "${newCatName}" created successfully!`);
      setNewCatName('');
      setNewCatDesc('');
      loadDashboardData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleCreateForum = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    if (!targetCatId) {
      setActionError('Please select a parent category');
      return;
    }

    try {
      const res = await fetch('/api/admin/forums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: targetCatId,
          name: newBoardName.trim(),
          description: newBoardDesc.trim(),
          icon: newBoardIcon,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create subforum board');

      setActionSuccess(`Board "${newBoardName}" added successfully!`);
      setNewBoardName('');
      setNewBoardDesc('');
      loadDashboardData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: annTitle.trim(),
          content: annContent.trim(),
          priority: annPriority,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post announcement');

      setActionSuccess('Official announcement broadcasted successfully!');
      setAnnTitle('');
      setAnnContent('');
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'USER' | 'MODERATOR' | 'ADMIN') => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'updateRole', role: newRole }),
      });
      if (res.ok) {
        setActionSuccess(`User role updated to ${newRole}`);
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBan = async (userId: string, isCurrentlyBanned: boolean) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'toggleBan' }),
      });
      if (res.ok) {
        setActionSuccess(`User account ${isCurrentlyBanned ? 'unbanned' : 'banned'} successfully`);
        loadDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (u: UserItem) => {
    setEditingUser(u);
    setEditUsername(u.username);
    setEditAvatar(u.avatar || '');
    setEditBio(u.bio || '');
    setEditRole(u.role);
    setEditReputation(u.reputation);
    setEditIsBanned(!!u.isBanned);
    setEditWebsite(u.website || '');
    setEditLocation(u.location || '');
    setEditGithub(u.github || '');
    setEditTwitter(u.twitter || '');
    setAdminUploadFile(null);
    setAdminUploadPreview(null);
  };

  const handleAdminFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setActionError('Avatar image must be smaller than 5MB.');
        return;
      }
      setAdminUploadFile(file);
      setAdminUploadPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveUserSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSavingUser(true);
    setActionError('');
    setActionSuccess('');

    try {
      let finalAvatar = editAvatar.trim();

      // If an avatar file was selected in admin modal, upload it first on behalf of this user
      if (adminUploadFile) {
        const formData = new FormData();
        formData.append('avatar', adminUploadFile);
        formData.append('userId', editingUser.id);

        const upRes = await fetch('/api/users/avatar/upload', {
          method: 'POST',
          body: formData,
        });
        const upData = await upRes.json();
        if (!upRes.ok) {
          throw new Error(upData.error || 'Failed to upload user avatar');
        }
        finalAvatar = upData.avatarUrl;
      }

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          action: 'updateUserSettings',
          username: editUsername,
          avatar: finalAvatar,
          bio: editBio,
          role: editRole,
          reputation: editReputation,
          isBanned: editIsBanned,
          website: editWebsite,
          location: editLocation,
          github: editGithub,
          twitter: editTwitter,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update user');

      setActionSuccess(`User settings for "${editUsername}" saved successfully!`);
      setEditingUser(null);
      loadDashboardData();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSavingUser(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Verifying administrator credentials...</p>
      </div>
    );
  }

  if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'MODERATOR')) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-[#111728] border border-amber-500/30 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Owner / Admin Access Restricted</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          You need an Administrator account to view the EyeDea management console.
        </p>
        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
          >
            Log In as Owner / Admin
          </Link>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUserQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-[#151c2e] to-[#0f1422] border border-amber-500/30 p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Owner Console
            </span>
            <span className="text-xs text-slate-400">Welcome, @{currentUser.username}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            EyeDea Administration
          </h1>
          <p className="text-xs text-slate-400">Manage categories, subforum boards, community members, user settings, avatars, and broadcasts.</p>
        </div>

        {/* Database Live Status Badge */}
        <div className="flex items-center gap-2 bg-[#121829] px-3 py-2 rounded-xl border border-[#232f4a] shrink-0 text-xs">
          <Database className={`w-4 h-4 ${stats?.isDatabaseConnected ? 'text-emerald-400' : 'text-cyan-400'}`} />
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Storage Engine</span>
            <span className="text-xs font-bold text-slate-200">
              {stats?.isDatabaseConnected ? 'PostgreSQL (Active)' : 'Memory / Fallback Store'}
            </span>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      {actionSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1f293e] pb-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Overview
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <FolderPlus className="w-3.5 h-3.5" />
          Categories & Boards
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Users & Roles ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-2 rounded-lg flex items-center gap-1.5 transition whitespace-nowrap ${
            activeTab === 'announcements'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Megaphone className="w-3.5 h-3.5" />
          Site Announcements
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl bg-[#111728] border border-[#1f293e] p-5 shadow">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Members</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-black text-white">{stats?.users || 0}</div>
              <span className="text-[11px] text-slate-500">Registered creators & thinkers</span>
            </div>

            <div className="rounded-xl bg-[#111728] border border-[#1f293e] p-5 shadow">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Discussions</span>
                <FileText className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-black text-white">{stats?.threads || 0}</div>
              <span className="text-[11px] text-slate-500">Threads across all boards</span>
            </div>

            <div className="rounded-xl bg-[#111728] border border-[#1f293e] p-5 shadow">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Replies</span>
                <MessageSquare className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white">{stats?.posts || 0}</div>
              <span className="text-[11px] text-slate-500">Multi-paragraph community posts</span>
            </div>

            <div className="rounded-xl bg-[#111728] border border-[#1f293e] p-5 shadow">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Reports</span>
                <AlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-black text-white">{stats?.pendingReports || 0}</div>
              <span className="text-[11px] text-emerald-400">All discussions healthy</span>
            </div>
          </div>

          {/* Quick Info / Postgres Connection guide */}
          <div className="rounded-xl bg-[#111728] border border-[#1f293e] p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-400" />
              PostgreSQL & Supabase Integration Status
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your forum is fully wired with <strong>Prisma ORM</strong> and PostgreSQL schema definitions in <code className="text-indigo-300 bg-[#161f33] px-1 py-0.5 rounded">prisma/schema.prisma</code>.
            </p>
            <div className="bg-[#0c101d] p-3 rounded-lg border border-[#1e273d] text-xs font-mono text-slate-300 space-y-1">
              <div># To point to your Supabase or local PostgreSQL instance, update .env:</div>
              <div className="text-amber-300">DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"</div>
              <div># Then run the synchronization command in terminal:</div>
              <div className="text-emerald-400">npx prisma db push</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES & BOARDS */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Category Form */}
          <div className="rounded-xl bg-[#111728] border border-[#1f293e] p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-indigo-400" />
              Create New Category
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. AI & Emerging Tech"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-[#0d1220] border border-[#232f4a] rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of what belongs in this category..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full bg-[#0d1220] border border-[#232f4a] rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
              >
                Add Category
              </button>
            </form>
          </div>

          {/* Add Board to Category Form */}
          <div className="rounded-xl bg-[#111728] border border-[#1f293e] p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-amber-400" />
              Add Subforum Board
            </h3>
            <form onSubmit={handleCreateForum} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Parent Category</label>
                <select
                  value={targetCatId}
                  onChange={(e) => setTargetCatId(e.target.value)}
                  className="w-full bg-[#0d1220] border border-[#232f4a] rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Board Name</label>
                <input
                  type="text"
                  placeholder="e.g. Open Source Collaboration"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full bg-[#0d1220] border border-[#232f4a] rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Board Description</label>
                <textarea
                  rows={2}
                  placeholder="What should members post in this board?"
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  className="w-full bg-[#0d1220] border border-[#232f4a] rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow transition"
              >
                Create Subforum Board
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: USERS & ROLES */}
      {activeTab === 'users' && (
        <div className="rounded-xl bg-[#111728] border border-[#1f293e] shadow-lg overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Member Roster & User Settings
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage profile pictures, roles, reputations, settings, and ban statuses for all members.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search username or email..."
                value={searchUserQuery}
                onChange={(e) => setSearchUserQuery(e.target.value)}
                className="w-full bg-[#0d1220] border border-[#232f4a] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#151c30] text-[11px] uppercase tracking-wider text-slate-400 font-semibold border-b border-[#212d46]">
                <tr>
                  <th className="py-3 px-3">Member</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Reputation</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1b243a]">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#141b2f] transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-500/40 overflow-hidden shrink-0">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-white bg-indigo-700">
                              {u.username[0]?.toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
                            <span>{u.username}</span>
                            {u.isBanned && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                BANNED
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="py-3 px-3 font-bold text-indigo-300">
                      {u.reputation} pts
                    </td>
                    <td className="py-3 px-3">
                      {u.isBanned ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/40">
                          <Ban className="w-3 h-3 text-rose-400" /> Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                          <Check className="w-3 h-3 text-emerald-400" /> Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
                          title="Edit User Settings & Avatar"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          <span>Settings</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleBan(u.id, !!u.isBanned)}
                          className={`p-1.5 rounded-lg text-xs font-medium border transition ${
                            u.isBanned
                              ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}
                          title={u.isBanned ? 'Unban Member' : 'Ban Member'}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SITE ANNOUNCEMENTS */}
      {activeTab === 'announcements' && (
        <div className="max-w-2xl mx-auto rounded-xl bg-[#111728] border border-[#1f293e] p-6 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-indigo-400" />
            Broadcast Site-Wide Announcement
          </h3>
          <p className="text-xs text-slate-400">
            This banner will appear prominently at the top of the forum index for all visitors.
          </p>

          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Announcement Title</label>
              <input
                type="text"
                placeholder="e.g. 🚀 Welcome to EyeDea Launch Week!"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full bg-[#0d1220] border border-[#232f4a] rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
              <select
                value={annPriority}
                onChange={(e) => setAnnPriority(e.target.value as any)}
                className="w-full bg-[#0d1220] border border-[#232f4a] rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="INFO">Informational (Blue/Indigo)</option>
                <option value="WARNING">Important Notice (Amber)</option>
                <option value="CRITICAL">Critical Alert (Rose)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Message Body</label>
              <textarea
                rows={4}
                placeholder="Write the announcement body..."
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                className="w-full bg-[#0d1220] border border-[#232f4a] rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition"
            >
              Broadcast to Site
            </button>
          </form>
        </div>
      )}

      {/* ADMIN EDIT USER SETTINGS MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-[#111728] border border-[#253352] rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2c47]">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-extrabold text-white">
                  User Settings: <span className="text-indigo-400">@{editingUser.username}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserSettings} className="space-y-4">
              {/* Avatar Section */}
              <div className="p-4 rounded-xl bg-[#141b2f] border border-[#232e4d] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-indigo-400" /> Profile Picture & Avatar
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = Math.random().toString(36).substring(2, 8);
                      setEditAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${rand}`);
                      setAdminUploadFile(null);
                      setAdminUploadPreview(null);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <Shuffle className="w-3 h-3" /> Roll Random
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-indigo-950/80 border-2 border-indigo-500/50 overflow-hidden shrink-0">
                    {adminUploadPreview ? (
                      <img src={adminUploadPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : editAvatar ? (
                      <img src={editAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-lg text-white bg-indigo-700">
                        {editUsername[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => adminFileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        {adminUploadFile ? 'Replace Selected Image' : 'Upload Image File'}
                      </button>

                      {editAvatar && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditAvatar('');
                            setAdminUploadFile(null);
                            setAdminUploadPreview(null);
                          }}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                          title="Remove Avatar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <input
                      ref={adminFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAdminFileSelect}
                    />

                    <input
                      type="text"
                      placeholder="Or enter Avatar Image URL..."
                      value={editAvatar}
                      onChange={(e) => {
                        setEditAvatar(e.target.value);
                        setAdminUploadFile(null);
                        setAdminUploadPreview(null);
                      }}
                      className="w-full bg-[#0d1220] border border-[#232f4a] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Username & Role Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    required
                    minLength={3}
                    maxLength={25}
                    className="w-full bg-[#0d1220] border border-[#232f4a] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Privilege Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as any)}
                    className="w-full bg-[#0d1220] border border-[#232f4a] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="USER">USER (Standard Member)</option>
                    <option value="MODERATOR">MODERATOR (Community Mod)</option>
                    <option value="ADMIN">ADMIN (Platform Administrator)</option>
                  </select>
                </div>
              </div>

              {/* Reputation & Ban Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reputation Score</label>
                  <input
                    type="number"
                    value={editReputation}
                    onChange={(e) => setEditReputation(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-[#0d1220] border border-[#232f4a] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Account Ban Status</label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-[#0d1220] border border-[#232f4a] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsBanned}
                      onChange={(e) => setEditIsBanned(e.target.checked)}
                      className="rounded border-slate-700 text-rose-600 focus:ring-rose-500 bg-slate-800"
                    />
                    <span className={`text-xs font-bold ${editIsBanned ? 'text-rose-400' : 'text-slate-300'}`}>
                      {editIsBanned ? 'Account Banned' : 'Account Active (Allowed)'}
                    </span>
                  </label>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Bio / Statement</label>
                <textarea
                  rows={2}
                  maxLength={300}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="User bio..."
                  className="w-full bg-[#0d1220] border border-[#232f4a] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Location & Website */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="e.g. Quezon City, PH"
                    className="w-full bg-[#0d1220] border border-[#232f4a] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Website</label>
                  <input
                    type="url"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#0d1220] border border-[#232f4a] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-[#1f2c47] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isSavingUser ? 'Saving Settings...' : 'Save User Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
