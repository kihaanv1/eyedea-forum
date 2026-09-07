'use client';

import React, { useState } from 'react';
import { Megaphone, X, ChevronRight, AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'INFO' | 'WARNING' | 'CRITICAL';
}

export default function AnnouncementBanner({ announcements }: { announcements?: Announcement[] }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !announcements || announcements.length === 0) return null;

  const current = announcements[0];

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-950/40 border-rose-600/50 text-rose-200';
      case 'WARNING':
        return 'bg-amber-950/40 border-amber-600/50 text-amber-200';
      default:
        return 'bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border-indigo-500/30 text-slate-200';
    }
  };

  return (
    <div className={`border rounded-xl p-4 shadow-lg backdrop-blur-sm transition ${getPriorityStyle(current.priority)}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0 mt-0.5 border border-indigo-500/30">
            <Megaphone className="w-5 h-5 animate-bounce" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300">
                Official Notice
              </span>
              <h3 className="text-sm font-semibold text-white">{current.title}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              {current.content}
            </p>
            <div className="pt-1">
              <Link
                href="/guidelines"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
              >
                Read community standards <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition shrink-0"
          title="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
