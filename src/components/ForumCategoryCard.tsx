import React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  FileText,
  Rocket,
  Bot,
  TrendingUp,
  Terminal,
  Code2,
  Cpu,
  Briefcase,
  Palette,
  Layout,
  PenTool,
  Coffee,
  Bell,
  Users,
  MessageCircle,
  Folder,
  ChevronRight,
} from 'lucide-react';
import { CategoryWithForums } from '@/lib/store';

// Helper to resolve icon name to Lucide icon component
const iconMap: Record<string, React.ElementType> = {
  Rocket,
  Bot,
  TrendingUp,
  Terminal,
  Code2,
  Cpu,
  Briefcase,
  Palette,
  Layout,
  PenTool,
  Coffee,
  Bell,
  Users,
  MessageCircle,
  MessageSquare,
  Folder,
};

function renderIcon(name?: string, className = 'w-5 h-5') {
  const Component = (name && iconMap[name]) || MessageSquare;
  return <Component className={className} />;
}

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

export default function ForumCategoryCard({ category }: { category: CategoryWithForums }) {
  return (
    <div className="rounded-xl overflow-hidden bg-[#101525] border border-[#1f293e] shadow-md">
      {/* Category Header */}
      <div className="forum-header-gradient px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            {renderIcon(category.icon, 'w-4 h-4')}
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">{category.name}</h2>
            {category.description && (
              <p className="text-[11px] text-slate-400 hidden sm:block">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Subforums Table/List */}
      <div className="divide-y divide-[#182136]">
        {category.forums.map((forum) => (
          <div
            key={forum.id}
            className="p-3 sm:p-4 hover:bg-[#141b2f] transition flex flex-col md:flex-row md:items-center justify-between gap-3 group"
          >
            {/* Forum Info */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2.5 rounded-lg bg-[#182137] text-indigo-400 group-hover:text-indigo-300 group-hover:bg-indigo-950/60 border border-[#232f4b] group-hover:border-indigo-500/40 transition shrink-0 mt-0.5">
                {renderIcon(forum.icon, 'w-5 h-5')}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/f/${forum.slug}`}
                  className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition flex items-center gap-1.5"
                >
                  <span>{forum.name}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-indigo-400" />
                </Link>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {forum.description}
                </p>
              </div>
            </div>

            {/* Counts & Latest Activity */}
            <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#1a2338]/60 text-xs">
              {/* Counts */}
              <div className="flex items-center gap-4 text-center px-2">
                <div>
                  <span className="block font-bold text-slate-200">{forum.threadCount}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-medium">Threads</span>
                </div>
                <div>
                  <span className="block font-bold text-slate-200">{forum.postCount}</span>
                  <span className="text-[10px] text-slate-500 uppercase font-medium">Posts</span>
                </div>
              </div>

              {/* Latest Post preview */}
              <div className="w-48 sm:w-56 text-right min-w-0 pl-2 border-l border-[#1f2940]">
                {forum.latestPost ? (
                  <div>
                    <Link
                      href={`/t/${forum.latestPost.threadId}`}
                      className="text-xs font-semibold text-slate-300 hover:text-indigo-300 transition truncate block"
                      title={forum.latestPost.threadTitle}
                    >
                      {forum.latestPost.threadTitle}
                    </Link>
                    <div className="flex items-center justify-end gap-1.5 text-[11px] text-slate-500 mt-0.5">
                      <span>by</span>
                      <span className="text-slate-300 font-medium">{forum.latestPost.authorUsername}</span>
                      <span>•</span>
                      <span>{formatRelativeTime(forum.latestPost.createdAt)}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-600 italic text-[11px]">No discussions yet</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
