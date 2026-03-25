"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface FamilyMember {
  id: string;
  email: string | null;
  name: string | null;
  relationship: string | null;
  status: string;
  acceptedAt: string | null;
  createdAt: string;
}

const RELATIONSHIPS = ["Parent", "Guardian", "Sibling", "Other"] as const;

export default function FamilyPage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    email: "",
    name: "",
    relationship: "Parent" as string,
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/family");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!form.email.trim() || !form.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setMembers((prev) => [data, ...prev]);
        setForm({ email: "", name: "", relationship: "Parent" });
        setShowForm(false);
        setSuccess(`Invitation email sent to ${form.email}`);
        setTimeout(() => setSuccess(""), 5000);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to send invite");
      }
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await fetch(`/api/family/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
      }
    } catch {
      // Handle silently
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <p className="section-label mb-1">Access</p>
          <h1 className="font-heading text-4xl font-bold">Family Portal</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Give family members read-only access to your profile and messages
          </p>
        </div>
        {members.length < 4 && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Invite Member
          </Button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400 animate-in">
          {success}
        </div>
      )}

      {/* Invite Form */}
      {showForm && (
        <Card className="animate-in border-t-2 border-t-gold/30">
          <CardHeader>
            <CardTitle>Invite Family Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                  Full Name *
                </label>
                <input
                  className="input"
                  placeholder="e.g. Jane Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                  Email Address *
                </label>
                <input
                  className="input"
                  type="email"
                  placeholder="e.g. parent@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                Relationship
              </label>
              <div className="flex gap-2">
                {RELATIONSHIPS.map((rel) => (
                  <button
                    key={rel}
                    onClick={() => setForm({ ...form, relationship: rel })}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200",
                      form.relationship === rel
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-gold/30",
                    )}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleInvite}
                loading={saving}
                disabled={!form.email.trim() || !form.name.trim()}
              >
                Send Invite
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Permissions Info */}
      <Card className="animate-in-delay-1">
        <CardHeader>
          <CardTitle>What Family Members Can Do</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {[
              { label: "View full profile & stats", allowed: true },
              { label: "View coach messages", allowed: true },
              { label: "Reply in message threads", allowed: true },
              { label: "View analytics", allowed: true },
              { label: "Edit profile or stats", allowed: false },
              { label: "Manage media", allowed: false },
              { label: "Invite other members", allowed: false },
              { label: "Change settings", allowed: false },
            ].map((perm) => (
              <div key={perm.label} className="flex items-center gap-2 py-1">
                {perm.allowed ? (
                  <svg
                    className="w-4 h-4 text-green-400 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-red-400 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                )}
                <span className="text-sm text-[var(--text-secondary)]">
                  {perm.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-6 h-6 border-2 border-gold border-t-transparent rounded-full" />
        </div>
      ) : members.length === 0 ? (
        <Card className="animate-in-delay-2">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-maroon/10 border border-maroon/20 flex items-center justify-center mb-5">
              <svg
                className="w-10 h-10 text-gold/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
                />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
              No Family Members
            </h3>
            <p className="text-sm text-[var(--text-tertiary)] max-w-sm text-center">
              Invite up to 4 family members to view your profile, messages, and
              recruiting activity.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3 animate-in-delay-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
              Invited Members ({members.length}/4)
            </h2>
          </div>
          {members.map((member) => (
            <Card
              key={member.id}
              className="hover:border-gold/30 transition-all duration-300"
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-maroon to-maroon-dark flex items-center justify-center border border-gold/20">
                    <span className="font-heading text-xs font-bold text-gold/80">
                      {(member.name || "FM")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      {member.name}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {member.email}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                        {member.relationship}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                          member.status === "active" || member.acceptedAt
                            ? "bg-green-500/10 text-green-400"
                            : "bg-yellow-500/10 text-yellow-400",
                        )}
                      >
                        {member.status === "active" || member.acceptedAt
                          ? "Active"
                          : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRevoke(member.id)}
                  className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  Revoke
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
