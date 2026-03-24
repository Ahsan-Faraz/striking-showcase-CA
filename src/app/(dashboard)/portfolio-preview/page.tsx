"use client";

import { Portfolio } from "@/components/athlete/Portfolio";
import { useEffect, useState } from "react";

export default function PortfolioPreviewPage() {
  const [athlete, setAthlete] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/athletes/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.athlete) setAthlete(data.athlete);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-[var(--text-secondary)]">
        Loading preview…
      </div>
    );
  }

  if (!athlete) {
    return (
      <div className="flex items-center justify-center py-32 text-[var(--text-secondary)]">
        Could not load your profile. Please complete your profile first.
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <Portfolio athlete={athlete as any} isOwner />
    </div>
  );
}
