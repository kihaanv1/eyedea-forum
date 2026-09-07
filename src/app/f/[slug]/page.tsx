import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getForumBySlug } from '@/lib/store';
import { RoleBadge } from '@/components/Badge';
import {
  Pin,
  Lock,
  MessageSquare,
  Eye,
  PlusCircle,
  ChevronRight,
  Home,
  MessageCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

function formatRelativeTime(dateInput?: Date | string) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const revalidate = 0;

export default async function ForumBoardPage({ params }: { params: { slug: string } }) {
  const forum = await getForumBySlug(params.slug);

  if (!forum) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-200 flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-400">{forum.category?.name || 'Category'}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-indigo-400 font-semibold">{forum.name}</span>
      </nav>

      {/* Board Header Banner */}
      <div className="rounded-xl bg-gradient-to-r from-[#141a2d] to-[#0f1422] border border-[#212b42] p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{forum.name}</h1>
            {forum.isLocked && (
              <span className="p-1 rounded bg-rose-500/20 text-rose-300 text-xs flex items-center gap-1 border border-rose-500/30">
                <Lock className="w-3 h-3" /> Locked
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">{forum.description}</p>
        </div>

        <div className="shrink-0">
          <Link
            href={`/new-thread?forumId=${forum.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            New Thread
          </Link>
        </div>
      </div>

      {/* Threads Table Container */}
      <div className="rounded-xl overflow-hidden bg-[#101525] border border-[#1f293e] shadow-md">
        {/* Table Header Bar */}
        <div className="forum-header-gradient px-4 py-3 flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
          <div className="flex-1">Discussions & Ideas ({forum.threads.length})</div>
          <div className="hidden sm:flex items-center gap-8 pr-4">
            <span className="w-16 text-center">Replies</span>
            <span className="w-16 text-center">Views</span>
            <span className="w-44 text-right">Latest Activity</span>
          </div>
        </div>

        {/* Thread Rows */}
        {forum.threads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">No discussions posted yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Be the first visionary to share an idea, project, or question in this board.
            </p>
            <Link
              href={`/new-thread?forumId=${forum.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Start First Thread
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#172033]">
            {forum.threads.map((thread) => (
              <div
                key={thread.id}
                className={`p-3.5 sm:p-4 hover:bg-[#141c30] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                  thread.isPinned ? 'bg-indigo-950/20' : ''
                }`}
              >
                {/* Left: Icon, Title, Author info */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-[#182136] text-slate-400 group-hover:text-indigo-400 border border-[#212c45] shrink-0 mt-0.5">
                    {thread.isPinned ? (
                      <Pin className="w-4 h-4 text-amber-400 rotate-45" />
                    ) : thread.isLocked ? (
                      <Lock className="w-4 h-4 text-rose-400" />
                    ) : (
                      <MessageCircle className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {thread.isPinned && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                          Pinned
                        </span>
                      )}
                      <Link
                        href={`/t/${thread.id}`}
                        className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition line-clamp-1"
                      >
                        {thread.title}
                      </Link>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span>Started by</span>
                      <span className="font-semibold text-slate-300">{thread.author.username}</span>
                      <RoleBadge role={thread.author.role} />
                      <span>•</span>
                      <span>{formatRelativeTime(thread.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Stats & Latest Post */}
                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1a2336] text-xs">
                  <div className="hidden sm:flex items-center gap-8 text-center text-slate-300">
                    <span className="w-16 font-semibold">{thread.replyCount}</span>
                    <span className="w-16 font-semibold text-slate-400">{thread.viewCount}</span>
                  </div>

                  <div className="w-44 text-right min-w-0">
                    {thread.latestPost ? (
                      <div>
                        <div className="flex items-center justify-end gap-1.5 text-[11px] text-slate-400">
                          <span>by</span>
                          <span className="text-slate-200 font-semibold">{thread.latestPost.authorUsername}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(thread.latestPost.createdAt)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[11px]">{formatRelativeTime(thread.createdAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
