'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatBlock } from '@/components/ui/StatBlock';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArticleManager, Article } from '@/components/ui/ArticleManager';
import Link from 'next/link';

interface CoachDashboardData {
  coach: {
    firstName: string;
    lastName: string;
    school: string;
    division: string;
    conference: string;
    rosterSize: number;
    openSpots: number;
  };
  stats: {
    watchlistCount: number;
    profileViews: number;
    unreadMessages: number;
    athletesContacted: number;
  };
  watchlist: Array<{
    id: string;
    firstName: string;
    lastName: string;
    classYear: number;
    state: string;
    school: string;
    seasonAverage: number;
    highGame: number;
    gpa: number;
    contacted: boolean;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
  }>;
  messages: Array<{
    id: string;
    athleteName: string;
    preview: string;
    time: string;
    unread: boolean;
  }>;
}

export default function CoachDashboardPage() {
  const [data, setData] = useState<CoachDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [watchlistFilter, setWatchlistFilter] = useState<'all' | 'contacted' | 'new'>('all');
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [watchlistRes, messagesRes] = await Promise.all([
          fetch('/api/watchlist'),
          fetch('/api/messages'),
        ]);

        const watchlistData = watchlistRes.ok ? await watchlistRes.json() : { watchlist: [] };
        const messagesData = messagesRes.ok ? await messagesRes.json() : { threads: [] };

        const watchlist = (watchlistData.watchlist || []).map((w: any) => ({
          id: w.athlete?.id || w.athleteId,
          firstName: w.athlete?.firstName || '',
          lastName: w.athlete?.lastName || '',
          classYear: w.athlete?.classYear || 2026,
          state: w.athlete?.state || '',
          school: w.athlete?.school || '',
          seasonAverage: w.athlete?.seasonAverage || 0,
          highGame: w.athlete?.highGame || 0,
          gpa: w.athlete?.gpa || 0,
          contacted: false,
        }));

        const messages = (messagesData.threads || []).slice(0, 5).map((t: any) => ({
          id: t.id,
          athleteName: t.otherParty?.name || t.participantName || 'Athlete',
          preview: typeof t.lastMessage === 'object' ? (t.lastMessage?.content || '') : (t.lastMessage || ''),
          time: t.lastMessageAt ? new Date(t.lastMessageAt).toLocaleDateString() : '',
          unread: (t.unreadCount || 0) > 0,
        }));

        setData({
          coach: {
            firstName: 'Coach',
            lastName: '',
            school: '',
            division: '',
            conference: '',
            rosterSize: 12,
            openSpots: 0,
          },
          stats: {
            watchlistCount: watchlist.length,
            profileViews: 0,
            unreadMessages: messages.filter((m: any) => m.unread).length,
            athletesContacted: 0,
          },
          watchlist,
          recentActivity: [],
          messages,
        });
      } catch {
        setData({
          coach: { firstName: 'Coach', lastName: '', school: '', division: '', conference: '', rosterSize: 12, openSpots: 0 },
          stats: { watchlistCount: 0, profileViews: 0, unreadMessages: 0, athletesContacted: 0 },
          watchlist: [],
          recentActivity: [],
          messages: [],
        });
      }
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  const filteredWatchlist = data.watchlist.filter((a) => {
    if (watchlistFilter === 'contacted') return a.contacted;
    if (watchlistFilter === 'new') return !a.contacted;
    return true;
  });

  const unreadCount = data.messages.filter((m) => m.unread).length;
  const rosterPercent = ((data.coach.rosterSize - data.coach.openSpots) / data.coach.rosterSize) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in">
        <div>
          <p className="section-label mb-1">Coach Dashboard</p>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold">
            Welcome back, <span className="text-gradient-gold">{data.coach.firstName}</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            {data.coach.school} &middot; {data.coach.division} {data.coach.conference}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/coach/demo-coach">
            <Button variant="secondary" size="sm">Preview Program</Button>
          </Link>
          <Link href="/discover">
            <Button variant="primary" size="sm">Discover Athletes</Button>
          </Link>
        </div>
      </div>

      {/* Roster Status Banner */}
      <Card variant="accent" padding="md" className="animate-in-delay-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gold/15 border border-gold/20 flex items-center justify-center shrink-0">
              <span className="font-heading text-lg font-bold text-gold">{data.coach.openSpots}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                {data.coach.openSpots} Roster Spots Available
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                {data.coach.rosterSize - data.coach.openSpots} of {data.coach.rosterSize} spots filled &middot; Fill your roster with top talent
              </p>
            </div>
          </div>
          <Link href="/discover">
            <Button variant="secondary" size="sm">Browse Athletes</Button>
          </Link>
        </div>
        <div className="mt-4 h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-maroon to-gold transition-all duration-1000"
            style={{ width: `${rosterPercent}%` }}
          />
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in-delay-1">
        <Card hoverable className="border-t-2 border-t-gold/40">
          <StatBlock value={data.stats.watchlistCount} label="Watchlist Athletes" trend={{ value: 3, positive: true }} />
        </Card>
        <Card hoverable className="border-t-2 border-t-gold/40">
          <StatBlock value={data.stats.profileViews} label="Program Views" trend={{ value: 12, positive: true }} />
        </Card>
        <Card hoverable className="border-t-2 border-t-maroon/40">
          <Link href="/messages" className="block">
            <StatBlock value={data.stats.unreadMessages} label="Unread Messages" />
          </Link>
        </Card>
        <Card hoverable className="border-t-2 border-t-maroon/40">
          <StatBlock value={data.stats.athletesContacted} label="Athletes Contacted" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in-delay-2">
        {/* Watchlist — 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Watchlist</CardTitle>
              <div className="flex gap-1 p-0.5 rounded-lg bg-[var(--bg-tertiary)]">
                {(['all', 'new', 'contacted'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setWatchlistFilter(filter)}
                    className="px-3 py-1 rounded-md text-xs font-medium transition-all duration-200"
                    style={{
                      background: watchlistFilter === filter ? 'var(--gold)' : 'transparent',
                      color: watchlistFilter === filter ? '#000' : 'var(--text-secondary)',
                    }}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredWatchlist.map((athlete) => (
                  <Link key={athlete.id} href={`/athlete/${athlete.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] hover:border-gold/20 transition-all duration-200 group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-maroon to-maroon-dark flex items-center justify-center shrink-0">
                          <span className="font-heading text-xs font-bold text-gold/80">
                            {athlete.firstName[0]}{athlete.lastName[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-gold transition-colors">
                            {athlete.firstName} {athlete.lastName}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)]">
                            {athlete.school} &middot; &apos;{String(athlete.classYear).slice(2)} &middot; {athlete.state}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-3">
                          <div className="text-center">
                            <p className="font-heading text-sm font-bold text-gold">{athlete.seasonAverage}</p>
                            <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono">AVG</p>
                          </div>
                          <div className="w-px h-6 bg-[var(--border-secondary)]" />
                          <div className="text-center">
                            <p className="font-heading text-sm font-bold text-[var(--text-primary)]">{athlete.highGame}</p>
                            <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono">HG</p>
                          </div>
                          <div className="w-px h-6 bg-[var(--border-secondary)]" />
                          <div className="text-center">
                            <p className="font-heading text-sm font-bold text-[var(--text-primary)]">{athlete.gpa}</p>
                            <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono">GPA</p>
                          </div>
                        </div>
                        {athlete.contacted ? (
                          <Badge variant="verified">Contacted</Badge>
                        ) : (
                          <Badge variant="recruit">New</Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/discover" className="block mt-4">
                <Button variant="secondary" size="sm" className="w-full">View Full Watchlist</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Messages + Activity */}
        <div className="space-y-6">
          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold text-maroon-dark">
                  {unreadCount} new
                </span>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.messages.map((msg) => (
                  <Link key={msg.id} href="/messages">
                    <div
                      className="p-3 rounded-xl cursor-pointer transition-all duration-200 hover:bg-[var(--bg-card)] group"
                      style={{
                        borderLeft: msg.unread ? '2px solid var(--gold)' : '2px solid transparent',
                        background: msg.unread ? 'rgba(201, 168, 76, 0.04)' : 'transparent',
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-gold transition-colors">
                          {msg.athleteName}
                        </p>
                        <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{msg.time}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] truncate">{msg.preview}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/messages" className="block mt-3">
                <Button variant="secondary" size="sm" className="w-full">All Messages</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Athlete Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-maroon/15 border border-maroon/20 flex items-center justify-center shrink-0 mt-0.5">
                      {activity.type === 'STAT_UPDATE' && (
                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                      )}
                      {activity.type === 'VIDEO_UPLOAD' && (
                        <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z" />
                        </svg>
                      )}
                      {activity.type === 'PROFILE_VIEW' && (
                        <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                      {activity.type === 'TOURNAMENT' && (
                        <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.04 6.04 0 01-2.77.853" />
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
      </div>

      {/* Articles */}
      <div className="animate-in-delay-2">
        <ArticleManager articles={articles} onChange={setArticles} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in-delay-3">
        {[
          { label: 'Discover Athletes', href: '/discover', icon: '🔍' },
          { label: 'View Watchlist', href: '/discover', icon: '⭐' },
          { label: 'Messages', href: '/messages', icon: '💬' },
          { label: 'Program Profile', href: '/coach/demo-coach', icon: '🏫' },
        ].map((action) => (
          <Link key={action.label} href={action.href}>
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
