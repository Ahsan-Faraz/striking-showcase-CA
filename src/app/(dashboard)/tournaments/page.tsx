'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface Tournament {
  id: string;
  name: string;
  place: number;
  average: number;
  date: string;
  format: string | null;
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', place: '', average: '', date: '', format: '' });

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await fetch('/api/tournaments');
      if (res.ok) {
        const data = await res.json();
        setTournaments(data.tournaments || []);
      }
    } catch {
      // empty
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          place: parseInt(form.place),
          average: parseFloat(form.average),
          date: form.date,
          format: form.format || null,
        }),
      });
      if (res.ok) {
        const t = await res.json();
        setTournaments((prev) => [t, ...prev]);
        setForm({ name: '', place: '', average: '', date: '', format: '' });
        setShowForm(false);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tournaments/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTournaments((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const avgPlacement = tournaments.length > 0 ? (tournaments.reduce((sum, t) => sum + t.place, 0) / tournaments.length).toFixed(1) : '--';
  const avgScore = tournaments.length > 0 ? (tournaments.reduce((sum, t) => sum + t.average, 0) / tournaments.length).toFixed(1) : '--';
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <p className="section-label mb-1">Competition</p>
          <h1 className="font-heading text-4xl font-bold">Tournaments</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Track your tournament results and competitive history
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Tournament'}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 animate-in-delay-1">
        <Card className="text-center py-5 border-t-2 border-t-gold/40" hoverable>
          <p className="font-heading text-3xl font-bold text-gold">{tournaments.length}</p>
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-mono mt-1">Tournaments</p>
        </Card>
        <Card className="text-center py-5 border-t-2 border-t-maroon/40" hoverable>
          <p className="font-heading text-3xl font-bold text-gold">{avgPlacement}</p>
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-mono mt-1">Avg Place</p>
        </Card>
        <Card className="text-center py-5 border-t-2 border-t-maroon/40" hoverable>
          <p className="font-heading text-3xl font-bold text-[var(--text-primary)]">{avgScore}</p>
          <p className="text-xs text-[var(--text-tertiary)] uppercase tracking-wider font-mono mt-1">Avg Score</p>
        </Card>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="animate-in border-t-2 border-t-gold/40">
          <CardHeader>
            <CardTitle>Add Tournament Result</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Tournament Name</label>
                  <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Kansas State Championship" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Date</label>
                  <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Place</label>
                  <input className="input" type="number" min="1" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} placeholder="e.g. 3" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Average Score</label>
                  <input className="input" type="number" step="0.1" value={form.average} onChange={(e) => setForm({ ...form, average: e.target.value })} placeholder="e.g. 215.3" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Format</label>
                  <select className="input" value={form.format} onChange={(e) => setForm({ ...form, format: e.target.value })}>
                    <option value="">Select</option>
                    <option value="Singles">Singles</option>
                    <option value="Doubles">Doubles</option>
                    <option value="Team">Team</option>
                    <option value="Baker">Baker</option>
                    <option value="All-Events">All-Events</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-secondary)]">
                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button variant="primary" type="submit" loading={saving}>Save Tournament</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tournament List */}
      <Card className="animate-in-delay-2">
        <CardContent>
          {tournaments.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-maroon/10 border border-maroon/20 flex items-center justify-center mx-auto mb-5">
                <svg className="w-10 h-10 text-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872" />
                </svg>
              </div>
              <p className="text-lg font-heading font-bold text-[var(--text-primary)]">Start Tracking Results</p>
              <p className="text-sm text-[var(--text-tertiary)] mt-2 max-w-sm mx-auto">Add your tournament results to build your competitive resume for college coaches</p>
            </div>
          ) : (
            <div className="space-y-1">
              {/* Column headers */}
              <div className="flex items-center justify-between px-4 py-2 text-[10px] uppercase tracking-widest text-[var(--text-tertiary)] font-mono">
                <span>Event</span>
                <div className="flex items-center gap-8">
                  <span>Average</span>
                  <span className="w-12 text-center">Place</span>
                  <span className="w-8" />
                </div>
              </div>
              {tournaments.map((t) => (
                <div key={t.id} className={cn(
                  'flex items-center justify-between py-4 px-4 rounded-xl transition-all duration-200 group',
                  t.place <= 3 ? 'bg-gold/[0.04] border border-gold/10 hover:border-gold/20' : 'hover:bg-[var(--bg-card)]'
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center font-heading font-bold text-lg',
                      t.place === 1 && 'bg-gold/20 text-gold shadow-glow-gold/20',
                      t.place === 2 && 'bg-gray-300/10 text-gray-300 border border-gray-400/20',
                      t.place === 3 && 'bg-amber-700/15 text-amber-600 border border-amber-700/20',
                      t.place > 3 && 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
                    )}>
                      {t.place}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--text-primary)]">{t.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)] font-mono mt-0.5">
                        {t.date}
                        {t.format && ` \u00B7 ${t.format}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-lg font-mono font-bold text-gold">{t.average.toFixed(1)}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase font-mono">Average</p>
                    </div>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-tertiary)] hover:text-red-400 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
