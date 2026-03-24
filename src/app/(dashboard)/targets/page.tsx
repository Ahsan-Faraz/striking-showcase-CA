"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CollegeTarget {
  id: string;
  schoolName: string;
  division: string | null;
  conference: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}

const STATUS_OPTIONS = [
  {
    value: "INTERESTED",
    label: "Interested",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  {
    value: "APPLIED",
    label: "Applied",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  },
  {
    value: "VISITED",
    label: "Visited",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  {
    value: "OFFERED",
    label: "Offered",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  {
    value: "COMMITTED",
    label: "Committed",
    color: "bg-gold/20 text-gold border-gold/30",
  },
] as const;

const DIVISION_OPTIONS = ["D1", "D2", "D3", "NAIA", "JUCO"];

function getStatusConfig(status: string) {
  return STATUS_OPTIONS.find((s) => s.value === status) || STATUS_OPTIONS[0];
}

export default function TargetsPage() {
  const [targets, setTargets] = useState<CollegeTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [form, setForm] = useState({
    schoolName: "",
    division: "",
    conference: "",
    status: "INTERESTED",
    notes: "",
  });

  useEffect(() => {
    fetchTargets();
  }, []);

  const fetchTargets = async () => {
    try {
      const res = await fetch("/api/targets");
      if (res.ok) {
        const data = await res.json();
        setTargets(data.targets || []);
      }
    } catch {
      // Handle silently
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      schoolName: "",
      division: "",
      conference: "",
      status: "INTERESTED",
      notes: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.schoolName.trim()) return;
    setSaving(true);
    try {
      const url = editingId ? `/api/targets/${editingId}` : "/api/targets";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        if (editingId) {
          setTargets((prev) =>
            prev.map((t) => (t.id === editingId ? data : t)),
          );
        } else {
          setTargets((prev) => [data, ...prev]);
        }
        resetForm();
      }
    } catch {
      // Handle silently
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (target: CollegeTarget) => {
    setForm({
      schoolName: target.schoolName,
      division: target.division || "",
      conference: target.conference || "",
      status: target.status,
      notes: target.notes || "",
    });
    setEditingId(target.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/targets/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTargets((prev) => prev.filter((t) => t.id !== id));
        if (editingId === id) resetForm();
      }
    } catch {
      // Handle silently
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/targets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setTargets((prev) => prev.map((t) => (t.id === id ? data : t)));
      }
    } catch {
      // Handle silently
    }
  };

  const filtered =
    filterStatus === "all"
      ? targets
      : targets.filter((t) => t.status === filterStatus);

  // Group by status for Kanban-like overview
  const statusCounts = STATUS_OPTIONS.map((s) => ({
    ...s,
    count: targets.filter((t) => t.status === s.value).length,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <p className="section-label mb-1">Recruiting</p>
          <h1 className="font-heading text-4xl font-bold">College Targets</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Track your target schools and recruiting progress
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
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
          Add School
        </Button>
      </div>

      {/* Status Pipeline Overview */}
      <div className="grid grid-cols-5 gap-3 animate-in-delay-1">
        {statusCounts.map((s) => (
          <button
            key={s.value}
            onClick={() =>
              setFilterStatus(filterStatus === s.value ? "all" : s.value)
            }
            className={cn(
              "p-3 rounded-xl border text-center transition-all duration-300",
              filterStatus === s.value
                ? "border-gold bg-gold/5 shadow-glow-gold/10"
                : "border-[var(--border-primary)] hover:border-gold/30 bg-[var(--bg-card)]",
            )}
          >
            <p className="text-2xl font-heading font-bold text-[var(--text-primary)]">
              {s.count}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
              {s.label}
            </p>
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="animate-in border-t-2 border-t-gold/30">
          <CardHeader>
            <CardTitle>
              {editingId ? "Edit School" : "Add Target School"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                  School Name *
                </label>
                <input
                  className="input"
                  placeholder="e.g. Wichita State University"
                  value={form.schoolName}
                  onChange={(e) =>
                    setForm({ ...form, schoolName: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                  Division
                </label>
                <select
                  className="input"
                  value={form.division}
                  onChange={(e) =>
                    setForm({ ...form, division: e.target.value })
                  }
                >
                  <option value="">Select Division</option>
                  {DIVISION_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                  Conference
                </label>
                <input
                  className="input"
                  placeholder="e.g. AAC, Big 12"
                  value={form.conference}
                  onChange={(e) =>
                    setForm({ ...form, conference: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                  Status
                </label>
                <select
                  className="input"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">
                Notes
              </label>
              <textarea
                className="input min-h-[80px] resize-none"
                placeholder="Contact info, visit dates, impressions..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                maxLength={1000}
              />
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1 text-right">
                {form.notes.length}/1000
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                loading={saving}
                disabled={!form.schoolName.trim()}
              >
                {editingId ? "Update" : "Add School"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Targets List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
        </div>
      ) : filtered.length === 0 ? (
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
                  d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342"
                />
              </svg>
            </div>
            <h3 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
              {targets.length > 0 ? "No matches" : "No Target Schools Yet"}
            </h3>
            <p className="text-sm text-[var(--text-tertiary)] max-w-sm text-center">
              {targets.length > 0
                ? "Try adjusting your filter to see more schools."
                : "Start building your college list by adding schools you're interested in."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3 animate-in-delay-2">
          {filtered.map((target) => {
            const statusConfig = getStatusConfig(target.status);
            return (
              <Card
                key={target.id}
                className="group hover:border-gold/30 transition-all duration-300"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] truncate">
                          {target.schoolName}
                        </h3>
                        <span
                          className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0",
                            statusConfig.color,
                          )}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                        {target.division && (
                          <span className="px-2 py-0.5 rounded bg-[var(--bg-tertiary)] font-mono">
                            {target.division}
                          </span>
                        )}
                        {target.conference && <span>{target.conference}</span>}
                        <span>
                          Added{" "}
                          {new Date(target.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {target.notes && (
                        <p className="text-sm text-[var(--text-secondary)] mt-2 line-clamp-2">
                          {target.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Quick status change */}
                      <select
                        className="text-xs bg-transparent border border-[var(--border-primary)] rounded-lg px-2 py-1.5 text-[var(--text-secondary)] cursor-pointer hover:border-gold/30 transition-colors"
                        value={target.status}
                        onChange={(e) =>
                          handleStatusChange(target.id, e.target.value)
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleEdit(target)}
                        className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(target.id)}
                        className="p-2 rounded-lg text-[var(--text-tertiary)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
