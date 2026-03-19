'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatBlock } from '@/components/ui/StatBlock';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface DashboardData {
  profile: {
    firstName: string;
    lastName: string;
    seasonAverage: number | null;
    highGame: number | null;
    highSeries: number | null;
    profileCompletion: number;
  };
  stats: {
    profileViews: number;
    watchlistCount: number;
    unreadMessages: number;
    tournamentsPlayed: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, fetch from API. Using demo data for now.
    setData({
      profile: {
        firstName: 'Autumn',
        lastName: 'Strode',
        seasonAverage: 213.5,
        highGame: 289,
        highSeries: 782,
        profileCompletion: 72,
      },
      stats: {
        profileViews: 47,
        watchlistCount: 8,
        unreadMessages: 3,
        tournamentsPlayed: 12,
      },
      recentActivity: [
        { id: '1', type: 'PROFILE_VIEW', title: 'Profile Viewed', description: 'A coach from Wichita State viewed your profile', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '2', type: 'WATCHLIST_ADD', title: 'Added to Watchlist', description: 'You were added to a coach watchlist', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: '3', type: 'STAT_UPDATE', title: 'Stats Updated', description: 'Season average updated to 213.5', createdAt: new Date(Date.now() - 86400000).toISOString() },
      ],
    });
    setLoading(false);
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in">
        <div>
          <p className="section-label mb-1">Dashboard</p>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold">
            Welcome back, <span className="text-gradient-gold">{data.profile.firstName}</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Here&apos;s what&apos;s happening with your profile
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/athlete/preview">
            <Button variant="secondary" size="sm">Preview Portfolio</Button>
          </Link>
          <Link href="/profile">
            <Button variant="primary" size="sm">Edit Profile</Button>
          </Link>
        </div>
      </div>

      {/* Profile Completion Banner */}
      {data.profile.profileCompletion < 100 && (
        <Card variant="accent" padding="md" className="animate-in-delay-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gold/15 border border-gold/20 flex items-center justify-center shrink-0">
                <span className="font-heading text-lg font-bold text-gold">{data.profile.profileCompletion}%</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">Complete Your Profile</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  A complete profile is 5x more likely to be viewed by coaches
                </p>
              </div>
            </div>
            <Link href="/profile">
              <Button variant="secondary" size="sm">Complete Now</Button>
            </Link>
          </div>
          <div className="mt-4 h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-maroon to-gold transition-all duration-1000"
              style={{ width: `${data.profile.profileCompletion}%` }}
            />
          </div>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in-delay-1">
        <Card hoverable className="border-t-2 border-t-gold/40">
          <StatBlock value={data.stats.profileViews} label="Profile Views" trend={{ value: 12, positive: true }} />
        </Card>
        <Card hoverable className="border-t-2 border-t-gold/40">
          <StatBlock value={data.stats.watchlistCount} label="On Watchlists" trend={{ value: 2, positive: true }} />
        </Card>
        <Card hoverable className="border-t-2 border-t-maroon/40">
          <Link href="/messages" className="block">
            <StatBlock value={data.stats.unreadMessages} label="Unread Messages" />
          </Link>
        </Card>
        <Card hoverable className="border-t-2 border-t-maroon/40">
          <StatBlock value={data.stats.tournamentsPlayed} label="Tournaments" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in-delay-2">
        {/* Quick Stats */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
              <Link href="/profile" className="text-xs text-gold hover:text-gold-light transition-colors hover:underline">
                Update Stats
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-5 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] hover:border-gold/20 transition-colors">
                  <p className="font-heading text-3xl font-bold text-gold">
                    {data.profile.seasonAverage?.toFixed(1) || '--'}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-1 font-mono">Season Avg</p>
                  <Badge variant="verified" className="mt-2">D1 Ready</Badge>
                </div>
                <div className="text-center p-5 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] hover:border-gold/20 transition-colors">
                  <p className="font-heading text-3xl font-bold text-[var(--text-primary)]">
                    {data.profile.highGame || '--'}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-1 font-mono">High Game</p>
                </div>
                <div className="text-center p-5 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] hover:border-gold/20 transition-colors">
                  <p className="font-heading text-3xl font-bold text-[var(--text-primary)]">
                    {data.profile.highSeries || '--'}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-1 font-mono">High Series</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-maroon/15 border border-maroon/20 flex items-center justify-center shrink-0 mt-0.5">
                    {activity.type === 'PROFILE_VIEW' && (
                      <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    {activity.type === 'WATCHLIST_ADD' && (
                      <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                      </svg>
                    )}
                    {activity.type === 'STAT_UPDATE' && (
                      <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">{activity.title}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{activity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in-delay-3">
        {[
          { label: 'Add Tournament', href: '/tournaments', icon: '🏆' },
          { label: 'Upload Media', href: '/media', icon: '📸' },
          { label: 'Update Arsenal', href: '/arsenal', icon: '🎳' },
          { label: 'View Messages', href: '/messages', icon: '💬' },
        ].map((action) => (
          <Link key={action.href} href={action.href}>
            <Card hoverable className="text-center py-8 group border-b-2 border-b-transparent hover:border-b-gold/40">
              <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform duration-300">{action.icon}</span>
              <p className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-gold transition-colors">{action.label}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
