import React from 'react';
import Link from 'next/link';
import { getForumHierarchy, getAnnouncements, getAdminStats } from '@/lib/store';
import ForumCategoryCard from '@/components/ForumCategoryCard';
import SidebarStats from '@/components/SidebarStats';
import AnnouncementBanner from '@/components/AnnouncementBanner';
import { Sparkles, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';

export const revalidate = 0; // Fresh content

export default async function HomePage() {
  const [categories, announcements, stats] = await Promise.all([
    getForumHierarchy(),
    getAnnouncements(),
    getAdminStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Official Announcement Banner */}
      <AnnouncementBanner announcements={announcements} />

      {/* Hero Welcome Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/80 via-[#121829] to-[#0d1220] border border-indigo-500/20 p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Welcome to the New Hub for Filipino Builders & Thinkers
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Ideas that Shape the Future.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Explore discussion boards dedicated to startups, web & mobile software engineering, AI agents, UI/UX crafts, and intellectual community debates.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <Link
              href="/new-thread"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
            >
              <MessageSquare className="w-4 h-4" />
              Start a Discussion
            </Link>
            <Link
              href="/guidelines"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Code of Conduct
            </Link>
          </div>
        </div>
      </div>

      {/* Main Forum Grid & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: Forum Categories */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[#1c2438]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Forum Boards Directory
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              {categories.length} Categories • {categories.reduce((acc, c) => acc + c.forums.length, 0)} Boards
            </span>
          </div>

          {categories.map((category) => (
            <ForumCategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* Right 1 Column: Sidebar Widgets */}
        <div className="lg:col-span-1">
          <SidebarStats
            stats={{
              threads: stats.threads,
              posts: stats.posts,
              users: stats.users,
              online: stats.users > 0 ? 1 : 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
