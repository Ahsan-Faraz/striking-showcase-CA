"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

interface Ball {
  id: string;
  name: string;
  brand: string | null;
  weight: number;
  coverstock: string | null;
  pinToPap: string | null;
  valAngle: string | null;
  drillingAngle: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export default function ArsenalPage() {
  const [balls, setBalls] = useState<Ball[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    weight: "15",
    coverstock: "",
    pinToPap: "",
    valAngle: "",
    drillingAngle: "",
    isPrimary: false,
  });

  useEffect(() => {
    fetchArsenal();
  }, []);

  const fetchArsenal = async () => {
    try {
      const res = await fetch("/api/arsenal");
      if (res.ok) {
        const data = await res.json();
        setBalls(data.arsenal || []);
      }
    } catch {
      // empty
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/arsenal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          brand: form.brand || null,
          weight: parseInt(form.weight),
          coverstock: form.coverstock || null,
          pinToPap: form.pinToPap || null,
          valAngle: form.valAngle || null,
          drillingAngle: form.drillingAngle || null,
          isPrimary: form.isPrimary,
        }),
      });
      if (res.ok) {
        const ball = await res.json();
        setBalls((prev) => [...prev, ball]);
        setForm({
          name: "",
          brand: "",
          weight: "15",
          coverstock: "",
          pinToPap: "",
          valAngle: "",
          drillingAngle: "",
          isPrimary: false,
        });
        setShowForm(false);
      }
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/arsenal/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBalls((prev) => prev.filter((b) => b.id !== id));
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await fetch(`/api/arsenal/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      setBalls((prev) => prev.map((b) => ({ ...b, isPrimary: b.id === id })));
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <p className="section-label mb-1">Equipment</p>
          <h1 className="font-heading text-4xl font-bold">Ball Arsenal</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Manage your bowling ball collection
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Ball"}
        </Button>
      </div>

      {/* Summary strip */}
      {balls.length > 0 && (
        <div className="flex items-center gap-6 px-5 py-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)]">
          <div className="flex items-center gap-2">
            <span className="text-gold font-heading text-2xl font-bold">
              {balls.length}
            </span>
            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-mono">
              Total Balls
            </span>
          </div>
          <div className="w-px h-6 bg-[var(--border-primary)]" />
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-primary)] font-heading text-2xl font-bold">
              {balls.find((b) => b.isPrimary)?.name || "None"}
            </span>
            <span className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-mono">
              Primary
            </span>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <Card className="animate-in border-t-2 border-t-gold/40">
          <CardHeader>
            <CardTitle>Add New Ball</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">
                    Ball Name
                  </label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Hyper Cell Fused"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">
                    Brand
                  </label>
                  <select
                    className="input"
                    value={form.brand}
                    onChange={(e) =>
                      setForm({ ...form, brand: e.target.value })
                    }
                  >
                    <option value="">Select Brand</option>
                    <option value="Storm">Storm</option>
                    <option value="Roto Grip">Roto Grip</option>
                    <option value="Brunswick">Brunswick</option>
                    <option value="DV8">DV8</option>
                    <option value="Hammer">Hammer</option>
                    <option value="Motiv">Motiv</option>
                    <option value="Ebonite">Ebonite</option>
                    <option value="Track">Track</option>
                    <option value="Columbia 300">Columbia 300</option>
                    <option value="900 Global">900 Global</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">
                    Weight (lbs)
                  </label>
                  <select
                    className="input"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                  >
                    {[12, 13, 14, 15, 16].map((w) => (
                      <option key={w} value={w}>
                        {w} lbs
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">
                    Coverstock
                  </label>
                  <select
                    className="input"
                    value={form.coverstock}
                    onChange={(e) =>
                      setForm({ ...form, coverstock: e.target.value })
                    }
                  >
                    <option value="">Select Type</option>
                    <option value="Pearl">Pearl</option>
                    <option value="Solid">Solid</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">
                  Layout (Storm System)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <input
                      className="input"
                      value={form.pinToPap || ""}
                      onChange={(e) =>
                        setForm({ ...form, pinToPap: e.target.value })
                      }
                      placeholder='Pin to PAP (e.g. 4")'
                    />
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono mt-1 block">
                      PIN TO PAP
                    </span>
                  </div>
                  <div>
                    <input
                      className="input"
                      value={form.valAngle || ""}
                      onChange={(e) =>
                        setForm({ ...form, valAngle: e.target.value })
                      }
                      placeholder="VAL (e.g. 45°)"
                    />
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono mt-1 block">
                      VAL ANGLE
                    </span>
                  </div>
                  <div>
                    <input
                      className="input"
                      value={form.drillingAngle || ""}
                      onChange={(e) =>
                        setForm({ ...form, drillingAngle: e.target.value })
                      }
                      placeholder="Drill (e.g. 60°)"
                    />
                    <span className="text-[10px] text-[var(--text-tertiary)] font-mono mt-1 block">
                      DRILLING ANGLE
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={form.isPrimary}
                  onChange={(e) =>
                    setForm({ ...form, isPrimary: e.target.checked })
                  }
                  className="w-4 h-4 rounded accent-gold"
                />
                <label
                  htmlFor="isPrimary"
                  className="text-sm text-[var(--text-secondary)]"
                >
                  This is my primary ball
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-secondary)]">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit" loading={saving}>
                  Add Ball
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Ball List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
        </div>
      ) : balls.length === 0 && !showForm ? (
        <Card className="animate-in">
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-maroon/10 border border-maroon/20 flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-10 h-10 text-gold/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <circle cx="12" cy="12" r="9" />
                <circle cx="9" cy="10" r="1.5" />
                <circle cx="15" cy="10" r="1.5" />
                <circle cx="12" cy="15" r="1.5" />
              </svg>
            </div>
            <p className="text-lg font-heading font-bold text-[var(--text-primary)]">
              Build Your Arsenal
            </p>
            <p className="text-sm text-[var(--text-tertiary)] mt-2 max-w-sm mx-auto mb-6">
              Add your bowling balls to complete your profile and help coaches
              understand your game
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              Add Your First Ball
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {balls.map((ball) => (
            <Card
              key={ball.id}
              hoverable
              className={cn(
                "group",
                ball.isPrimary && "border-gold/30 border-t-2 border-t-gold/50",
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
                    ball.isPrimary
                      ? "bg-gold/15 border border-gold/20"
                      : "bg-[var(--bg-tertiary)]",
                  )}
                >
                  <svg
                    className={cn(
                      "w-7 h-7",
                      ball.isPrimary
                        ? "text-gold"
                        : "text-[var(--text-tertiary)]",
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="9" cy="10" r="1" />
                    <circle cx="15" cy="10" r="1" />
                    <circle cx="12" cy="15" r="1" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] truncate">
                      {ball.name}
                    </h3>
                    {ball.isPrimary && <Badge variant="recruit">Primary</Badge>}
                  </div>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    {ball.brand && `${ball.brand} \u00B7 `}
                    {ball.weight}lb
                    {ball.coverstock && ` \u00B7 ${ball.coverstock}`}
                  </p>
                  {(ball.pinToPap || ball.valAngle || ball.drillingAngle) && (
                    <p className="text-xs text-[var(--text-tertiary)] font-mono mt-0.5">
                      {[
                        ball.pinToPap && `Pin ${ball.pinToPap}`,
                        ball.valAngle && `VAL ${ball.valAngle}`,
                        ball.drillingAngle && `Drill ${ball.drillingAngle}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!ball.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(ball.id)}
                      className="p-2 rounded-lg hover:bg-gold/10 text-[var(--text-tertiary)] hover:text-gold transition-all"
                      title="Set as primary"
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
                          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                        />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(ball.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-tertiary)] hover:text-red-400 transition-all"
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
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
