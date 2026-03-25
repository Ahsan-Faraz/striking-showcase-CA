"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import Link from "next/link";

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [usbcId, setUsbcId] = useState("");
  const [slug, setSlug] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    profileViewAlerts: true,
    messageAlerts: true,
    watchlistAlerts: true,
  });

  useEffect(() => {
    fetch("/api/athletes/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.athlete) {
          setUsbcId(data.athlete.usbcId || "");
          setSlug(data.athlete.slug || "");
          setSlugInput(data.athlete.slug || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const checkSlug = useCallback(
    async (value: string) => {
      if (!value || value.length < 3) {
        setSlugStatus("invalid");
        return;
      }
      if (value === slug) {
        setSlugStatus("idle");
        return;
      }
      setSlugStatus("checking");
      try {
        const res = await fetch(
          `/api/slug/check?slug=${encodeURIComponent(value)}`,
        );
        const data = await res.json();
        setSlugStatus(data.available ? "available" : "taken");
      } catch {
        setSlugStatus("invalid");
      }
    },
    [slug],
  );

  useEffect(() => {
    const normalized = slugInput.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (normalized !== slugInput) setSlugInput(normalized);
    if (!normalized || normalized === slug) {
      setSlugStatus("idle");
      return;
    }
    const timer = setTimeout(() => checkSlug(normalized), 400);
    return () => clearTimeout(timer);
  }, [slugInput, slug, checkSlug]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus("idle");
    try {
      const payload: Record<string, unknown> = {
        usbcId: usbcId.trim() || null,
      };
      // Include slug if it changed and is valid
      if (
        slugInput &&
        slugInput !== slug &&
        (slugStatus === "available" || slugStatus === "idle")
      ) {
        payload.slug = slugInput;
      }
      const res = await fetch("/api/athletes/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.athlete?.slug) setSlug(data.athlete.slug);
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
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
            Account settings, identity verification, and notifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === "success" && (
            <span className="text-sm text-green-400 font-medium">Saved!</span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-red-400 font-medium">
              Save failed
            </span>
          )}
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving}
            disabled={loading}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* USBC Verification */}
          <Card className="animate-in-delay-1">
            <CardHeader>
              <CardTitle>USBC Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">
                Link your USBC membership ID to verify your bowling credentials.
                Verified profiles get a badge and rank higher in coach searches.
              </p>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                  USBC Member ID
                </label>
                <div className="flex gap-3">
                  <input
                    className="input flex-1 font-mono"
                    placeholder="e.g. 12345-67890"
                    value={usbcId}
                    onChange={(e) => setUsbcId(e.target.value)}
                  />
                  {usbcId && (
                    <div className="flex items-center px-3 rounded-xl bg-green-500/10 border border-green-500/20">
                      <svg
                        className="w-4 h-4 text-green-400 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs text-green-400 font-medium">
                        Linked
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile URL / Slug */}
          <Card className="animate-in-delay-1">
            <CardHeader>
              <CardTitle>Public Profile URL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">
                {slug
                  ? "Your public profile is live. You can update your slug below."
                  : "Set a unique slug to make your public profile available to coaches."}
              </p>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                  Profile Slug
                </label>
                <div className="flex gap-3 items-center">
                  <div className="flex items-center flex-1 gap-0 rounded-xl border border-[var(--border-primary)] overflow-hidden bg-[var(--bg-surface)]">
                    <span className="text-xs text-[var(--text-tertiary)] px-3 py-2.5 bg-[var(--bg-card)] border-r border-[var(--border-primary)] whitespace-nowrap">
                      strikingshowcase.com/
                    </span>
                    <input
                      className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none text-[var(--text-primary)]"
                      placeholder="your-name"
                      value={slugInput}
                      onChange={(e) =>
                        setSlugInput(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9-]/g, ""),
                        )
                      }
                    />
                  </div>
                  {slugStatus === "checking" && (
                    <span className="text-xs text-[var(--text-tertiary)]">
                      Checking…
                    </span>
                  )}
                  {slugStatus === "available" && (
                    <div className="flex items-center px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20">
                      <svg
                        className="w-4 h-4 text-green-400 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-xs text-green-400 font-medium">
                        Available
                      </span>
                    </div>
                  )}
                  {slugStatus === "taken" && (
                    <span className="text-xs text-red-400 font-medium">
                      Already taken
                    </span>
                  )}
                  {slugStatus === "invalid" && slugInput.length > 0 && (
                    <span className="text-xs text-red-400 font-medium">
                      Min 3 characters
                    </span>
                  )}
                </div>
              </div>
              {slug && (
                <div className="flex items-center justify-between pt-2">
                  <p
                    className="text-xs font-mono"
                    style={{ color: "var(--gold, #C9A84C)" }}
                  >
                    strikingshowcase.com/{slug}
                  </p>
                  <Link
                    href={`/${slug}`}
                    target="_blank"
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-gold/30 transition-colors"
                  >
                    View Profile →
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="animate-in-delay-2">
            <CardHeader>
              <CardTitle>Appearance & Access</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/theme"
                  className="p-4 rounded-xl border border-[var(--border-primary)] hover:border-gold/30 hover:bg-[var(--bg-card)] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-maroon/10 border border-maroon/20 flex items-center justify-center group-hover:border-gold/30 transition-colors">
                      <svg
                        className="w-5 h-5 text-gold/60"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Theme Studio
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        Colors, layout, fonts
                      </p>
                    </div>
                  </div>
                </Link>
                <Link
                  href="/family"
                  className="p-4 rounded-xl border border-[var(--border-primary)] hover:border-gold/30 hover:bg-[var(--bg-card)] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-maroon/10 border border-maroon/20 flex items-center justify-center group-hover:border-gold/30 transition-colors">
                      <svg
                        className="w-5 h-5 text-gold/60"
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
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        Family Access
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        Invite family members
                      </p>
                    </div>
                  </div>
                </Link>
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
                  checked={notifications.emailNotifications}
                  onChange={(v) =>
                    setNotifications({
                      ...notifications,
                      emailNotifications: v,
                    })
                  }
                  label="Email Notifications"
                  description="Receive email updates about your account"
                />
              </div>
              <div className="p-3 rounded-xl hover:bg-[var(--bg-card)] transition-colors">
                <Toggle
                  checked={notifications.profileViewAlerts}
                  onChange={(v) =>
                    setNotifications({ ...notifications, profileViewAlerts: v })
                  }
                  label="Profile View Alerts"
                  description="Get notified when a coach views your profile"
                />
              </div>
              <div className="p-3 rounded-xl hover:bg-[var(--bg-card)] transition-colors">
                <Toggle
                  checked={notifications.messageAlerts}
                  onChange={(v) =>
                    setNotifications({ ...notifications, messageAlerts: v })
                  }
                  label="Message Alerts"
                  description="Get notified when you receive a new message"
                />
              </div>
              <div className="p-3 rounded-xl hover:bg-[var(--bg-card)] transition-colors">
                <Toggle
                  checked={notifications.watchlistAlerts}
                  onChange={(v) =>
                    setNotifications({ ...notifications, watchlistAlerts: v })
                  }
                  label="Watchlist Alerts"
                  description="Get notified when a coach adds you to their watchlist"
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card>
            <CardHeader>
              <CardTitle className="!bg-none !text-red-400">
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Delete Account
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Permanently delete your account and all data. This cannot be
                    undone.
                  </p>
                </div>
                <Button variant="danger" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
