import React from 'react';
import Link from 'next/link';
import { getAllUsers } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth';
import { RoleBadge, ReputationBadge } from '@/components/Badge';
import { Users, Award, Calendar, ArrowLeft, MapPin, Globe, Settings } from 'lucide-react';

export const revalidate = 0;

export default async function MembersPage() {
  await getCurrentUser();
  const users = await getAllUsers();
  // Sort users by reputation descending
  const sorted = [...users].sort((a, b) => b.reputation - a.reputation);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Forums
        </Link>
        <Link
          href="/settings"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
        >
          <Settings className="w-3.5 h-3.5" /> Edit My Profile & Avatar
        </Link>
      </div>

      <div className="rounded-xl bg-[#111728] border border-[#1f293e] p-6 shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Community Member Directory</h1>
          </div>
          <p className="text-xs text-slate-400">Discover creators, engineers, and founders ranked by intellectual contribution & reputation.</p>
        </div>
        <div className="text-right text-xs">
          <span className="text-lg font-black text-white">{sorted.length}</span>
          <span className="block text-[10px] text-slate-500 uppercase font-semibold">Registered Thinkers</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((u, idx) => (
          <div
            key={u.id}
            className="rounded-xl bg-[#101525] border border-[#1f293e] p-4 shadow-md flex items-start gap-3.5 hover:border-indigo-500/40 transition group"
          >
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-500/30 overflow-hidden flex items-center justify-center font-bold text-white shadow-inner">
                {u.avatar ? (
                  <img src={u.avatar} alt={u.username} className="w-full h-full object-cover" />
                ) : (
                  u.username[0].toUpperCase()
                )}
              </div>
              {idx < 3 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center border-2 border-[#101525] shadow">
                  {idx + 1}
                </span>
              )}
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-sm text-slate-100 group-hover:text-indigo-300 transition truncate">
                  @{u.username}
                </span>
                <ReputationBadge reputation={u.reputation} />
              </div>

              <div>
                <RoleBadge role={u.role} />
              </div>

              {u.bio && (
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed pt-1">
                  {u.bio}
                </p>
              )}

              {(u.location || u.website) && (
                <div className="pt-2 flex items-center gap-3 text-[10px] text-slate-400">
                  {u.location && (
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{u.location}</span>
                    </span>
                  )}
                  {u.website && (
                    <a
                      href={u.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition shrink-0"
                    >
                      <Globe className="w-3 h-3" />
                      <span>Website</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
