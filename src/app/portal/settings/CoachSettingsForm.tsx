'use client';

import { useState, useTransition } from 'react';
import { saveCoachSettings } from './actions';

interface CoachSettingsFormProps {
  initialData: {
    emailOnAthleteReply: boolean;
    emailDailyDigest: boolean;
  };
}

export default function CoachSettingsForm({ initialData }: CoachSettingsFormProps) {
  const [emailOnAthleteReply, setEmailOnAthleteReply] = useState(initialData.emailOnAthleteReply);
  const [emailDailyDigest, setEmailDailyDigest] = useState(initialData.emailDailyDigest);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleSave() {
    setMessage(null);
    startTransition(async () => {
      const result = await saveCoachSettings({ emailOnAthleteReply, emailDailyDigest });
      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Settings saved.' });
      }
    });
  }

  return (
    <div className="space-y-5">
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

      <label className="flex items-center justify-between cursor-pointer">
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Athlete Reply Notifications</p>
          <p className="text-xs text-[var(--text-tertiary)]">Get emailed when an athlete replies to your message</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={emailOnAthleteReply}
          onClick={() => setEmailOnAthleteReply((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            emailOnAthleteReply ? 'bg-[#C9A84C]' : 'bg-white/10'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              emailOnAthleteReply ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </label>

      <label className="flex items-center justify-between cursor-pointer">
        <div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Daily Digest</p>
          <p className="text-xs text-[var(--text-tertiary)]">Receive a daily summary of new athlete matches and board updates</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={emailDailyDigest}
          onClick={() => setEmailDailyDigest((v) => !v)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            emailDailyDigest ? 'bg-[#C9A84C]' : 'bg-white/10'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              emailDailyDigest ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </label>

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-[#1C0A14] transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg, #C9A84C 0%, #E0C878 50%, #C9A84C 100%)' }}
      >
        {isPending ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
