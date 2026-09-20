'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApiService } from '@/features/settings/services/settings.service';
import { useAuthStore } from '@/store/auth.store';
import { ThemePreference } from '@/types/settings.types';
import {
  User,
  Palette,
  Shield,
  Download,
  Check,
  AlertTriangle,
  Bot,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Australia/Sydney',
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español (Spanish)' },
  { code: 'fr', label: 'Français (French)' },
  { code: 'de', label: 'Deutsch (German)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'ja', label: '日本語 (Japanese)' },
];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'security' | 'privacy'>(
    'profile',
  );

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState<ThemePreference>('dark');
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Account Deletion Dialog State
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Load User Profile
  const { data: user, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const res = await settingsApiService.getProfile();
      return res.data;
    },
  });

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setTimezone(user.timezone || 'UTC');
      setLanguage(user.language || 'en');
      setTheme((user.theme as ThemePreference) || 'dark');
      setHeight(user.height ? String(user.height) : '');
      setWeight(user.weight ? String(user.weight) : '');
      setGender(user.gender || '');
      setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '');
    }
  }, [user]);

  // Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: settingsApiService.updateProfile,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setProfileMessage({ type: 'success', text: 'Profile preferences updated successfully!' });
      setTimeout(() => setProfileMessage(null), 4000);
      if (res.data?.theme) {
        applyTheme(res.data.theme as ThemePreference);
      }
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update profile';
      setProfileMessage({ type: 'error', text: errorMsg });
    },
  });

  // Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: settingsApiService.changePassword,
    onSuccess: () => {
      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMessage(null), 4000);
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to change password';
      setPasswordMessage({ type: 'error', text: errorMsg });
    },
  });

  const applyTheme = (selectedTheme: ThemePreference) => {
    const root = document.documentElement;
    if (selectedTheme === 'dark') {
      root.classList.add('dark');
    } else if (selectedTheme === 'light') {
      root.classList.remove('dark');
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      fullName,
      timezone,
      language,
      theme,
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      gender: gender || undefined,
      dateOfBirth: dateOfBirth || undefined,
    });
  };

  const handleThemeSelect = (selectedTheme: ThemePreference) => {
    setTheme(selectedTheme);
    applyTheme(selectedTheme);
    updateProfileMutation.mutate({ theme: selectedTheme });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordMessage({
        type: 'error',
        text: 'New password must be at least 8 characters long.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const res = await settingsApiService.exportUserData();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifeos-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export user data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;
    try {
      await settingsApiService.deleteAccount();
      clearAuth();
      router.push('/login');
    } catch {
      alert('Failed to delete account. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-border bg-card h-32 animate-pulse rounded-2xl border" />
        <div className="border-border bg-card h-96 animate-pulse rounded-2xl border" />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in space-y-6 duration-300">
      {/* Header Banner */}
      <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-2xl">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-foreground text-2xl font-bold tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Manage your personal profile, appearance theme, security credentials, and data
              privacy.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-border flex gap-2 overflow-x-auto border-b pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'profile'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <User className="h-4 w-4" />
          Profile
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'appearance'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Palette className="h-4 w-4" />
          Appearance
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'security'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Shield className="h-4 w-4" />
          Security
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('privacy')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'privacy'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          <Download className="h-4 w-4" />
          Data & Privacy
        </button>

        <Link
          href="/ai-coach"
          className="text-muted-foreground hover:text-foreground hover:bg-muted ml-auto flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors"
        >
          <Bot className="h-4 w-4 text-emerald-400" />
          AI BYOK Settings
        </Link>
      </div>

      {/* Tab 1: Profile Settings */}
      {activeTab === 'profile' && (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <h2 className="text-foreground text-lg font-bold">Personal Profile</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Update your identity, timezone, and wellness metrics.
          </p>

          {profileMessage && (
            <div
              className={`mt-4 rounded-xl border p-3 text-xs font-semibold ${
                profileMessage.type === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-red-500/30 bg-red-500/10 text-red-400'
              }`}
            >
              {profileMessage.text}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-muted-foreground block text-xs font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-xl border px-3.5 py-2 text-sm transition-colors outline-none"
                />
              </div>

              <div>
                <label className="text-muted-foreground block text-xs font-medium">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="border-border bg-muted/40 text-muted-foreground mt-1.5 w-full cursor-not-allowed rounded-xl border px-3.5 py-2 text-sm outline-none"
                />
                <span className="text-muted-foreground mt-1 block text-[10px]">
                  Verified account email ({user?.authProvider} auth).
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-muted-foreground block text-xs font-medium">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-xl border px-3.5 py-2 text-sm transition-colors outline-none"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-muted-foreground block text-xs font-medium">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-xl border px-3.5 py-2 text-sm transition-colors outline-none"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-border border-t pt-4">
              <h3 className="text-foreground text-sm font-semibold">Physical & Health Profile</h3>
              <p className="text-muted-foreground mt-0.5 text-xs">
                Used for hydration goals and health metrics.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <label className="text-muted-foreground block text-xs font-medium">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="e.g. 175"
                    className="border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-xl border px-3.5 py-2 text-sm transition-colors outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block text-xs font-medium">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g. 70"
                    className="border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-xl border px-3.5 py-2 text-sm transition-colors outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground block text-xs font-medium">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-xl border px-3.5 py-2 text-sm transition-colors outline-none"
                  >
                    <option value="">Prefer not to say</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground block text-xs font-medium">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-xl border px-3.5 py-2 text-sm transition-colors outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-primary text-primary-foreground rounded-xl px-5 py-2 text-xs font-semibold shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? 'Saving Preferences...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Appearance & Themes */}
      {activeTab === 'appearance' && (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <h2 className="text-foreground text-lg font-bold">Theme & Appearance</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Choose your preferred interface theme. Settings persist automatically across devices.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Dark Theme */}
            <div
              onClick={() => handleThemeSelect('dark')}
              className={`border-border hover:border-primary cursor-pointer rounded-2xl border p-5 transition-all ${
                theme === 'dark' ? 'border-primary bg-primary/10 ring-primary/20 ring-2' : 'bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="bg-muted text-foreground flex h-10 w-10 items-center justify-center rounded-xl">
                  <Moon className="h-5 w-5" />
                </div>
                {theme === 'dark' && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <h3 className="text-foreground mt-3 text-sm font-bold">Dark Theme</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Deep black and neutral palette, optimized for focus and low eye strain.
              </p>
            </div>

            {/* Light Theme */}
            <div
              onClick={() => handleThemeSelect('light')}
              className={`border-border hover:border-primary cursor-pointer rounded-2xl border p-5 transition-all ${
                theme === 'light'
                  ? 'border-primary bg-neutral-100/10 ring-2 ring-neutral-500/20'
                  : 'bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <Sun className="h-5 w-5" />
                </div>
                {theme === 'light' && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <h3 className="text-foreground mt-3 text-sm font-bold">Light Theme</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                High-contrast clean surfaces with crisp text for bright environments.
              </p>
            </div>

            {/* System Theme */}
            <div
              onClick={() => handleThemeSelect('system')}
              className={`border-border hover:border-primary cursor-pointer rounded-2xl border p-5 transition-all ${
                theme === 'system'
                  ? 'border-primary bg-indigo-500/10 ring-2 ring-indigo-500/20'
                  : 'bg-card'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Monitor className="h-5 w-5" />
                </div>
                {theme === 'system' && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
              <h3 className="text-foreground mt-3 text-sm font-bold">System Sync</h3>
              <p className="text-muted-foreground mt-1 text-xs">
                Automatically adapts to your operating system theme schedule.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Security & Credentials */}
      {activeTab === 'security' && (
        <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
          <h2 className="text-foreground text-lg font-bold">Security Credentials</h2>
          <p className="text-muted-foreground mt-0.5 text-xs">
            Change your account password and secure access to your data.
          </p>

          {passwordMessage && (
            <div
              className={`mt-4 rounded-xl border p-3 text-xs font-semibold ${
                passwordMessage.type === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  : 'border-red-500/30 bg-red-500/10 text-red-400'
              }`}
            >
              {passwordMessage.text}
            </div>
          )}

          {user?.authProvider !== 'email' ? (
            <div className="border-border bg-muted/20 mt-4 rounded-xl border p-4 text-xs">
              <p className="text-muted-foreground">
                You signed in via{' '}
                <span className="text-foreground font-semibold">{user?.authProvider}</span>.
                Password management is handled by your identity provider.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="mt-6 max-w-md space-y-4">
              <div>
                <label className="text-muted-foreground block text-xs font-medium">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-xl border px-3.5 py-2 text-sm transition-colors outline-none"
                />
              </div>

              <div>
                <label className="text-muted-foreground block text-xs font-medium">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-xl border px-3.5 py-2 text-sm transition-colors outline-none"
                />
              </div>

              <div>
                <label className="text-muted-foreground block text-xs font-medium">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-border bg-background text-foreground focus:border-primary mt-1.5 w-full rounded-xl border px-3.5 py-2 text-sm transition-colors outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="bg-primary text-primary-foreground rounded-xl px-5 py-2 text-xs font-semibold shadow-sm transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {changePasswordMutation.isPending ? 'Updating Password...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 4: Data & Privacy */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          {/* Data Export Card */}
          <div className="border-border bg-card rounded-2xl border p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-foreground text-lg font-bold">Data Portability (FR-023)</h2>
                <p className="text-muted-foreground mt-0.5 max-w-xl text-xs">
                  Export an offline JSON archive containing all your tasks, habits, health logs,
                  journal entries, focus sessions, and achievements.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportData}
                disabled={isExporting}
                className="border-border bg-muted hover:bg-muted/80 text-foreground flex items-center gap-2 self-start rounded-xl border px-4 py-2 text-xs font-semibold shadow-xs transition-all disabled:opacity-50 sm:self-auto"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exporting Archive...' : 'Download JSON Archive'}
              </button>
            </div>
          </div>

          {/* Account Deletion Card */}
          <div className="bg-card rounded-2xl border border-red-500/20 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="grow">
                <h2 className="text-foreground text-lg font-bold">
                  Delete Account & Right to Erasure (FR-025)
                </h2>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  Permanently erase your user profile and all associated data across tasks, habits,
                  health logs, journals, and AI history. This action is irreversible.
                </p>

                {!isDeleting ? (
                  <button
                    type="button"
                    onClick={() => setIsDeleting(true)}
                    className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/20"
                  >
                    Delete Account
                  </button>
                ) : (
                  <div className="border-border bg-muted/20 mt-4 max-w-md space-y-3 rounded-xl border p-4">
                    <p className="text-xs font-semibold text-red-400">
                      Type <span className="text-foreground font-mono font-bold">DELETE</span> to
                      confirm permanent erasure:
                    </p>
                    <input
                      type="text"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="DELETE"
                      className="border-border bg-background text-foreground w-full rounded-xl border px-3.5 py-2 text-sm transition-colors outline-none focus:border-red-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={deleteConfirmation !== 'DELETE'}
                        onClick={handleDeleteAccount}
                        className="rounded-xl bg-red-600 px-4 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Permanently Delete Everything
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDeleting(false);
                          setDeleteConfirmation('');
                        }}
                        className="border-border text-muted-foreground hover:text-foreground rounded-xl border px-4 py-1.5 text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
