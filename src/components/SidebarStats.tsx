import React from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  FileText,
  Users,
  Activity,
  PlusCircle,
  Sparkles,
  ShieldAlert,
  Award,
} from 'lucide-react';

interface SidebarStatsProps {
  stats: {
    threads: number;
    posts: number;
    users: number;
    online?: number;
  };
}

export default function SidebarStats({ stats }: SidebarStatsProps) {
  // Accurately reflect online count based on active members
  const activeOnline = stats.online ?? (stats.users > 0 ? Math.min(stats.users, 1) : 0);
  return (
    <aside className="space-y-5">
      {/* Action Card */}
      <div className="rounded-xl bg-gradient-to-br from-indigo-950/70 via-[#13192a] to-[#0f1422] border border-indigo-500/30 p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Innovator Lounge</span>
        </div>
        <h3 className="text-base font-bold text-white mb-1.5">Have an idea brewing?</h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Validate concepts, gather technical feedback, or discuss engineering architecture with fellow thinkers.
        </p>
        <Link
          href="/new-thread"
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition transform active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Start a Discussion
        </Link>
      </div>

      {/* Forum Statistics */}
      <div className="rounded-xl bg-[#111728] border border-[#1f293e] p-4 shadow-md">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1b2336] mb-3">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Community Statistics</h4>
        </div>
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-[#151c30] p-3 rounded-lg border border-[#232f4a]">
            <div className="flex items-center justify-center gap-1.5 text-indigo-400 mb-1">
              <FileText className="w-4 h-4" />
              <span className="text-base font-extrabold text-white">{stats.threads}</span>
            </div>
            <span className="text-[11px] text-slate-400">Total Discussions</span>
          </div>

          <div className="bg-[#151c30] p-3 rounded-lg border border-[#232f4a]">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-1">
              <MessageSquare className="w-4 h-4" />
              <span className="text-base font-extrabold text-white">{stats.posts}</span>
            </div>
            <span className="text-[11px] text-slate-400">Total Messages</span>
          </div>

          <div className="bg-[#151c30] p-3 rounded-lg border border-[#232f4a]">
            <div className="flex items-center justify-center gap-1.5 text-cyan-400 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-base font-extrabold text-white">{stats.users}</span>
            </div>
            <span className="text-[11px] text-slate-400">Registered Members</span>
          </div>

          <div className="bg-[#151c30] p-3 rounded-lg border border-[#232f4a]">
            <div className="flex items-center justify-center gap-1.5 text-emerald-400 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="text-base font-extrabold text-white">{activeOnline}</span>
            </div>
            <span className="text-[11px] text-slate-400">Online Now</span>
          </div>
        </div>
      </div>

      {/* Top Contributors Card */}
      <div className="rounded-xl bg-[#111728] border border-[#1f293e] p-4 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-[#1b2336] mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Top Thinkers</h4>
          </div>
          <Link href="/members" className="text-[11px] text-indigo-400 hover:underline">View all</Link>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center border border-amber-500/40">👑</span>
              <span className="font-semibold text-slate-100">kihaan</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">OWNER</span>
            </div>
            <span className="text-[11px] font-bold text-amber-400">1,000 pts</span>
          </div>

          <div className="pt-2 border-t border-[#1a2336] text-[11px] text-slate-400 text-center">
            <span>Share ideas & post constructive replies to climb the community leaderboard!</span>
          </div>
        </div>
      </div>

      {/* Community Rules Notice */}
      <div className="rounded-xl bg-[#101524] border border-[#1d273c] p-4 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
          <ShieldAlert className="w-4 h-4 text-indigo-400" />
          <span>EyeDea Etiquette</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Respectful debate only. No spam, self-promotion without context, or offensive material. Let us build a premier intellectual space together.
        </p>
      </div>
    </aside>
  );
}
