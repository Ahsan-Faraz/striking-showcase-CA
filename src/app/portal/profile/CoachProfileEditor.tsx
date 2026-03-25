'use client';

import { useState, useTransition } from 'react';
import { saveCoachProfile } from './actions';

interface CoachProfileEditorProps {
  initialData: {
    school: string;
    title: string;
    division: string;
    conference: string;
    bio: string;
    sport: string;
  };
  isVerified: boolean;
}

const TITLE_OPTIONS = ['Head Coach', 'Assistant Coach', 'Volunteer Coach'];
const DIVISION_OPTIONS = ['D1', 'D2', 'D3', 'NAIA', 'JUCO'];

export default function CoachProfileEditor({ initialData, isVerified }: CoachProfileEditorProps) {
  const [title, setTitle] = useState(initialData.title);
  const [division, setDivision] = useState(initialData.division);
  const [conference, setConference] = useState(initialData.conference);
  const [bio, setBio] = useState(initialData.bio);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await saveCoachProfile({ title, division, conference, bio });
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Profile saved successfully.' });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`rounded-xl border p-3 text-sm ${
            message.type === 'success'
              ? 'border-green-500/30 bg-green-500/5 text-green-400'
              : 'border-red-500/30 bg-red-500/5 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* School — read-only */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
          School
        </label>
        <input
          type="text"
          value={initialData.school}
          disabled
          className="input w-full opacity-60 cursor-not-allowed"
        />
        {isVerified && (
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            School cannot be changed after verification.
          </p>
        )}
      </div>

      {/* Sport — read-only */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
          Sport
        </label>
        <input
          type="text"
          value={initialData.sport}
          disabled
          className="input w-full opacity-60 cursor-not-allowed"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
          Title
        </label>
        <select
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input w-full"
        >
          <option value="">Select title...</option>
          {TITLE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Division */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
          Division
        </label>
        <select
          value={division}
          onChange={(e) => setDivision(e.target.value)}
          className="input w-full"
        >
          <option value="">Select division...</option>
          {DIVISION_OPTIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* Conference */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
          Conference <span className="text-[var(--text-tertiary)] font-normal normal-case">(optional)</span>
        </label>
        <input
          type="text"
          value={conference}
          onChange={(e) => setConference(e.target.value)}
          placeholder="e.g., Big East, Southland"
          className="input w-full"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-2">
          Bio <span className="text-[var(--text-tertiary)] font-normal normal-case">(max 500 characters)</span>
        </label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={500}
          rows={5}
          placeholder="Tell athletes about your program and what you're looking for in recruits..."
          className="input w-full resize-none"
        />
        <p className="text-xs text-[var(--text-tertiary)] mt-1 text-right">
          {bio.length}/500
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-[#1C0A14] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #E0C878 50%, #C9A84C 100%)' }}
      >
        {isPending ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  );
}
