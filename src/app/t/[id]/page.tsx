'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Home,
  ChevronRight,
  Pin,
  Lock,
  MessageSquare,
  ThumbsUp,
  Share2,
  Quote,
  Shield,
  Trash2,
  Sparkles,
  Calendar,
  Send,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { RoleBadge, ReputationBadge } from '@/components/Badge';

interface Author {
  id: string;
  username: string;
  avatar?: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  reputation?: number;
  createdAt?: string;
}

interface Post {
  id: string;
  threadId: string;
  authorId: string;
  content: string;
  isFirstPost: boolean;
  upvotes: number;
  createdAt: string;
  author: Author;
  votes?: { userId: string }[];
}

interface ThreadData {
  id: string;
  forumId: string;
  title: string;
  slug: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  createdAt: string;
  forum: {
    id: string;
    name: string;
    slug: string;
    category?: {
      name: string;
    };
  };
  author: Author;
  posts: Post[];
}

interface CurrentUser {
  id: string;
  username: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
}

function formatDate(dateInput: string) {
  try {
    return new Date(dateInput).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateInput;
  }
}

export default function ThreadViewPage() {
  const params = useParams();
  const router = useRouter();
  const threadId = params.id as string;

  const [thread, setThread] = useState<ThreadData | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [votedPosts, setVotedPosts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchThread();
    fetchCurrentUser();
  }, [threadId]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) setCurrentUser(data.user);
    } catch {
      // not logged in
    }
  };

  const fetchThread = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/threads/${threadId}`);
      if (!res.ok) throw new Error('Thread not found');
      const data = await res.json();
      setThread(data.thread);

      // Check votes
      const votesMap: Record<string, boolean> = {};
      data.thread.posts.forEach((p: Post) => {
        if (p.votes && p.votes.length > 0) {
          votesMap[p.id] = true;
        }
      });
      setVotedPosts(votesMap);
    } catch (err: any) {
      setError(err.message || 'Failed to load thread');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (postId: string) => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`/api/posts/${postId}/vote`, { method: 'POST' });
      const data = await res.json();
      if (data.success && thread) {
        setVotedPosts((prev) => ({ ...prev, [postId]: data.userVoted }));
        setThread({
          ...thread,
          posts: thread.posts.map((p) =>
            p.id === postId ? { ...p, upvotes: data.upvotes } : p
          ),
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuote = (authorName: string, text: string) => {
    const quoteText = `> **@${authorName} wrote:**\n> ${text.replace(/\n/g, '\n> ')}\n\n`;
    setReplyContent((prev) => prev + quoteText);
    const replyArea = document.getElementById('reply-textarea');
    if (replyArea) replyArea.focus();
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    if (!currentUser) {
      router.push('/login');
      return;
    }

    setIsSubmittingReply(true);
    const targetId = thread?.id || threadId;
    try {
      const res = await fetch(`/api/threads/${targetId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to submit reply');
        return;
      }

      setReplyContent('');
      await fetchThread();
    } catch (err) {
      console.error(err);
      alert('Error submitting reply');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Moderation Handlers
  const handleTogglePin = async () => {
    if (!confirm('Toggle pinned status for this thread?')) return;
    const targetId = thread?.id || threadId;
    try {
      const res = await fetch(`/api/threads/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'togglePin' }),
      });
      if (res.ok) fetchThread();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLock = async () => {
    if (!confirm('Toggle lock status for this thread?')) return;
    const targetId = thread?.id || threadId;
    try {
      const res = await fetch(`/api/threads/${targetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleLock' }),
      });
      if (res.ok) fetchThread();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteThread = async () => {
    if (!confirm('Are you sure you want to delete this thread? This action cannot be undone.')) return;
    const targetId = thread?.id || threadId;
    try {
      const res = await fetch(`/api/threads/${targetId}`, { method: 'DELETE' });
      if (res.ok) {
        router.push(thread ? `/f/${thread.forum.slug}` : '/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading discussion...</p>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-white">Thread Not Found</h2>
        <p className="text-xs text-slate-400">The discussion you are looking for does not exist or has been removed.</p>
        <Link href="/" className="inline-block px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold">
          Return to Forum Index
        </Link>
      </div>
    );
  }

  const isStaff = currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR');
  const isAuthor = currentUser && currentUser.id === thread.author.id;

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
        <Link href="/" className="hover:text-slate-200 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-400">{thread.forum.category?.name || 'Category'}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <Link href={`/f/${thread.forum.slug}`} className="hover:text-indigo-300 text-slate-300">
          {thread.forum.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-indigo-400 font-semibold truncate max-w-xs">{thread.title}</span>
      </nav>

      {/* Thread Title Bar & Moderation Toolbar */}
      <div className="rounded-xl bg-[#121727] border border-[#212b43] p-5 shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {thread.isPinned && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Pin className="w-3 h-3 rotate-45 text-amber-400" /> PINNED
                </span>
              )}
              {thread.isLocked && (
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-rose-400" /> LOCKED
                </span>
              )}
              <span className="text-xs text-slate-400">In board:</span>
              <Link
                href={`/f/${thread.forum.slug}`}
                className="text-xs font-semibold text-indigo-400 hover:underline"
              >
                {thread.forum.name}
              </Link>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {thread.title}
            </h1>
          </div>

          {/* Quick Staff Moderation Buttons */}
          {(isStaff || isAuthor) && (
            <div className="flex items-center gap-2 shrink-0 p-1.5 rounded-lg bg-[#182136] border border-[#263454]">
              {isStaff && (
                <>
                  <button
                    onClick={handleTogglePin}
                    title={thread.isPinned ? 'Unpin thread' : 'Pin thread'}
                    className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                      thread.isPinned
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5" />
                    {thread.isPinned ? 'Pinned' : 'Pin'}
                  </button>

                  <button
                    onClick={handleToggleLock}
                    title={thread.isLocked ? 'Unlock thread' : 'Lock thread'}
                    className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                      thread.isLocked
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {thread.isLocked ? 'Locked' : 'Lock'}
                  </button>
                </>
              )}

              <button
                onClick={handleDeleteThread}
                title="Delete thread"
                className="px-2.5 py-1 rounded text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Classic Bulletin Board Posts List */}
      <div className="space-y-4">
        {thread.posts.map((post, index) => {
          const isUserVoted = !!votedPosts[post.id];

          return (
            <div
              key={post.id}
              id={`post-${post.id}`}
              className="rounded-xl overflow-hidden bg-[#101525] border border-[#1f293e] shadow-md flex flex-col md:flex-row"
            >
              {/* Left Column: Author Card */}
              <div className="w-full md:w-52 bg-[#0d1220] p-4 border-b md:border-b-0 md:border-r border-[#1a2338] flex flex-row md:flex-col items-center md:items-start gap-3 shrink-0">
                <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-500/30 overflow-hidden flex items-center justify-center text-base font-bold text-white shadow-inner shrink-0">
                  {post.author.avatar ? (
                    <img src={post.author.avatar} alt={post.author.username} className="w-full h-full object-cover" />
                  ) : (
                    post.author.username[0].toUpperCase()
                  )}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="font-bold text-sm text-slate-100 truncate">{post.author.username}</div>
                  <RoleBadge role={post.author.role} />
                  <div className="pt-1">
                    <ReputationBadge reputation={post.author.reputation || 10} />
                  </div>
                  <div className="hidden md:flex items-center gap-1 text-[10px] text-slate-500 pt-1">
                    <Calendar className="w-3 h-3" />
                    <span>Member since 2026</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Message Content & Action Bar */}
              <div className="flex-1 flex flex-col justify-between p-4 sm:p-5 min-w-0">
                {/* Post Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-[#182136] text-[11px] text-slate-400 mb-4">
                  <span className="font-mono text-slate-500">#{index + 1}</span>
                  <div className="flex items-center gap-2">
                    <span>{formatDate(post.createdAt)}</span>
                    {post.isFirstPost && (
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase tracking-wider text-[9px] border border-indigo-500/30">
                        Original Post
                      </span>
                    )}
                  </div>
                </div>

                {/* Message Body */}
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed space-y-3 whitespace-pre-line break-words flex-1">
                  {post.content}
                </div>

                {/* Post Footer Actions */}
                <div className="pt-4 mt-4 border-t border-[#182136] flex items-center justify-between text-xs">
                  {/* Upvote Button */}
                  <button
                    onClick={() => handleVote(post.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                      isUserVoted
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'bg-[#182137] text-slate-300 hover:text-white hover:bg-slate-800 border border-[#232f4c]'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isUserVoted ? 'fill-current' : ''}`} />
                    <span>{post.upvotes} {post.upvotes === 1 ? 'Vote' : 'Votes'}</span>
                  </button>

                  {/* Quote Reply CTA */}
                  <button
                    onClick={() => handleQuote(post.author.username, post.content)}
                    className="inline-flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition"
                  >
                    <Quote className="w-3.5 h-3.5" />
                    <span>Quote</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Box */}
      <div className="rounded-xl bg-[#101525] border border-[#1f293e] p-5 shadow-lg">
        {thread.isLocked ? (
          <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>This thread has been locked by moderators. Replies are closed.</span>
          </div>
        ) : !currentUser ? (
          <div className="text-center py-6 space-y-3">
            <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-200">Join the discussion</h3>
            <p className="text-xs text-slate-400">You must be logged in to share your thoughts or critique this idea.</p>
            <div className="flex items-center justify-center gap-3 pt-1">
              <Link href="/login" className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold">
                Log In
              </Link>
              <Link href="/signup" className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold">
                Create Account
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReplySubmit} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                Write a Reply
              </h3>
              <span className="text-[11px] text-slate-500">Replying as @{currentUser.username}</span>
            </div>

            <textarea
              id="reply-textarea"
              rows={4}
              placeholder="Share your perspective, constructive critique, technical advice, or collaboration proposal..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full bg-[#0d1220] border border-[#212c44] rounded-lg p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              required
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500">Markdown formatting supported</span>
              <button
                type="submit"
                disabled={isSubmittingReply || !replyContent.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition transform active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                {isSubmittingReply ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
