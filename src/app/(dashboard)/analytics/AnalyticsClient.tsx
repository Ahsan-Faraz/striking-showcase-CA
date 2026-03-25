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

export default function AnalyticsClient() {
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

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 animate-in-delay-1">
        {[
          { label: "Total Views", value: data?.totalViews || 0 },
          { label: "Last 7 Days", value: data?.views7d || 0 },
          { label: "Last 30 Days", value: data?.views30d || 0 },
          {
            label: "Coach Views",
            value: data?.coachViews30d || 0,
            sublabel: "30 day",
          },
          {
            label: "On Watchlists",
            value: data?.watchlistCount || 0,
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

        <Card>
          <CardHeader>
            <CardTitle>Coach Interest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-secondary)]">
                <div className="flex items-center gap-3">
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
