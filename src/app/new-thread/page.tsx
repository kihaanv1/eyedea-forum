'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lightbulb,
  Send,
  ArrowLeft,
  Eye,
  Edit3,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  forums: {
    id: string;
    name: string;
    description: string;
  }[];
}

function NewThreadForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialForumId = searchParams.get('forumId') || '';

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedForumId, setSelectedForumId] = useState(initialForumId);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchForums();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch {
      setIsLoggedIn(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const fetchForums = async () => {
    try {
      const res = await fetch('/api/forums');
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
        if (!selectedForumId && data.categories[0]?.forums[0]) {
          setSelectedForumId(data.categories[0].forums[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !selectedForumId) {
      setError('Please select a forum board and fill in all fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          forumId: selectedForumId,
          title: title.trim(),
          content: content.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create thread');
        return;
      }

      // Redirect to newly created thread
      router.push(`/t/${data.thread.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating thread');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs">
        Checking authentication status...
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-[#111728] border border-[#1f293e] text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
          <Lightbulb className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Authentication Required</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          You must have an EyeDea account to start a discussion thread, validate an idea, or ask for architectural feedback.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Forums
        </Link>
      </div>

      {/* Main Form Card */}
      <div className="rounded-2xl bg-[#101525] border border-[#1f293e] shadow-xl overflow-hidden">
        <div className="forum-header-gradient px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Create New Discussion Thread</h1>
              <p className="text-xs text-slate-400">Share your idea, MVP concept, tech breakdown, or community question.</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Board Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Discussion Board <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedForumId}
              onChange={(e) => setSelectedForumId(e.target.value)}
              className="w-full bg-[#0d1220] border border-[#232f4a] focus:border-indigo-500 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
              required
            >
              {categories.map((cat) => (
                <optgroup key={cat.id} label={cat.name} className="bg-[#101525] text-indigo-300 font-bold">
                  {cat.forums.map((f) => (
                    <option key={f.id} value={f.id} className="bg-[#0d1220] text-slate-200 font-normal">
                      {f.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Thread Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Thread Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Idea Validation: A privacy-first expense tracker for remote PH workers"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0d1220] border border-[#232f4a] focus:border-indigo-500 rounded-lg p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition font-medium"
              required
            />
          </div>

          {/* Editor & Preview Tabs */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Post Content / Pitch <span className="text-rose-400">*</span>
              </label>

              <div className="flex items-center gap-1 bg-[#0c101d] p-0.5 rounded-lg border border-[#1e273d]">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                    activeTab === 'edit'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1 transition ${
                    activeTab === 'preview'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3 h-3" /> Preview
                </button>
              </div>
            </div>

            {activeTab === 'edit' ? (
              <textarea
                rows={10}
                placeholder="Detail your idea, problem statement, proposed solution, target market, or code architecture..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-[#0d1220] border border-[#232f4a] focus:border-indigo-500 rounded-lg p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                required
              />
            ) : (
              <div className="w-full min-h-[240px] bg-[#0d1220] border border-[#232f4a] rounded-lg p-4 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {content ? content : <span className="text-slate-500 italic">Nothing to preview yet.</span>}
              </div>
            )}
          </div>

          {/* Community Guidelines Callout */}
          <div className="rounded-xl bg-[#131929] border border-[#20293f] p-3.5 flex items-start gap-2.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>High-Signal Standard:</strong> Ensure your post introduces a clear idea, context, or technical subject. Keep discussions respectful and adhere to our clean platform policy.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Publishing...' : 'Publish Thread'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewThreadPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-xs text-slate-400">
          Loading discussion form...
        </div>
      }
    >
      <NewThreadForm />
    </Suspense>
  );
}

