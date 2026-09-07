'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  Key,
  Camera,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Shuffle,
  ChevronRight,
  MessageSquare,
  FileText,
  Calendar,
  Upload,
  Trash2,
  Globe,
  MapPin,
  Bell,
  Sliders,
  Check,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react';
import { RoleBadge } from '@/components/Badge';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'MODERATOR' | 'ADMIN';
  avatar?: string;
  bio?: string;
  reputation: number;
  isBanned?: boolean;
  website?: string;
  location?: string;
  github?: string;
  twitter?: string;
  themePreference?: 'dark' | 'midnight' | 'system';
  notifyReplies?: boolean;
  notifyMentions?: boolean;
  showOnlineStatus?: boolean;
  createdAt: string;
  threadCount: number;
  postCount: number;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Builder1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=IdeaMaker',
];

export default function ProfileSettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile');

  // Form states
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [github, setGithub] = useState('');
  const [twitter, setTwitter] = useState('');

  // Preference states
  const [themePreference, setThemePreference] = useState<'dark' | 'midnight' | 'system'>('dark');
  const [notifyReplies, setNotifyReplies] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);

  // File Upload states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/users/profile');
      if (res.status === 401) {
        router.push('/login?redirect=/settings');
        return;
      }
      const data = await res.json();
      if (data.profile) {
        const p = data.profile;
        setProfile(p);
        setUsername(p.username || '');
        setAvatar(p.avatar || '');
        setCustomAvatarUrl(p.avatar || '');
        setBio(p.bio || '');
        setWebsite(p.website || '');
        setLocation(p.location || '');
        setGithub(p.github || '');
        setTwitter(p.twitter || '');
        setThemePreference(p.themePreference || 'dark');
        setNotifyReplies(p.notifyReplies !== false);
        setNotifyMentions(p.notifyMentions !== false);
        setShowOnlineStatus(p.showOnlineStatus !== false);
      }
    } catch {
      setErrorMessage('Failed to load profile details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Avatar file handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setErrorMessage('');
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WebP, GIF, SVG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image file is too large. Max allowed size is 5MB.');
      return;
    }
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFilePreview(objectUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUploadAvatarFile = async () => {
    if (!selectedFile) return;
    setIsUploadingFile(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('avatar', selectedFile);

      const res = await fetch('/api/users/avatar/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to upload avatar image.');
        return;
      }

      setAvatar(data.avatarUrl);
      setCustomAvatarUrl(data.avatarUrl);
      setSelectedFile(null);
      setFilePreview(null);
      setSuccessMessage('Profile photo uploaded and updated successfully!');
      window.dispatchEvent(new Event('auth-change'));

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      setErrorMessage('Network error during avatar upload.');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;
    setErrorMessage('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      const res = await fetch('/api/users/avatar/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to remove avatar.');
        return;
      }

      setAvatar('');
      setCustomAvatarUrl('');
      setSelectedFile(null);
      setFilePreview(null);
      setSuccessMessage('Profile picture removed.');
      window.dispatchEvent(new Event('auth-change'));

      setTimeout(() => setSuccessMessage(''), 4000);
    } catch {
      setErrorMessage('Network error removing avatar.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 9);
    const newAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${randomSeed}`;
    setAvatar(newAvatar);
    setCustomAvatarUrl(newAvatar);
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSelectPreset = (url: string) => {
    setAvatar(url);
    setCustomAvatarUrl(url);
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleCustomAvatarChange = (url: string) => {
    setCustomAvatarUrl(url);
    setAvatar(url.trim());
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsSaving(true);

    try {
      // If user selected a file but didn't click the "Upload File" button yet, upload it first
      let currentAvatar = avatar.trim();
      if (selectedFile) {
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        const upRes = await fetch('/api/users/avatar/upload', {
          method: 'POST',
          body: formData,
        });
        const upData = await upRes.json();
        if (!upRes.ok) {
          setErrorMessage(upData.error || 'Failed to upload photo.');
          setIsSaving(false);
          return;
        }
        currentAvatar = upData.avatarUrl;
        setAvatar(currentAvatar);
        setSelectedFile(null);
        setFilePreview(null);
      }

      const payload: any = {
        username: username.trim(),
        avatar: currentAvatar,
        bio: bio.trim(),
        website: website.trim(),
        location: location.trim(),
        github: github.trim(),
        twitter: twitter.trim(),
        themePreference,
        notifyReplies,
        notifyMentions,
        showOnlineStatus,
      };

      if (activeTab === 'security' && newPassword) {
        if (!currentPassword) {
          setErrorMessage('Please enter your current password.');
          setIsSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          setErrorMessage('New passwords do not match.');
          setIsSaving(false);
          return;
        }
        if (newPassword.length < 6) {
          setErrorMessage('New password must be at least 6 characters long.');
          setIsSaving(false);
          return;
        }
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Failed to update settings.');
        setIsSaving(false);
        return;
      }

      setSuccessMessage('Settings updated successfully!');
      if (data.user) {
        setProfile((prev) => (prev ? { ...prev, ...data.user } : data.user));
      }

      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Dispatch event to refresh Navbar and session across components
      window.dispatchEvent(new Event('auth-change'));

      setTimeout(() => {
        setSuccessMessage('');
      }, 4000);
    } catch {
      setErrorMessage('Network error updating settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading your profile & settings...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-indigo-400 transition">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-200 font-medium">User Settings</span>
      </div>

      {/* Header Banner */}
      <div className="bg-[#111728] border border-[#1e293b] rounded-2xl p-6 mb-8 relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-indigo-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-indigo-950/80 border-2 border-indigo-500/50 overflow-hidden shrink-0 shadow-lg shadow-indigo-600/20">
                {avatar ? (
                  <img src={avatar} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-2xl text-white bg-gradient-to-br from-indigo-600 to-violet-700">
                    {profile.username[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md border border-indigo-400/40 transition"
                title="Change Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-white tracking-tight">{profile.username}</h1>
                <RoleBadge role={profile.role} />
                {profile.isBanned && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    BANNED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">{profile.email}</p>
              {location && (
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {location}
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-4 bg-[#161f36] border border-[#232e4d] rounded-xl px-4 py-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-white">{profile.reputation}</span>
              <span className="text-[11px] text-slate-400">Rep</span>
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-white">{profile.threadCount}</span>
              <span className="text-[11px] text-slate-400">Discussions</span>
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-white">{profile.postCount}</span>
              <span className="text-[11px] text-slate-400">Replies</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1e293b] mb-8 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('profile');
            setErrorMessage('');
            setSuccessMessage('');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          Public Profile & Avatar
        </button>

        <button
          onClick={() => {
            setActiveTab('preferences');
            setErrorMessage('');
            setSuccessMessage('');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Preferences & Privacy
        </button>

        <button
          onClick={() => {
            setActiveTab('security');
            setErrorMessage('');
            setSuccessMessage('');
          }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          Password & Security
        </button>
      </div>

      {/* Alert Banners */}
      {successMessage && (
        <div className="mb-6 flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Settings Content */}
      <form onSubmit={handleProfileSubmit}>
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Profile & Avatar Controls */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Photo / Avatar Manager */}
              <div className="bg-[#111728] border border-[#1e293b] rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Camera className="w-4 h-4 text-indigo-400" /> Profile Picture & Avatar
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Upload a photo from your computer/device, pick a preset, or generate a robot avatar.
                    </p>
                  </div>
                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-medium transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  )}
                </div>

                {/* Direct Upload Drag & Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 mb-5 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-[#263553] bg-[#141b2f]/60 hover:border-indigo-500/60 hover:bg-[#161f36]'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-11 h-11 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        <span className="text-indigo-400 underline decoration-indigo-400/50 underline-offset-2">
                          Click to upload
                        </span>{' '}
                        or drag and drop your photo here
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        PNG, JPG, WebP, GIF or SVG (max. 5MB)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Staged File Pending Upload Box */}
                {selectedFile && filePreview && (
                  <div className="mb-5 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-between gap-4 animate-fadeIn">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-indigo-500/50">
                        <img src={filePreview} alt="Upload preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{selectedFile.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {(selectedFile.size / 1024).toFixed(1)} KB • Ready to apply
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setFilePreview(null);
                        }}
                        className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-400 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUploadAvatarFile();
                        }}
                        disabled={isUploadingFile}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition disabled:opacity-50"
                      >
                        {isUploadingFile ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Save Photo
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Preset Avatars Bar */}
                <div className="pt-4 border-t border-[#1c2438]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-300">Choose from Presets</span>
                    <button
                      type="button"
                      onClick={handleRandomizeAvatar}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium transition"
                    >
                      <Shuffle className="w-3 h-3" /> Roll Random Avatar
                    </button>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 mb-4">
                    {PRESET_AVATARS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(url)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition transform active:scale-95 ${
                          avatar === url
                            ? 'border-indigo-500 ring-2 ring-indigo-500/50 scale-105 shadow-md shadow-indigo-500/20'
                            : 'border-slate-700/60 hover:border-slate-500'
                        }`}
                      >
                        <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                        {avatar === url && (
                          <div className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-indigo-300 bg-slate-900 rounded-full" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom URL Option */}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Or paste an Image URL (Gravatar, Imgur, Discord, etc.)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={customAvatarUrl}
                        onChange={(e) => handleCustomAvatarChange(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full bg-[#161f36] border border-[#24304f] focus:border-indigo-500 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
                      />
                      <ImageIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Identity */}
              <div className="bg-[#111728] border border-[#1e293b] rounded-2xl p-6 space-y-4 shadow-md">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-400" /> Account Identity
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Display Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-semibold">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        minLength={3}
                        maxLength={25}
                        className="w-full bg-[#161f36] border border-[#24304f] focus:border-indigo-500 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Your unique forum handle. Letters, numbers, hyphens, and underscores.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">
                      Account Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full bg-[#13192a] border border-[#1c2438] rounded-xl px-3.5 py-2.5 text-xs text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">Email is tied to login credentials.</p>
                  </div>
                </div>
              </div>

              {/* Bio & Extended Profile Details */}
              <div className="bg-[#111728] border border-[#1e293b] rounded-2xl p-6 space-y-4 shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" /> About You & Socials
                  </h3>
                  <span className="text-[11px] text-slate-500">{bio.length} / 300</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Bio & Personal Statement
                  </label>
                  <textarea
                    rows={3}
                    maxLength={300}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell the community what you're working on, learning, or interested in..."
                    className="w-full bg-[#161f36] border border-[#24304f] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Website / Portfolio
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://mywebsite.com"
                        className="w-full bg-[#161f36] border border-[#24304f] focus:border-indigo-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Metro Manila, Philippines"
                        className="w-full bg-[#161f36] border border-[#24304f] focus:border-indigo-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      GitHub Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-semibold">github.com/</span>
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="yourhandle"
                        className="w-full bg-[#161f36] border border-[#24304f] focus:border-indigo-500 rounded-xl pl-24 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      X (Twitter) Handle
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-xs text-slate-500 font-semibold">@</span>
                      <input
                        type="text"
                        value={twitter}
                        onChange={(e) => setTwitter(e.target.value)}
                        placeholder="twitterhandle"
                        className="w-full bg-[#161f36] border border-[#24304f] focus:border-indigo-500 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving || isUploadingFile}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </div>

            {/* Right Column: Live Forum Author Card Preview */}
            <div className="space-y-6">
              <div className="bg-[#111728] border border-[#1e293b] rounded-2xl p-5 sticky top-24 shadow-xl">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#1c253b]">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Forum Author Card Preview
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400 mb-4">
                  This is how your avatar and info card appear next to your discussions and replies:
                </p>

                {/* Simulated XenForo Forum Author Card */}
                <div className="bg-[#141b2f] border border-[#222e4d] rounded-xl p-5 text-center shadow-lg relative overflow-hidden">
                  <div className="w-20 h-20 rounded-full mx-auto bg-indigo-950 border-2 border-indigo-500/50 overflow-hidden mb-3 shadow-md">
                    {filePreview ? (
                      <img src={filePreview} alt={username} className="w-full h-full object-cover" />
                    ) : avatar ? (
                      <img src={avatar} alt={username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-xl text-white bg-indigo-600">
                        {username[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>

                  <h5 className="font-extrabold text-sm text-white tracking-tight">{username || 'Member'}</h5>
                  <div className="mt-1.5 flex justify-center">
                    <RoleBadge role={profile.role} />
                  </div>

                  {location && (
                    <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      <span>{location}</span>
                    </div>
                  )}

                  {/* Bio preview */}
                  <div className="mt-3 pt-3 border-t border-[#1e2942] text-[11px] text-slate-300 italic min-h-[38px] px-1 line-clamp-3">
                    {bio ? `"${bio}"` : <span className="text-slate-500 not-italic">No bio provided yet.</span>}
                  </div>

                  {/* Links preview */}
                  {(website || github || twitter) && (
                    <div className="mt-3 pt-2.5 border-t border-[#1e2942] flex items-center justify-center gap-3 text-xs text-slate-400">
                      {website && (
                        <a
                          href={website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-indigo-400 flex items-center gap-1 text-[11px]"
                          title="Website"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>Site</span>
                        </a>
                      )}
                      {github && (
                        <a
                          href={`https://github.com/${github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-indigo-400 text-[11px]"
                          title="GitHub"
                        >
                          gh/{github}
                        </a>
                      )}
                      {twitter && (
                        <a
                          href={`https://twitter.com/${twitter}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-indigo-400 text-[11px]"
                          title="Twitter / X"
                        >
                          @{twitter}
                        </a>
                      )}
                    </div>
                  )}

                  {/* Stat pills */}
                  <div className="mt-4 pt-3 border-t border-[#1e2942] grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#18213a] rounded-lg p-2">
                      <span className="text-slate-400 block text-[10px]">Reputation</span>
                      <span className="text-amber-400 font-bold">{profile.reputation}</span>
                    </div>
                    <div className="bg-[#18213a] rounded-lg p-2">
                      <span className="text-slate-400 block text-[10px]">Messages</span>
                      <span className="text-slate-200 font-bold">{profile.postCount}</span>
                    </div>
                  </div>

                  <div className="mt-3 text-[10px] text-slate-500 flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Joined {new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preferences & Privacy Tab */}
        {activeTab === 'preferences' && (
          <div className="max-w-2xl bg-[#111728] border border-[#1e293b] rounded-2xl p-6 space-y-6 shadow-md">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" /> Community Preferences & Privacy
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize how you interact with EyeDea and what details other members see.
              </p>
            </div>

            {/* Theme Preference */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Interface Color Scheme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'dark', title: 'Dark Slate', desc: 'Default forum aesthetic' },
                  { id: 'midnight', title: 'Midnight Navy', desc: 'Deep indigo tones' },
                  { id: 'system', title: 'System Default', desc: 'Sync with device' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setThemePreference(t.id as any)}
                    className={`p-3 rounded-xl border text-left transition ${
                      themePreference === t.id
                        ? 'border-indigo-500 bg-indigo-600/15 ring-1 ring-indigo-500'
                        : 'border-[#232f4c] bg-[#141b2f] hover:border-slate-600'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{t.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Toggles */}
            <div className="pt-4 border-t border-[#1e293b] space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Bell className="w-3.5 h-3.5 text-indigo-400" /> Notifications
              </h4>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-[#141b2f] border border-[#232f4c] cursor-pointer hover:border-slate-600 transition">
                <input
                  type="checkbox"
                  checked={notifyReplies}
                  onChange={(e) => setNotifyReplies(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                />
                <div>
                  <div className="text-xs font-semibold text-white">Thread Replies</div>
                  <div className="text-[11px] text-slate-400">
                    Notify me whenever someone replies to a discussion thread I started.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-[#141b2f] border border-[#232f4c] cursor-pointer hover:border-slate-600 transition">
                <input
                  type="checkbox"
                  checked={notifyMentions}
                  onChange={(e) => setNotifyMentions(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                />
                <div>
                  <div className="text-xs font-semibold text-white">Mentions & Tags</div>
                  <div className="text-[11px] text-slate-400">
                    Notify me whenever someone mentions @{username || profile.username} in a post.
                  </div>
                </div>
              </label>
            </div>

            {/* Privacy Toggles */}
            <div className="pt-4 border-t border-[#1e293b] space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-indigo-400" /> Privacy & Presence
              </h4>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-[#141b2f] border border-[#232f4c] cursor-pointer hover:border-slate-600 transition">
                <input
                  type="checkbox"
                  checked={showOnlineStatus}
                  onChange={(e) => setShowOnlineStatus(e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                />
                <div>
                  <div className="text-xs font-semibold text-white">Show Online Status</div>
                  <div className="text-[11px] text-slate-400">
                    Display an active indicator badge on my avatar and member directory when I'm online.
                  </div>
                </div>
              </label>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-[#1e293b] flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="max-w-xl bg-[#111728] border border-[#1e293b] rounded-2xl p-6 space-y-6 shadow-md">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" /> Change Password
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Keep your EyeDea account secure with a strong password.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full bg-[#161f36] border border-[#24304f] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-[#161f36] border border-[#24304f] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your new password"
                  className="w-full bg-[#161f36] border border-[#24304f] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#1e293b] flex justify-end">
              <button
                type="submit"
                disabled={isSaving || !newPassword}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
              >
                <Key className="w-4 h-4" />
                {isSaving ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
