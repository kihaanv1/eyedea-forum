import React from 'react';
import { Shield, Crown, User as UserIcon, Sparkles } from 'lucide-react';

interface BadgeProps {
  role?: string;
  reputation?: number;
  className?: string;
  showReputation?: boolean;
}

export function RoleBadge({ role, className = '' }: { role?: string; className?: string }) {
  const normalized = (role || 'USER').toUpperCase();

  if (normalized === 'ADMIN') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm ${className}`}>
        <Crown className="w-3 h-3 text-amber-400" />
        ADMIN / OWNER
      </span>
    );
  }

  if (normalized === 'MODERATOR') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm ${className}`}>
        <Shield className="w-3 h-3 text-emerald-400" />
        MODERATOR
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700/60 ${className}`}>
      <UserIcon className="w-3 h-3 text-slate-400" />
      MEMBER
    </span>
  );
}

export function ReputationBadge({ reputation = 10 }: { reputation?: number }) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-700/40">
      <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
      {reputation} pts
    </span>
  );
}
