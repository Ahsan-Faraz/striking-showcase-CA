'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { StatBlock } from '@/components/ui/StatBlock';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface AdminDashboardData {
  platform: {
    totalUsers: number;
    athletes: number;
    coaches: number;
    parents: number;
    activeSubscriptions: number;
    revenue: number;
    profileViews: number;
    messagesThisWeek: number;
  };
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    subscription: string | null;
    createdAt: string;
  }>;
  reports: Array<{
    id: string;
    type: string;
    reporterName: string;
    reportedName: string;
    description: string;
    status: string;
    createdAt: string;
  }>;
  auditLog: Array<{
    id: string;
    action: string;
    admin: string;
    target: string;
    time: string;
    type: string;
  }>;
}

const roleColors: Record<string, string> = {
  ATHLETE: 'var(--gold)',
  COACH: '#3B82F6',
  PARENT: '#22C55E',
  ADMIN: '#EF4444',
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports'>('overview');

  useEffect(() => {
    setData({
      platform: {
        totalUsers: 1247,
        athletes: 1089,
        coaches: 142,
        parents: 16,
        activeSubscriptions: 312,
        revenue: 4680,
        profileViews: 28430,
        messagesThisWeek: 467,
      },
      users: [
        { id: '1', email: 'sarah.j@email.com', name: 'Sarah Johnson', role: 'ATHLETE', status: 'active', createdAt: 'Jan 15, 2025', subscription: 'MONTHLY' },
        { id: '2', email: 'coach.w@msu.edu', name: 'Coach Williams', role: 'COACH', status: 'active', createdAt: 'Nov 20, 2024', subscription: null },
        { id: '3', email: 'emma.c@email.com', name: 'Emma Chen', role: 'ATHLETE', status: 'active', createdAt: 'Feb 8, 2025', subscription: 'TRIALING' },
        { id: '4', email: 'mark.d@email.com', name: 'Mark Davis', role: 'PARENT', status: 'active', createdAt: 'Mar 1, 2025', subscription: null },
        { id: '5', email: 'maya.w@email.com', name: 'Maya Williams', role: 'ATHLETE', status: 'suspended', createdAt: 'Jan 22, 2025', subscription: 'CANCELED' },
        { id: '6', email: 'coach.r@osu.edu', name: 'Coach Roberts', role: 'COACH', status: 'active', createdAt: 'Dec 5, 2024', subscription: null },
      ],
      reports: [
        { id: '1', type: 'SPAM', reporterName: 'Sarah Johnson', reportedName: 'Unknown User', description: 'Sending unsolicited recruitment messages to multiple athletes', status: 'PENDING', createdAt: 'Mar 14, 2025' },
        { id: '2', type: 'INAPPROPRIATE', reporterName: 'Coach Williams', reportedName: 'Test Account', description: 'Profile contains inappropriate content that violates community guidelines', status: 'PENDING', createdAt: 'Mar 13, 2025' },
        { id: '3', type: 'HARASSMENT', reporterName: 'Emma Chen', reportedName: 'Anonymous', description: 'Repeated unwanted messages after being asked to stop', status: 'REVIEWED', createdAt: 'Mar 10, 2025' },
      ],
      auditLog: [
        { id: '1', action: 'User Suspended', admin: 'Admin', target: 'Maya Williams', time: '2h ago', type: 'danger' },
        { id: '2', action: 'Report Resolved', admin: 'Admin', target: 'Report #45', time: '5h ago', type: 'success' },
        { id: '3', action: 'Coach Verified', admin: 'Admin', target: 'Coach Williams', time: '1d ago', type: 'info' },
        { id: '4', action: 'Subscription Refund', admin: 'Admin', target: 'John Smith', time: '2d ago', type: 'warning' },
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

  const pendingReports = data.reports.filter((r) => r.status === 'PENDING').length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in">
        <div>
          <p className="section-label mb-1">Admin Panel</p>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold">
            Platform <span className="text-gradient-gold">Dashboard</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Manage users, review reports, and monitor platform health
          </p>
        </div>
        {pendingReports > 0 && (
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/15 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            {pendingReports} Pending Reports
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 rounded-xl w-fit bg-[var(--bg-tertiary)] animate-in">
        {(['overview', 'users', 'reports'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: activeTab === tab ? 'var(--gold)' : 'transparent',
              color: activeTab === tab ? '#000' : 'var(--text-secondary)',
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'reports' && pendingReports > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500 text-white">
                {pendingReports}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in-delay-1">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card hoverable className="border-t-2 border-t-gold/40">
              <StatBlock value={data.platform.totalUsers.toLocaleString()} label="Total Users" trend={{ value: 8, positive: true }} />
            </Card>
            <Card hoverable className="border-t-2 border-t-gold/40">
              <StatBlock value={data.platform.athletes.toLocaleString()} label="Athletes" trend={{ value: 5, positive: true }} />
            </Card>
            <Card hoverable className="border-t-2 border-t-maroon/40">
              <StatBlock value={data.platform.coaches} label="Coaches" trend={{ value: 3, positive: true }} />
            </Card>
            <Card hoverable className="border-t-2 border-t-maroon/40">
              <StatBlock value={data.platform.activeSubscriptions} label="Active Subscriptions" trend={{ value: 14, positive: true }} />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in-delay-2">
            {/* Revenue & Engagement — 2/3 */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                  <span className="text-xs text-[var(--text-tertiary)] font-mono">THIS MONTH</span>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-5 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] hover:border-gold/20 transition-colors">
                      <p className="font-heading text-3xl font-bold text-gold">
                        ${data.platform.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-1 font-mono">MRR</p>
                      <Badge variant="verified" className="mt-2">+14%</Badge>
                    </div>
                    <div className="text-center p-5 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] hover:border-gold/20 transition-colors">
                      <p className="font-heading text-3xl font-bold text-[var(--text-primary)]">
                        {data.platform.profileViews.toLocaleString()}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-1 font-mono">Profile Views</p>
                    </div>
                    <div className="text-center p-5 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] hover:border-gold/20 transition-colors">
                      <p className="font-heading text-3xl font-bold text-[var(--text-primary)]">
                        {data.platform.messagesThisWeek}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-1 font-mono">Messages / wk</p>
                    </div>
                  </div>

                  {/* User breakdown */}
                  <div className="mt-6 pt-5 border-t border-[var(--border-secondary)]">
                    <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-mono mb-3">
                      USER BREAKDOWN
                    </p>
                    <div className="space-y-2">
                      {[
                        { label: 'Athletes', count: data.platform.athletes, color: 'var(--gold)', pct: (data.platform.athletes / data.platform.totalUsers * 100) },
                        { label: 'Coaches', count: data.platform.coaches, color: '#3B82F6', pct: (data.platform.coaches / data.platform.totalUsers * 100) },
                        { label: 'Parents', count: data.platform.parents, color: '#22C55E', pct: (data.platform.parents / data.platform.totalUsers * 100) },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-3">
                          <span className="text-xs text-[var(--text-secondary)] w-16 font-mono">{item.label}</span>
                          <div className="flex-1 h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{ width: `${item.pct}%`, background: item.color }}
                            />
                          </div>
                          <span className="text-xs text-[var(--text-primary)] font-mono w-12 text-right">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Audit Log — 1/3 */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.auditLog.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors">
                      <div className="w-9 h-9 rounded-lg bg-maroon/15 border border-maroon/20 flex items-center justify-center shrink-0 mt-0.5">
                        {log.type === 'danger' && (
                          <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        )}
                        {log.type === 'success' && (
                          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {log.type === 'info' && (
                          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                          </svg>
                        )}
                        {log.type === 'warning' && (
                          <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{log.action}</p>
                        <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{log.admin} &rarr; {log.target}</p>
                      </div>
                      <span className="text-[10px] text-[var(--text-tertiary)] font-mono shrink-0">{log.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in-delay-3">
            {[
              { label: 'Manage Users', icon: '👥', action: () => setActiveTab('users') },
              { label: 'Review Reports', icon: '🚩', action: () => setActiveTab('reports') },
              { label: 'Verify Coaches', icon: '✅', action: () => setActiveTab('users') },
              { label: 'View Analytics', icon: '📊', action: () => {} },
            ].map((item) => (
              <button key={item.label} onClick={item.action} className="block w-full">
                <Card hoverable className="text-center py-8 group border-b-2 border-b-transparent hover:border-b-gold/40">
                  <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                  <p className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-gold transition-colors">{item.label}</p>
                </Card>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── USERS TAB ─── */}
      {activeTab === 'users' && (
        <div className="animate-in-delay-1">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <span className="text-xs text-[var(--text-tertiary)] font-mono">{data.users.length} USERS</span>
            </CardHeader>
            <CardContent>
              {/* Column headers */}
              <div className="hidden md:grid grid-cols-6 gap-4 px-4 py-2 mb-2">
                {['Name', 'Email', 'Role', 'Status', 'Subscription', 'Actions'].map((h) => (
                  <p key={h} className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider font-mono">{h}</p>
                ))}
              </div>

              <div className="space-y-2">
                {data.users.map((user) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 items-center p-4 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] hover:border-gold/20 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: `${roleColors[user.role]}15`, border: `1px solid ${roleColors[user.role]}30` }}
                      >
                        <span className="text-xs font-bold" style={{ color: roleColors[user.role] }}>
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user.name}</p>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] truncate">{user.email}</p>
                    <div>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: `${roleColors[user.role]}15`, color: roleColors[user.role] }}
                      >
                        {user.role}
                      </span>
                    </div>
                    <div>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{
                          background: user.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                          color: user.status === 'active' ? '#22C55E' : '#EF4444',
                        }}
                      >
                        {user.status}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] font-mono">
                      {user.subscription || '—'}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">View</Button>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── REPORTS TAB ─── */}
      {activeTab === 'reports' && (
        <div className="animate-in-delay-1">
          {/* Pending alert */}
          {pendingReports > 0 && (
            <Card variant="accent" padding="md" className="mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <span className="font-heading text-lg font-bold text-red-400">{pendingReports}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {pendingReports} Report{pendingReports > 1 ? 's' : ''} Requiring Review
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    These reports need your attention to maintain community safety
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <span className="text-xs text-[var(--text-tertiary)] font-mono">{data.reports.length} TOTAL</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.reports.map((report) => {
                  const isPending = report.status === 'PENDING';
                  return (
                    <div
                      key={report.id}
                      className="p-5 rounded-xl border transition-all duration-200"
                      style={{
                        background: isPending ? 'rgba(239,68,68,0.03)' : 'var(--bg-tertiary)',
                        borderColor: isPending ? 'rgba(239,68,68,0.15)' : 'var(--border-secondary)',
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                            style={{
                              background: isPending ? 'rgba(239,68,68,0.12)' : report.status === 'REVIEWED' ? 'rgba(59,130,246,0.12)' : 'rgba(34,197,94,0.12)',
                              color: isPending ? '#EF4444' : report.status === 'REVIEWED' ? '#3B82F6' : '#22C55E',
                            }}
                          >
                            {report.status}
                          </span>
                          <Badge variant="outline">{report.type}</Badge>
                        </div>
                        <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{report.createdAt}</span>
                      </div>

                      <div className="mb-2">
                        <p className="text-sm text-[var(--text-primary)]">
                          <span className="text-[var(--text-tertiary)]">From</span>{' '}
                          <span className="font-medium">{report.reporterName}</span>{' '}
                          <span className="text-[var(--text-tertiary)]">against</span>{' '}
                          <span className="font-medium">{report.reportedName}</span>
                        </p>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] mb-4">{report.description}</p>

                      {isPending && (
                        <div className="flex gap-2 pt-3 border-t border-[var(--border-secondary)]">
                          <Button variant="primary" size="sm">Resolve</Button>
                          <Button variant="ghost" size="sm">Dismiss</Button>
                          <Button variant="danger" size="sm">Suspend User</Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
