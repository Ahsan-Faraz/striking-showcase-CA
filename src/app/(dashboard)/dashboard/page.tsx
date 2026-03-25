import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { StatBlock } from "@/components/ui/StatBlock";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  verifySession,
  getProfileCompletion,
  getRecentProfileViews,
  getQuickStats,
  getRecentInquiries,
} from "@/lib/dal";

export default async function DashboardPage() {
  const user = await verifySession();
  if (!user) redirect("/login");

  const profile = user.athleteProfile;
  if (!profile) redirect("/onboarding");

  // Parallel data fetches — never sequential awaits
  const [completion, recentViews, stats, inquiries] = await Promise.all([
    getProfileCompletion(user.id),
    getRecentProfileViews(profile.id),
    getQuickStats(profile.id, user.id),
    getRecentInquiries(profile.id),
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in">
        <div>
          <p className="section-label mb-1">Dashboard</p>
          <h1 className="font-heading text-2xl sm:text-4xl font-bold">
            Welcome back,{" "}
            <span className="text-gradient-gold">{profile.firstName}</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Here&apos;s what&apos;s happening with your profile
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profile.slug && (
            <Link href={`/${profile.slug}`}>
              <Button variant="secondary" size="sm">
                View Public Profile
              </Button>
            </Link>
          )}
          <Link href="/profile">
            <Button variant="primary" size="sm">
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Completion Banner */}
      {completion.percentage < 100 && (
        <Card variant="accent" padding="md" className="animate-in-delay-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gold/15 border border-gold/20 flex items-center justify-center shrink-0">
                <span className="font-heading text-lg font-bold text-gold">
                  {completion.percentage}%
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Complete Your Profile
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {completion.nextAction}
                </p>
              </div>
            </div>
            <Link href={completion.nextActionLink}>
              <Button variant="secondary" size="sm">
                Complete Now
              </Button>
            </Link>
          </div>
          <div className="mt-4 h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-maroon to-gold transition-all duration-1000"
              style={{ width: `${completion.percentage}%` }}
            />
          </div>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in-delay-1">
        <Card hoverable className="border-t-2 border-t-gold/40">
          <StatBlock value={recentViews} label="Views (7d)" />
        </Card>
        <Card hoverable className="border-t-2 border-t-gold/40">
          <StatBlock value={stats.watchlistCount} label="On Watchlists" />
        </Card>
        <Card hoverable className="border-t-2 border-t-maroon/40">
          <Link href="/messages" className="block">
            <StatBlock value={stats.unreadMessages} label="Unread Messages" />
          </Link>
        </Card>
        <Card hoverable className="border-t-2 border-t-maroon/40">
          <StatBlock value={stats.totalInquiries} label="Inquiries" />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in-delay-2">
        {/* Quick Stats */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
              <Link
                href="/profile"
                className="text-xs text-gold hover:text-gold-light transition-colors hover:underline"
              >
                Update Stats
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center p-5 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] hover:border-gold/20 transition-colors">
                  <p className="font-heading text-3xl font-bold text-gold">
                    {profile.seasonAverage?.toFixed(1) ?? "--"}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-1 font-mono">
                    Season Avg
                  </p>
                </div>
                <div className="text-center p-5 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] hover:border-gold/20 transition-colors">
                  <p className="font-heading text-3xl font-bold text-[var(--text-primary)]">
                    {profile.highGame ?? "--"}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-1 font-mono">
                    High Game
                  </p>
                </div>
                <div className="text-center p-5 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)] hover:border-gold/20 transition-colors">
                  <p className="font-heading text-3xl font-bold text-[var(--text-primary)]">
                    {profile.highSeries ?? "--"}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider mt-1 font-mono">
                    High Series
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Inquiries */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Inquiries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inquiries.length === 0 && (
                <p className="text-xs text-[var(--text-tertiary)] text-center py-4">
                  No inquiries yet
                </p>
              )}
              {inquiries.map((inquiry) => (
                <Link
                  key={inquiry.id}
                  href="/messages"
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--bg-card)] transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-maroon/15 border border-maroon/20 flex items-center justify-center shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {inquiry.coach.school ?? "Coach"}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                      {inquiry.messages[0]?.content ?? "No messages"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in-delay-3">
        {[
          { label: "Add Tournament", href: "/tournaments", icon: "🏆" },
          { label: "Upload Media", href: "/media", icon: "📸" },
          { label: "Update Arsenal", href: "/arsenal", icon: "🎳" },
          { label: "View Messages", href: "/messages", icon: "💬" },
        ].map((action) => (
          <Link key={action.href} href={action.href}>
            <Card
              hoverable
              className="text-center py-8 group border-b-2 border-b-transparent hover:border-b-gold/40"
            >
              <span className="text-3xl mb-3 block group-hover:scale-110 transition-transform duration-300">
                {action.icon}
              </span>
              <p className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-gold transition-colors">
                {action.label}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
