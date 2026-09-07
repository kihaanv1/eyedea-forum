import React from 'react';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, XCircle, Lightbulb, ArrowLeft, Heart } from 'lucide-react';

export default function GuidelinesPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Forums
      </Link>

      <div className="rounded-2xl bg-[#101525] border border-[#1f293e] shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#1b2336]">
          <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">Community Code of Conduct</h1>
            <p className="text-xs text-slate-400">Our shared standards for maintaining a premier intellectual discussion space.</p>
          </div>
        </div>

        {/* Section 1: The Core Mission */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            1. Why EyeDea Exists
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            EyeDea was born from the desire to recreate the warmth and depth of classic bulletin board communities, re-focused purely as an intellectual harbor for ideas, startups, code, designs, and innovations. We are committed to maintaining a clean, high-signal, and spam-free sanctuary.
          </p>
        </div>

        {/* Section 2: What We Encourage */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            2. Behaviors We Celebrate
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Constructive Critique:</strong> When reviewing a peer's idea or code, explain <em>why</em> something works or doesn't work and offer actionable alternatives.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Substance over Hot Takes:</strong> Multi-paragraph reasoning, diagrams, links, and code snippets are deeply encouraged.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 font-bold">•</span>
              <span><strong>Generosity with Knowledge:</strong> Help beginner developers and aspiring founders learn and grow.</span>
            </li>
          </ul>
        </div>

        {/* Section 3: Prohibited Content */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
            <XCircle className="w-4 h-4" />
            3. Zero Tolerance Violations
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>Strictly No Adult or Explicit Content:</strong> EyeDea is an idea and tech platform. Any adult media, links, or illicit material results in immediate and permanent account termination.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>No Harassment or Doxxing:</strong> Attack the argument, never the person. Hate speech and threats are not tolerated.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-400 font-bold">•</span>
              <span><strong>No Automated Spam:</strong> Unsolicited affiliate links or repetitive bots will be removed instantly.</span>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-[#1b2336] flex items-center justify-between text-xs text-slate-400">
          <span>Questions or moderation inquiries?</span>
          <Link href="/f/announcements-rules" className="text-indigo-400 hover:underline font-semibold">
            Visit Announcements Board
          </Link>
        </div>
      </div>
    </div>
  );
}
