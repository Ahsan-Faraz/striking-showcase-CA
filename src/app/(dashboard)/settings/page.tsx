'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { cn } from '@/lib/utils';

const colorSchemes = [
  { id: 'MAROON', label: 'Maroon', color: '#660033' },
  { id: 'NAVY', label: 'Navy', color: '#1E3A5F' },
  { id: 'EMERALD', label: 'Emerald', color: '#065F46' },
  { id: 'CRIMSON', label: 'Crimson', color: '#991B1B' },
  { id: 'ROYAL', label: 'Royal', color: '#4C1D95' },
  { id: 'SLATE', label: 'Slate', color: '#334155' },
];

const layouts = [
  { id: 'CLASSIC', label: 'Classic', description: 'Classic portfolio layout' },
  { id: 'SPOTLIGHT', label: 'Spotlight', description: 'Hero-focused layout' },
  { id: 'EDITORIAL', label: 'Editorial', description: 'Stats-forward layout' },
];

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState('');
  const [settings, setSettings] = useState({
    colorScheme: 'MAROON',
    portfolioLayout: 'CLASSIC',
    emailNotifications: true,
    profileViewAlerts: true,
    messageAlerts: true,
    watchlistAlerts: true,
  });

  useEffect(() => {
    fetch('/api/athletes/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.athlete) {
          setSettings((prev) => ({
            ...prev,
            colorScheme: data.athlete.colorScheme || 'MAROON',
            portfolioLayout: data.athlete.portfolioLayout || 'CLASSIC',
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    setSaveError('');
    try {
      const res = await fetch('/api/athletes/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          colorScheme: settings.colorScheme,
          portfolioLayout: settings.portfolioLayout,
        }),
      });
      if (res.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        setSaveError(data.error || `Error ${res.status}`);
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setSaveError('Network error');
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <p className="section-label mb-1">Preferences</p>
          <h1 className="font-heading text-4xl font-bold">Settings</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Customize your profile appearance and notifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && <span className="text-sm text-green-400 font-medium">Saved!</span>}
          {saveStatus === 'error' && <span className="text-sm text-red-400 font-medium">Save failed{saveError ? `: ${saveError}` : ''}</span>}
          <Button variant="primary" onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </div>

      {/* Color Scheme */}
      <Card className="animate-in-delay-1">
        <CardHeader>
          <CardTitle>Color Scheme</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Choose a color scheme for your public portfolio page
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {colorSchemes.map((scheme) => (
              <button
                key={scheme.id}
                onClick={() => setSettings({ ...settings, colorScheme: scheme.id })}
                className={cn(
                  'flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-300',
                  settings.colorScheme === scheme.id
                    ? 'border-gold bg-gold/5 ring-2 ring-gold/20 shadow-glow-gold/10'
                    : 'border-[var(--border-primary)] hover:border-gold/30 hover:bg-[var(--bg-card)]'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-full border-2 transition-all duration-300',
                    settings.colorScheme === scheme.id ? 'border-gold scale-110' : 'border-white/10'
                  )}
                  style={{ background: scheme.color }}
                />
                <span className={cn(
                  'text-xs font-mono transition-colors',
                  settings.colorScheme === scheme.id ? 'text-gold font-semibold' : 'text-[var(--text-secondary)]'
                )}>{scheme.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Layout */}
      <Card className="animate-in-delay-2">
        <CardHeader>
          <CardTitle>Portfolio Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Choose how your public portfolio page is displayed
          </p>
          <div className="grid grid-cols-3 gap-3">
            {layouts.map((layout) => (
              <button
                key={layout.id}
                onClick={() => setSettings({ ...settings, portfolioLayout: layout.id })}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all duration-300',
                  settings.portfolioLayout === layout.id
                    ? 'border-gold bg-gold/5 shadow-glow-gold/10'
                    : 'border-[var(--border-primary)] hover:border-gold/30 hover:bg-[var(--bg-card)]'
                )}
              >
                <div className={cn(
                  'w-full h-20 rounded-lg mb-3 flex items-center justify-center border transition-colors',
                  settings.portfolioLayout === layout.id
                    ? 'bg-maroon/10 border-maroon/20'
                    : 'bg-[var(--bg-tertiary)] border-transparent'
                )}>
                  <span className={cn(
                    'text-xs font-mono uppercase tracking-wider',
                    settings.portfolioLayout === layout.id ? 'text-gold' : 'text-[var(--text-tertiary)]'
                  )}>{layout.id}</span>
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{layout.label}</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{layout.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="animate-in-delay-3">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="p-3 rounded-xl hover:bg-[var(--bg-card)] transition-colors">
            <Toggle
              checked={settings.emailNotifications}
              onChange={(v) => setSettings({ ...settings, emailNotifications: v })}
              label="Email Notifications"
              description="Receive email updates about your account"
            />
          </div>
          <div className="p-3 rounded-xl hover:bg-[var(--bg-card)] transition-colors">
            <Toggle
              checked={settings.profileViewAlerts}
              onChange={(v) => setSettings({ ...settings, profileViewAlerts: v })}
              label="Profile View Alerts"
              description="Get notified when a coach views your profile"
            />
          </div>
          <div className="p-3 rounded-xl hover:bg-[var(--bg-card)] transition-colors">
            <Toggle
              checked={settings.messageAlerts}
              onChange={(v) => setSettings({ ...settings, messageAlerts: v })}
              label="Message Alerts"
              description="Get notified when you receive a new message"
            />
          </div>
          <div className="p-3 rounded-xl hover:bg-[var(--bg-card)] transition-colors">
            <Toggle
              checked={settings.watchlistAlerts}
              onChange={(v) => setSettings({ ...settings, watchlistAlerts: v })}
              label="Watchlist Alerts"
              description="Get notified when a coach adds you to their watchlist"
            />
          </div>
        </CardContent>
      </Card>

      {/* Family Access */}
      <Card className="animate-in-delay-3">
        <CardHeader>
          <CardTitle>Family Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Invite a parent or guardian to view your profile, stats, and recruiting activity. They&apos;ll get their own login with read-only access.
          </p>

          <div className="flex gap-2">
            <input
              className="input flex-1"
              type="email"
              placeholder="Parent/guardian email address"
            />
            <Button variant="primary" size="sm">Invite</Button>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-tertiary)]">No family members invited yet</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                  Invited members can view your dashboard, stats, and messages
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card>
        <CardHeader>
          <CardTitle className="!bg-none !text-red-400">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">Delete Account</p>
              <p className="text-xs text-[var(--text-tertiary)]">
                Permanently delete your account and all data. This cannot be undone.
              </p>
            </div>
            <Button variant="danger" size="sm">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
