"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  totalViews: number;
  views7d: number;
  views30d: number;
  coachViews30d: number;
  watchlistCount: number;
  dailyViews: Record<string, number>;
  sources: Record<string, number>;
}

function MiniBarChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data);
  const max = Math.max(...Object.values(data), 1);

  return (
    <div className="flex items-end gap-[2px] h-32">
      {entries.map(([date, count]) => {
        const height = Math.max((count / max) * 100, 2);
        const isToday = date === new Date().toISOString().split("T")[0];
        return (
          <div
            key={date}
            className="flex-1 flex flex-col items-center justify-end group relative"
          >
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-2 py-1 text-[10px] text-[var(--text-primary)] whitespace-nowrap shadow-xl">
                <p className="font-mono font-bold">
                  {count} view{count !== 1 ? "s" : ""}
                </p>
                <p className="text-[var(--text-tertiary)]">
                  {new Date(date + "T12:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div
              className={cn(
                "w-full rounded-t transition-all duration-300",
                isToday
                  ? "bg-gold"
                  : count > 0
                    ? "bg-maroon group-hover:bg-maroon-bright"
                    : "bg-[var(--bg-tertiary)]",
              )}
              style={{ height: `${height}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 animate-in">
          <p className="section-label mb-1">Insights</p>
          <h1 className="font-heading text-4xl font-bold">Analytics</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const sourceLabels: Record<string, string> = {
    search: "Search",
    direct: "Direct Link",
    portal: "Coach Portal",
    social: "Social Share",
  };

  const totalSourceViews = data
    ? Object.values(data.sources).reduce((s, v) => s + v, 0) || 1
    : 1;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="animate-in">
        <p className="section-label mb-1">Insights</p>
        <h1 className="font-heading text-4xl font-bold">Analytics</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-2">
          See how coaches and scouts are discovering your profile
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 animate-in-delay-1">
        {[
          { label: "Total Views", value: data?.totalViews || 0, icon: "👁" },
          { label: "Last 7 Days", value: data?.views7d || 0, icon: "📈" },
          { label: "Last 30 Days", value: data?.views30d || 0, icon: "📊" },
          {
            label: "Coach Views",
            value: data?.coachViews30d || 0,
            icon: "🎯",
            sublabel: "30 day",
          },
          {
            label: "On Watchlists",
            value: data?.watchlistCount || 0,
            icon: "⭐",
          },
        ].map((kpi) => (
          <Card
            key={kpi.label}
            className="hover:border-gold/30 transition-all duration-300"
          >
            <div className="p-4 text-center">
              <p className="text-3xl font-heading font-bold text-[var(--text-primary)]">
                {kpi.value}
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                {kpi.label}
              </p>
              {kpi.sublabel && (
                <p className="text-[10px] text-[var(--text-tertiary)]">
                  {kpi.sublabel}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Views Chart */}
      <Card className="animate-in-delay-2">
        <CardHeader>
          <CardTitle>Profile Views — Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.dailyViews ? (
            <>
              <MiniBarChart data={data.dailyViews} />
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                  30 days ago
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                  Today
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-[var(--text-tertiary)]">
                No view data available yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in-delay-3">
        {/* View Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.sources && Object.keys(data.sources).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(data.sources)
                  .sort(([, a], [, b]) => b - a)
                  .map(([source, count]) => {
                    const percentage = Math.round(
                      (count / totalSourceViews) * 100,
                    );
                    return (
                      <div key={source}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-[var(--text-primary)]">
                            {sourceLabels[source] || source}
                          </span>
                          <span className="text-xs text-[var(--text-tertiary)] font-mono">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-maroon to-gold transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
                No source data yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Coach Interest */}
        <Card>
          <CardHeader>
            <CardTitle>Coach Interest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-maroon/10 border border-maroon/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-heading font-bold text-[var(--text-primary)]">
                      {data?.coachViews30d || 0}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      College coaches viewed your profile in the last 30 days
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-gold"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-heading font-bold text-[var(--text-primary)]">
                      {data?.watchlistCount || 0}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      Coaches have you on their recruiting board
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-tertiary)] text-center">
                Coach names are not shown unless they message you directly
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
