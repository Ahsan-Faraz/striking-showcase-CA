'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PhotoFrame } from '@/components/ui/PhotoFrame';
import { Toggle } from '@/components/ui/Toggle';
import { cn } from '@/lib/utils';
import {
  savePersonalInfo,
  saveBowlingStats,
  saveAcademicInfo,
  saveBio,
  savePrivacy,
} from './actions';

type Tab = 'personal' | 'bowling' | 'academics' | 'bio' | 'privacy';

interface ProfileData {
  firstName: string;
  lastName: string;
  classYear: number;
  state: string | null;
  school: string | null;
  gender: string | null;
  bio: string | null;
  profilePhotoUrl: string | null;
  dominantHand: string | null;
  style: string | null;
  seasonAverage: number | null;
  highGame: number | null;
  highSeries: number | null;
  revRate: number | null;
  ballSpeed: number | null;
  spareConversion: number | null;
  pap: string | null;
  axisTilt: number | null;
  axisRotation: number | null;
  coachName: string | null;
  coachContact: string | null;
  proShop: string | null;
  bowlingCenter: string | null;
  usbcClub: string | null;
  usbcId: string | null;
  gpa: number | null;
  act: number | null;
  sat: number | null;
  ncaaStatus: string | null;
  intendedMajor: string | null;
  isActivelyRecruiting: boolean;
  profileVisibility: string;
  preferredDivisions: string[];
  preferredRegions: string[];
}

const LABEL = 'block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono';

