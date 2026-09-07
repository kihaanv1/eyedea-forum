'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Lightbulb,
  PlusCircle,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  Search,
  Users,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { RoleBadge } from './Badge';

interface UserData {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  avatar?: string;
  reputation: number;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await res.json();
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch user on every route change
  useEffect(() => {
    fetchUser();
  }, [pathname]);

  // Listen to cross-component auth change notifications
  useEffect(() => {
    const onAuthChange = () => fetchUser();
    window.addEventListener('auth-change', onAuthChange);
    return () => window.removeEventListener('auth-change', onAuthChange);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.dispatchEvent(new Event('auth-change'));
      window.location.href = '/';
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0c101c]/90 backdrop-blur-md border-b border-[#1c2438]">
      {/* Top micro bar with site notice */}
      <div className="bg-[#111728] border-b border-[#1b2337] px-4 py-1 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>EyeDea • A high-signal discussion forum for ideas, tech & innovation</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <Link href="/guidelines" className="hover:text-slate-200 transition">Rules & Guidelines</Link>
          <span className="text-slate-600">|</span>
          <Link href="/members" className="hover:text-slate-200 transition">Community Directory</Link>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-200 overflow-hidden border border-indigo-500/40">
              <img src="/witness.png" alt="EyeDea Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white group-hover:text-indigo-300 transition">
                  EyeDea
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-semibold tracking-wider">
                  PH
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">Think • Share • Build</p>
            </div>
          </Link>

          {/* Quick Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Search ideas, discussions, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#131929] border border-[#232d44] focus:border-indigo-500 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </form>
          </div>

          {/* Right Actions & Auth */}
          <div className="hidden sm:flex items-center gap-3">
            {/* New Thread CTA */}
            <Link
              href="/new-thread"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Post Idea
            </Link>

            {/* Admin button if admin/mod */}
            {user && (user.role === 'ADMIN' || user.role === 'MODERATOR') && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 text-xs font-semibold transition"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Admin Panel
              </Link>
            )}

            {/* User Profile / Auth buttons */}
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-slate-800 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-[#222c44]">
                <div className="flex items-center gap-2 text-left">
                  <div className="w-8 h-8 rounded-full bg-indigo-900 border border-indigo-500/40 overflow-hidden flex items-center justify-center text-xs font-bold text-white">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      user.username[0].toUpperCase()
                    )}
                  </div>
                  <div className="hidden lg:block">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200">{user.username}</span>
                      <RoleBadge role={user.role} />
                    </div>
                    <span className="text-[10px] text-indigo-400 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> {user.reputation} rep
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-[#222c44]">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center gap-2">
            <Link
              href="/new-thread"
              className="p-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="sm:hidden bg-[#101627] border-b border-[#1f283e] px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#161d31] border border-[#26324e] rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </form>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1b2336]">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded bg-slate-800/40 text-xs text-slate-300"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Forums
            </Link>
            <Link
              href="/members"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 p-2 rounded bg-slate-800/40 text-xs text-slate-300"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              Members
            </Link>
          </div>

          {user ? (
            <div className="pt-2 border-t border-[#1b2336] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">{user.username}</span>
                  <RoleBadge role={user.role} />
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-400 flex items-center gap-1 hover:underline"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>

              {user.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center py-2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold"
                >
                  Go to Admin Panel
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1b2336]">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-2 rounded bg-slate-800 text-xs font-medium text-slate-300"
              >
                Log In
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-center py-2 rounded bg-indigo-600 text-xs font-semibold text-white"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
