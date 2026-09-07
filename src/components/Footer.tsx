import React from 'react';
import Link from 'next/link';
import { Lightbulb, Heart, Shield, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#0a0e19] border-t border-[#1a2337] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Lightbulb className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white">EyeDea PH</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              A high-signal discussion bulletin board dedicated to fostering innovative tech ideas, startup validation, developer architecture, design crafts, and intellectual debates. Built for creators and global thinkers.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safe, constructive, strictly clean discussion platform.</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Community</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-indigo-400 transition">Forum Directory</Link>
              </li>
              <li>
                <Link href="/new-thread" className="hover:text-indigo-400 transition">Post a New Idea</Link>
              </li>
              <li>
                <Link href="/members" className="hover:text-indigo-400 transition">Member Directory</Link>
              </li>
              <li>
                <Link href="/guidelines" className="hover:text-indigo-400 transition">Community Code of Conduct</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Tech Stack */}
          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Tech Architecture</h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Next.js 14 (App Router) + React
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Tailwind CSS
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                PostgreSQL + Prisma ORM
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Node.js API Routes & JWT
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-[#161f32] flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} EyeDea PH. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for the Philippine developer and startup ecosystem.
          </p>
        </div>
      </div>
    </footer>
  );
}