export default function ProfileEditor({ initial }: { initial: ProfileData }) {
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [profile, setProfile] = useState(initial);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isPending, startTransition] = useTransition();
  const [generatingBio, setGeneratingBio] = useState(false);

  const update = (field: string, value: unknown) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setSaveStatus('idle');
    startTransition(async () => {
      let result: { error?: string; success?: boolean };
      switch (activeTab) {
        case 'personal':
          result = await savePersonalInfo({
            firstName: profile.firstName,
            lastName: profile.lastName,
            classYear: profile.classYear,
            state: profile.state || null,
            school: profile.school || null,
            gender: profile.gender || null,
            dominantHand: profile.dominantHand || null,
            style: profile.style || null,
            coachName: profile.coachName || null,
            coachContact: profile.coachContact || null,
            proShop: profile.proShop || null,
            bowlingCenter: profile.bowlingCenter || null,
          });
          break;
        case 'bowling':
          result = await saveBowlingStats({
            seasonAverage: profile.seasonAverage,
            highGame: profile.highGame,
            highSeries: profile.highSeries,
            revRate: profile.revRate,
            ballSpeed: profile.ballSpeed,
            pap: profile.pap || null,
            axisTilt: profile.axisTilt,
            axisRotation: profile.axisRotation,
            spareConversion: profile.spareConversion,
            usbcId: profile.usbcId || null,
          });
          break;
        case 'academics':
          result = await saveAcademicInfo({
            gpa: profile.gpa,
            act: profile.act,
            sat: profile.sat,
            ncaaStatus: profile.ncaaStatus || null,
            intendedMajor: profile.intendedMajor || null,
          });
          break;
        case 'bio':
          result = await saveBio({ bio: profile.bio || null });
          break;
        case 'privacy':
          result = await savePrivacy({
            profileVisibility: profile.profileVisibility as 'PUBLIC' | 'PRIVATE',
            isActivelyRecruiting: profile.isActivelyRecruiting,
            preferredDivisions: profile.preferredDivisions,
            preferredRegions: profile.preferredRegions,
          });
          break;
        default:
          return;
      }
      if (result.error) {
        setSaveStatus('error');
      } else {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    });
  };

  const handlePhotoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'profile');
    try {
      const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) update('profilePhotoUrl', data.url);
    } catch { /* handled by UI */ }
  };

  const generateBio = async () => {
    setGeneratingBio(true);
    try {
      const res = await fetch('/api/ai/bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          classYear: profile.classYear,
          school: profile.school,
          state: profile.state,
          dominantHand: profile.dominantHand,
          style: profile.style,
          seasonAverage: profile.seasonAverage ?? undefined,
          highGame: profile.highGame ?? undefined,
          highSeries: profile.highSeries ?? undefined,
          gpa: profile.gpa ?? undefined,
          intendedMajor: profile.intendedMajor,
          personalStory: profile.bio || undefined,
        }),
      });
      const data = await res.json();
      if (data.bio) update('bio', data.bio);
    } catch { /* handled silently */ }
    setGeneratingBio(false);
  };

  const toggleDivision = (div: string) => {
    setProfile((prev) => ({
      ...prev,
      preferredDivisions: prev.preferredDivisions.includes(div)
        ? prev.preferredDivisions.filter((d) => d !== div)
        : [...prev.preferredDivisions, div],
    }));
  };

  const toggleRegion = (region: string) => {
    setProfile((prev) => ({
      ...prev,
      preferredRegions: prev.preferredRegions.includes(region)
        ? prev.preferredRegions.filter((r) => r !== region)
        : [...prev.preferredRegions, region],
    }));
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'bowling', label: 'Bowling Stats', icon: '🎳' },
    { id: 'academics', label: 'Academics', icon: '📚' },
    { id: 'bio', label: 'Bio', icon: '✏️' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <p className="section-label mb-1">Profile</p>
          <h1 className="font-heading text-4xl font-bold">Edit Profile</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Complete your profile to increase visibility with coaches
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus === 'success' && <span className="text-sm text-green-400 font-medium">Saved!</span>}
          {saveStatus === 'error' && <span className="text-sm text-red-400 font-medium">Save failed</span>}
          <Button variant="primary" onClick={handleSave} loading={isPending}>
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1.5 rounded-2xl bg-[var(--bg-tertiary)]/50 border border-[var(--border-primary)] animate-in-delay-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2',
              activeTab === tab.id
                ? 'bg-gradient-to-r from-maroon to-maroon-bright text-white shadow-lg shadow-maroon/20'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
            )}
          >
            <span className="text-xs">{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── PERSONAL INFO ──────────────────────────── */}
      {activeTab === 'personal' && (
        <Card className="animate-in">
          <CardContent className="space-y-6">
            <div className="flex items-start gap-6">
              <PhotoFrame src={profile.profilePhotoUrl} onUpload={handlePhotoUpload} size="lg" label="Profile Photo" />
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL}>First Name</label>
                    <input className="input" value={profile.firstName} onChange={(e) => update('firstName', e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL}>Last Name</label>
                    <input className="input" value={profile.lastName} onChange={(e) => update('lastName', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={LABEL}>Class Year</label>
                    <select className="input" value={profile.classYear} onChange={(e) => update('classYear', parseInt(e.target.value))}>
                      {[2025,2026,2027,2028,2029,2030,2031,2032,2033,2034,2035].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>State</label>
                    <input className="input" value={profile.state ?? ''} onChange={(e) => update('state', e.target.value)} placeholder="e.g. Kansas" />
                  </div>
                  <div>
                    <label className={LABEL}>Gender</label>
                    <select className="input" value={profile.gender ?? ''} onChange={(e) => update('gender', e.target.value)}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className={LABEL}>School</label>
              <input className="input" value={profile.school ?? ''} onChange={(e) => update('school', e.target.value)} placeholder="High school name" />
            </div>

            <div className="border-t border-[var(--border-primary)] pt-6">
              <h3 className="section-header">Coaching & Facilities</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Coach Name</label>
                <input className="input" value={profile.coachName ?? ''} onChange={(e) => update('coachName', e.target.value)} />
              </div>
              <div>
                <label className={LABEL}>Coach Contact</label>
                <input className="input" value={profile.coachContact ?? ''} onChange={(e) => update('coachContact', e.target.value)} />
              </div>
              <div>
                <label className={LABEL}>Pro Shop</label>
                <input className="input" value={profile.proShop ?? ''} onChange={(e) => update('proShop', e.target.value)} />
              </div>
              <div>
                <label className={LABEL}>Home Center</label>
                <input className="input" value={profile.bowlingCenter ?? ''} onChange={(e) => update('bowlingCenter', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── BOWLING STATS ──────────────────────────── */}
      {activeTab === 'bowling' && (
        <Card className="animate-in">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Dominant Hand</label>
                <div className="flex gap-2">
                  {(['RIGHT', 'LEFT'] as const).map((hand) => (
                    <button key={hand} onClick={() => update('dominantHand', hand)}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border',
                        profile.dominantHand === hand
                          ? 'bg-gradient-to-r from-maroon to-maroon-bright text-white border-maroon shadow-lg shadow-maroon/20'
                          : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-gold/30'
                      )}
                    >{hand === 'RIGHT' ? 'Right' : 'Left'}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className={LABEL}>Style</label>
                <div className="flex gap-2">
                  {(['ONE_HANDED', 'TWO_HANDED'] as const).map((s) => (
                    <button key={s} onClick={() => update('style', s)}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-xs font-medium transition-all duration-300 border',
                        profile.style === s
                          ? 'bg-gradient-to-r from-maroon to-maroon-bright text-white border-maroon shadow-lg shadow-maroon/20'
                          : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-gold/30'
                      )}
                    >{s === 'ONE_HANDED' ? '1-Hand' : '2-Hand'}</button>
                  ))}
                </div>
              </div>
            </div>

            <h3 className="section-header">Performance Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={LABEL}>Season Average</label>
                <input className="input" type="number" step="0.1" value={profile.seasonAverage ?? ''} onChange={(e) => update('seasonAverage', e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 213.5" />
              </div>
              <div>
                <label className={LABEL}>High Game</label>
                <input className="input" type="number" value={profile.highGame ?? ''} onChange={(e) => update('highGame', e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 289" />
              </div>
              <div>
                <label className={LABEL}>High Series</label>
                <input className="input" type="number" value={profile.highSeries ?? ''} onChange={(e) => update('highSeries', e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 782" />
              </div>
            </div>

            <h3 className="section-header">Technical Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={LABEL}>Rev Rate (RPM)</label>
                <input className="input" type="number" value={profile.revRate ?? ''} onChange={(e) => update('revRate', e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 375" />
              </div>
              <div>
                <label className={LABEL}>Ball Speed (MPH)</label>
                <input className="input" type="number" step="0.1" value={profile.ballSpeed ?? ''} onChange={(e) => update('ballSpeed', e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 17.5" />
              </div>
              <div>
                <label className={LABEL}>Spare Conv. %</label>
                <input className="input" type="number" step="0.1" value={profile.spareConversion ?? ''} onChange={(e) => update('spareConversion', e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 87.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>PAP</label>
                <input className="input" value={profile.pap ?? ''} onChange={(e) => update('pap', e.target.value)} placeholder="e.g. 5 1/2 over, 1/2 up" />
              </div>
              <div>
                <label className={LABEL}>USBC ID</label>
                <input className="input" value={profile.usbcId ?? ''} onChange={(e) => update('usbcId', e.target.value)} placeholder="e.g. 12345678" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>Axis Tilt (°)</label>
                <input className="input" type="number" step="0.1" value={profile.axisTilt ?? ''} onChange={(e) => update('axisTilt', e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 15" />
              </div>
              <div>
                <label className={LABEL}>Axis Rotation (°)</label>
                <input className="input" type="number" step="0.1" value={profile.axisRotation ?? ''} onChange={(e) => update('axisRotation', e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 45" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── ACADEMICS ──────────────────────────────── */}
      {activeTab === 'academics' && (
        <Card className="animate-in">
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={LABEL}>GPA</label>
                <input className="input" type="number" step="0.01" max="5.0" value={profile.gpa ?? ''} onChange={(e) => update('gpa', e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 3.85" />
              </div>
              <div>
                <label className={LABEL}>ACT Score</label>
                <input className="input" type="number" max="36" value={profile.act ?? ''} onChange={(e) => update('act', e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 28" />
              </div>
              <div>
                <label className={LABEL}>SAT Score</label>
                <input className="input" type="number" max="1600" value={profile.sat ?? ''} onChange={(e) => update('sat', e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 1280" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LABEL}>NCAA Eligibility</label>
                <select className="input" value={profile.ncaaStatus ?? 'Pending'} onChange={(e) => update('ncaaStatus', e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Eligible">Eligible</option>
                  <option value="Not Started">Not Started</option>
                </select>
              </div>
              <div>
                <label className={LABEL}>Intended Major</label>
                <input className="input" value={profile.intendedMajor ?? ''} onChange={(e) => update('intendedMajor', e.target.value)} placeholder="e.g. Business Administration" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── BIO ────────────────────────────────────── */}
      {activeTab === 'bio' && (
        <Card className="animate-in">
          <CardContent className="space-y-4">
            <div>
              <label className={LABEL}>Bio</label>
              <textarea
                className="input min-h-[180px] resize-y"
                value={profile.bio ?? ''}
                onChange={(e) => update('bio', e.target.value.slice(0, 500))}
                placeholder="Tell coaches about yourself, your bowling journey, and your goals..."
                rows={6}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-[var(--text-tertiary)] font-mono">{(profile.bio ?? '').length}/500 characters</p>
                <Button variant="ghost" size="sm" loading={generatingBio} onClick={generateBio}>
                  Generate with AI
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── PRIVACY & PREFERENCES ──────────────────── */}
      {activeTab === 'privacy' && (
        <Card className="animate-in">
          <CardContent className="space-y-6">
            <Toggle
              checked={profile.isActivelyRecruiting}
              onChange={(v) => update('isActivelyRecruiting', v)}
              label="Actively Recruiting"
              description="Show coaches that you are open to recruitment opportunities"
            />
            <div>
              <label className={LABEL}>Profile Visibility</label>
              <select className="input mt-1" value={profile.profileVisibility} onChange={(e) => update('profileVisibility', e.target.value)}>
                <option value="PUBLIC">Public — visible to everyone</option>
                <option value="PRIVATE">Private — only you can see your profile</option>
              </select>
            </div>

            <div className="border-t border-[var(--border-primary)] pt-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Interested Divisions</h3>
              <div className="flex flex-wrap gap-2">
                {['D1', 'D2', 'D3', 'NAIA', 'NJCAA'].map((div) => (
                  <button key={div} onClick={() => toggleDivision(div)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      profile.preferredDivisions.includes(div)
                        ? 'bg-gold/20 border-gold/40 text-gold'
                        : 'bg-[var(--bg-card)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-gold/30'
                    )}
                  >{div}</button>
                ))}
              </div>
            </div>

            <div className="border-t border-[var(--border-primary)] pt-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Preferred Regions</h3>
              <div className="flex flex-wrap gap-2">
                {['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'].map((region) => (
                  <button key={region} onClick={() => toggleRegion(region)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      profile.preferredRegions.includes(region)
                        ? 'bg-gold/20 border-gold/40 text-gold'
                        : 'bg-[var(--bg-card)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-gold/30'
                    )}
                  >{region}</button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sticky Save */}
      <div className="sticky bottom-4">
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave} loading={isPending}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
