'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lightbulb, Lock, User, Mail, FileText, AlertCircle, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
          bio: bio.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create account');
        return;
      }

      if (data.token) localStorage.setItem('eyedea_session_token', data.token);
      if (data.vaultToken) localStorage.setItem('eyedea_vault_token', data.vaultToken);
      if (data.user) localStorage.setItem('eyedea_user_cache', JSON.stringify(data.user));

      window.dispatchEvent(new Event('auth-change'));
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 space-y-6">
      <div className="rounded-2xl bg-[#101525] border border-[#1f293e] shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-white">Join EyeDea</h1>
          <p className="text-xs text-slate-400">Create your individual account and join thousands of thinkers & builders.</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. dev_juan"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#0d1220] border border-[#232f4a] focus:border-indigo-500 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                required
              />
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Email Address <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="juan@example.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0d1220] border border-[#232f4a] focus:border-indigo-500 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                required
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0d1220] border border-[#232f4a] focus:border-indigo-500 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                required
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Bio / Interests (Optional)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Next.js dev building AI tools in Manila"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#0d1220] border border-[#232f4a] focus:border-indigo-500 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              />
              <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform active:scale-95 mt-2"
          >
            {isLoading ? 'Creating Account...' : 'Complete Sign Up'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#182136] text-xs text-slate-400">
          Already a member?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
