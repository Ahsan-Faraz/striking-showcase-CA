'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  basicInfoSchema,
  bowlingStatsSchema,
  slugSchema,
  type BasicInfoData,
  type BowlingStatsData,
} from '@/lib/validations/onboarding';
import {
  saveBasicInfo,
  saveBowlingStats,
  saveProfilePhoto,
  saveBallArsenal,
  saveSlug,
} from './actions';

const TOTAL_STEPS = 6;

const STEP_LABELS = [
  'Basic Info',
  'Bowling Stats',
  'Profile Photo',
  'Ball Arsenal',
  'Choose URL',
  'All Done!',
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Step 1 state
  const [basicInfo, setBasicInfo] = useState<BasicInfoData>({
    firstName: '',
    lastName: '',
    classYear: new Date().getFullYear() + 2,
    state: '',
    school: '',
    gender: 'Male',
  });

  // Step 2 state
  const [bowlingStats, setBowlingStats] = useState<BowlingStatsData>({
    seasonAverage: '',
    highGame: '',
    highSeries: '',
    dominantHand: 'RIGHT',
    style: undefined,
    revRate: '',
    ballSpeed: '',
  });

  // Step 3 state
  const [photoUrl, setPhotoUrl] = useState('');

  // Step 4 state
  const [arsenal, setArsenal] = useState<Array<{ ballName: string; brand: string; weight: string; coverstock: string }>>([
    { ballName: '', brand: '', weight: '', coverstock: '' },
  ]);

  // Step 5 state
  const [slug, setSlug] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);

  // Debounced slug check
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }
    const validate = slugSchema.safeParse({ slug });
    if (!validate.success) {
      setSlugAvailable(null);
      return;
    }
    setSlugChecking(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/slug/check?slug=${encodeURIComponent(slug)}`);
        const data = await res.json();
        setSlugAvailable(data.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [slug]);

  const handleNext = useCallback(async () => {
    setError('');
    setSaving(true);

    try {
      if (step === 1) {
        const parse = basicInfoSchema.safeParse(basicInfo);
        if (!parse.success) {
          setError(parse.error.issues[0]?.message ?? 'Invalid data');
          setSaving(false);
          return;
        }
        const result = await saveBasicInfo(parse.data);
        if (result.error) { setError(result.error); setSaving(false); return; }
      }

      if (step === 2) {
        const parse = bowlingStatsSchema.safeParse(bowlingStats);
        if (!parse.success) {
          setError(parse.error.issues[0]?.message ?? 'Invalid data');
          setSaving(false);
          return;
        }
        const result = await saveBowlingStats(parse.data);
        if (result.error) { setError(result.error); setSaving(false); return; }
      }

      if (step === 3) {
        const result = await saveProfilePhoto({ profilePhotoUrl: photoUrl || undefined });
        if (result.error) { setError(result.error); setSaving(false); return; }
      }

      if (step === 4) {
        const nonEmpty = arsenal.filter((a) => a.ballName.trim() !== '');
        const result = await saveBallArsenal({
          arsenal: nonEmpty.map((a) => ({
            ballName: a.ballName,
            brand: a.brand || undefined,
            weight: a.weight ? Number(a.weight) : undefined,
            coverstock: a.coverstock || undefined,
          })),
        });
        if (result.error) { setError(result.error); setSaving(false); return; }
      }

      if (step === 5) {
        const parse = slugSchema.safeParse({ slug });
        if (!parse.success) {
          setError(parse.error.issues[0]?.message ?? 'Invalid URL');
          setSaving(false);
          return;
        }
        if (slugAvailable === false) {
          setError('This URL is already taken');
          setSaving(false);
          return;
        }
        const result = await saveSlug(parse.data);
        if (result.error) { setError(result.error); setSaving(false); return; }
      }

      if (step < TOTAL_STEPS) {
        setStep(step + 1);
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [step, basicInfo, bowlingStats, photoUrl, arsenal, slug, slugAvailable]);

  const handleBack = () => {
    if (step > 1) {
      setError('');
      setStep(step - 1);
    }
  };

  const handleSkip = () => {
    setError('');
    setStep(step + 1);
  };

  const canSkip = step === 3 || step === 4;

  const addArsenalSlot = () => {
    if (arsenal.length < 3) {
      setArsenal([...arsenal, { ballName: '', brand: '', weight: '', coverstock: '' }]);
    }
  };

  const removeArsenalSlot = (index: number) => {
    setArsenal(arsenal.filter((_, i) => i !== index));
  };

  const updateArsenal = (index: number, field: string, value: string) => {
    const updated = [...arsenal];
    updated[index] = { ...updated[index], [field]: value };
    setArsenal(updated);
  };

  // Auto-generate slug suggestion from name
  const suggestSlug = () => {
    const base = `${basicInfo.firstName}-${basicInfo.lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (base.length >= 3) setSlug(base);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-heading text-2xl font-bold tracking-tight">
              <span className="text-gold">Striking</span>{' '}
              <span className="text-[var(--text-primary)]">Showcase</span>
            </span>
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-[var(--text-secondary)]">
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="text-sm text-[var(--text-tertiary)]">{STEP_LABELS[step - 1]}</span>
          </div>
          <div className="w-full h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#660033] to-gold rounded-full transition-all duration-500"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
          {/* Step dots */}
          <div className="flex justify-between mt-3">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i + 1 <= step
                    ? 'bg-gold scale-110'
                    : 'bg-[var(--bg-tertiary)]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* ── Step 1: Basic Info ── */}
          {step === 1 && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
                Let&apos;s get started
              </h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                Tell us a bit about yourself. Coaches will see this info on your profile.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">First Name *</label>
                  <input
                    className="input w-full"
                    value={basicInfo.firstName}
                    onChange={(e) => setBasicInfo({ ...basicInfo, firstName: e.target.value })}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Last Name *</label>
                  <input
                    className="input w-full"
                    value={basicInfo.lastName}
                    onChange={(e) => setBasicInfo({ ...basicInfo, lastName: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Class Year *</label>
                  <select
                    className="input w-full"
                    value={basicInfo.classYear}
                    onChange={(e) => setBasicInfo({ ...basicInfo, classYear: Number(e.target.value) })}
                  >
                    {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Gender *</label>
                  <select
                    className="input w-full"
                    value={basicInfo.gender}
                    onChange={(e) => setBasicInfo({ ...basicInfo, gender: e.target.value as 'Male' | 'Female' })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-[var(--text-secondary)] mb-1">State *</label>
                <select
                  className="input w-full"
                  value={basicInfo.state}
                  onChange={(e) => setBasicInfo({ ...basicInfo, state: e.target.value })}
                >
                  <option value="">Select state</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-[var(--text-secondary)] mb-1">School *</label>
                <input
                  className="input w-full"
                  value={basicInfo.school}
                  onChange={(e) => setBasicInfo({ ...basicInfo, school: e.target.value })}
                  placeholder="Your high school"
                />
              </div>
            </div>
          )}

          {/* ── Step 2: Bowling Stats ── */}
          {step === 2 && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
                Your bowling stats
              </h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                These are the first numbers coaches look at. You can update them anytime.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Season Average</label>
                  <input
                    className="input w-full"
                    type="number"
                    min={0}
                    max={300}
                    value={bowlingStats.seasonAverage}
                    onChange={(e) => setBowlingStats({ ...bowlingStats, seasonAverage: e.target.value as unknown as number })}
                    placeholder="e.g. 210"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">High Game</label>
                  <input
                    className="input w-full"
                    type="number"
                    min={0}
                    max={300}
                    value={bowlingStats.highGame}
                    onChange={(e) => setBowlingStats({ ...bowlingStats, highGame: e.target.value as unknown as number })}
                    placeholder="e.g. 279"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">High Series</label>
                  <input
                    className="input w-full"
                    type="number"
                    min={0}
                    max={900}
                    value={bowlingStats.highSeries}
                    onChange={(e) => setBowlingStats({ ...bowlingStats, highSeries: e.target.value as unknown as number })}
                    placeholder="e.g. 740"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Rev Rate (RPM)</label>
                  <input
                    className="input w-full"
                    type="number"
                    min={0}
                    max={700}
                    value={bowlingStats.revRate}
                    onChange={(e) => setBowlingStats({ ...bowlingStats, revRate: e.target.value as unknown as number })}
                    placeholder="e.g. 350"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Ball Speed (mph)</label>
                  <input
                    className="input w-full"
                    type="number"
                    step="0.1"
                    min={0}
                    max={30}
                    value={bowlingStats.ballSpeed}
                    onChange={(e) => setBowlingStats({ ...bowlingStats, ballSpeed: e.target.value as unknown as number })}
                    placeholder="e.g. 17.5"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-1">Dominant Hand</label>
                  <select
                    className="input w-full"
                    value={bowlingStats.dominantHand ?? ''}
                    onChange={(e) => setBowlingStats({ ...bowlingStats, dominantHand: e.target.value as 'RIGHT' | 'LEFT' | undefined || undefined })}
                  >
                    <option value="RIGHT">Right</option>
                    <option value="LEFT">Left</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm text-[var(--text-secondary)] mb-1">Style</label>
                <select
                  className="input w-full"
                  value={bowlingStats.style ?? ''}
                  onChange={(e) => setBowlingStats({ ...bowlingStats, style: e.target.value as BowlingStatsData['style'] || undefined })}
                >
                  <option value="">Select style</option>
                  <option value="ONE_HANDED">One-Handed</option>
                  <option value="TWO_HANDED">Two-Handed</option>
                </select>
              </div>
            </div>
          )}

          {/* ── Step 3: Profile Photo ── */}
          {step === 3 && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
                Add a profile photo
              </h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                Profiles with photos get 3x more views from coaches. You can skip this and add one later.
              </p>

              {photoUrl ? (
                <div className="text-center">
                  <div className="w-32 h-32 rounded-full mx-auto border-4 border-gold/30 overflow-hidden mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                    onClick={() => setPhotoUrl('')}
                  >
                    Remove photo
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[var(--border-primary)] rounded-xl p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--bg-tertiary)] mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    Upload a professional photo or headshot
                  </p>
                  <label className="btn-secondary text-sm px-6 py-2.5 rounded-lg cursor-pointer inline-block">
                    Choose Photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // For now, create local preview. Cloudinary widget can be integrated later.
                          const url = URL.createObjectURL(file);
                          setPhotoUrl(url);
                        }
                      }}
                    />
                  </label>
                  <p className="text-xs text-[var(--text-tertiary)] mt-3">JPG or PNG, max 10MB</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Ball Arsenal ── */}
          {step === 4 && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
                Your ball arsenal
              </h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                Coaches love to see what you throw. Add up to 3 balls now — you can add more later.
              </p>

              <div className="space-y-4">
                {arsenal.map((ball, index) => (
                  <div key={index} className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-medium text-gold">Ball {index + 1}</span>
                      {arsenal.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArsenalSlot(index)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        className="input"
                        placeholder="Ball name *"
                        value={ball.ballName}
                        onChange={(e) => updateArsenal(index, 'ballName', e.target.value)}
                      />
                      <input
                        className="input"
                        placeholder="Brand"
                        value={ball.brand}
                        onChange={(e) => updateArsenal(index, 'brand', e.target.value)}
                      />
                      <input
                        className="input"
                        type="number"
                        placeholder="Weight (lbs)"
                        min={8}
                        max={16}
                        value={ball.weight}
                        onChange={(e) => updateArsenal(index, 'weight', e.target.value)}
                      />
                      <input
                        className="input"
                        placeholder="Coverstock"
                        value={ball.coverstock}
                        onChange={(e) => updateArsenal(index, 'coverstock', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {arsenal.length < 3 && (
                <button
                  type="button"
                  onClick={addArsenalSlot}
                  className="mt-4 text-sm text-gold hover:text-[var(--gold-light)] transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Add another ball
                </button>
              )}
            </div>
          )}

          {/* ── Step 5: Choose Slug ── */}
          {step === 5 && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">
                Choose your profile URL
              </h2>
              <p className="text-[var(--text-secondary)] text-sm mb-6">
                This is the link you&apos;ll share with coaches. Pick something memorable.
              </p>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">Your URL</label>
                <div className="flex items-center gap-0">
                  <span className="px-3 py-2.5 bg-[var(--bg-tertiary)] border border-r-0 border-[var(--border-primary)] rounded-l-lg text-sm text-[var(--text-tertiary)] whitespace-nowrap">
                    strikingshowcase.com/
                  </span>
                  <input
                    className="input flex-1 rounded-l-none"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="your-name"
                  />
                </div>

                {/* Slug status indicator */}
                <div className="mt-2 h-5">
                  {slugChecking && (
                    <span className="text-xs text-[var(--text-tertiary)]">Checking availability...</span>
                  )}
                  {!slugChecking && slugAvailable === true && slug.length >= 3 && (
                    <span className="text-xs text-green-400 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Available!
                    </span>
                  )}
                  {!slugChecking && slugAvailable === false && (
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Already taken
                    </span>
                  )}
                </div>

                {/* Quick suggest */}
                {basicInfo.firstName && basicInfo.lastName && (
                  <button
                    type="button"
                    onClick={suggestSlug}
                    className="mt-2 text-xs text-gold hover:text-[var(--gold-light)] transition-colors"
                  >
                    Suggest: {basicInfo.firstName.toLowerCase()}-{basicInfo.lastName.toLowerCase()}
                  </button>
                )}
              </div>

              {/* Live preview */}
              {slug.length >= 3 && slugAvailable && (
                <div className="mt-6 p-4 rounded-lg bg-gold/5 border border-gold/20">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Your profile will be at:</p>
                  <p className="text-sm font-mono text-gold">strikingshowcase.com/{slug}</p>
                </div>
              )}
            </div>
          )}

          {/* ── Step 6: Done! ── */}
          {step === 6 && (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#660033] to-gold mx-auto mb-6 flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-3">
                You&apos;re all set!
              </h2>
              <p className="text-[var(--text-secondary)] mb-8 max-w-sm mx-auto">
                Your profile is live. Complete more sections from your dashboard to increase your visibility to coaches.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary w-full py-3 text-base font-bold rounded-lg"
                >
                  Go to Dashboard
                </button>
                {slug && (
                  <button
                    onClick={() => router.push(`/${slug}`)}
                    className="btn-secondary w-full py-3 text-base rounded-lg"
                  >
                    View My Public Profile
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── Navigation Buttons ── */}
          {step < 6 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--border-primary)]">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    Back
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {canSkip && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                  >
                    Skip for now
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={saving || (step === 5 && slugAvailable !== true)}
                  className="btn-primary px-8 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Saving...
                    </span>
                  ) : step === 5 ? (
                    'Finish Setup'
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Skip onboarding entirely */}
        {step < 6 && (
          <div className="text-center mt-6">
            <Link
              href="/dashboard"
              className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
              I&apos;ll do this later → Go to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
