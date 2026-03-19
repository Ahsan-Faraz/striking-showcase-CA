'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PhotoFrame } from '@/components/ui/PhotoFrame';
import { Toggle } from '@/components/ui/Toggle';
import { ArticleManager, Article } from '@/components/ui/ArticleManager';
import { cn } from '@/lib/utils';

type Tab = 'personal' | 'bowling' | 'academics' | 'preferences' | 'articles';

export default function ProfileEditorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('personal');
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    classYear: 2026,
    state: '',
    school: '',
    gender: '',
    bio: '',
    profilePhotoUrl: null as string | null,
    dominantHand: 'RIGHT',
    style: 'ONE_HANDED',
    seasonAverage: '',
    highGame: '',
    highSeries: '',
    revRate: '',
    ballSpeed: '',
    spareConversion: '',
    coachName: '',
    coachContact: '',
    proShop: '',
    bowlingCenter: '',
    usbcClub: '',
    gpa: '',
    act: '',
    sat: '',
    ncaaStatus: 'Pending',
    intendedMajor: '',
    isActivelyRecruiting: true,
    profileVisibility: 'PUBLIC',
  });
  const [articles, setArticles] = useState<Article[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [generatingBio, setGeneratingBio] = useState(false);

  // Load current profile data on mount
  useEffect(() => {
    fetch('/api/athletes/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.athlete) {
          const a = data.athlete;
          setProfile((prev) => ({
            ...prev,
            firstName: a.firstName || '',
            lastName: a.lastName || '',
            classYear: a.classYear || 2026,
            state: a.state || '',
            school: a.school || '',
            gender: a.gender || '',
            bio: a.bio || '',
            profilePhotoUrl: a.profilePhotoUrl || null,
            dominantHand: a.dominantHand || 'RIGHT',
            style: a.style || 'ONE_HANDED',
            seasonAverage: a.seasonAverage ?? '',
            highGame: a.highGame ?? '',
            highSeries: a.highSeries ?? '',
            revRate: a.revRate ?? '',
            ballSpeed: a.ballSpeed ?? '',
            spareConversion: a.spareConversion ?? '',
            coachName: a.coachName || '',
            coachContact: a.coachContact || '',
            proShop: a.proShop || '',
            bowlingCenter: a.bowlingCenter || '',
            usbcClub: a.usbcClub || '',
            gpa: a.gpa ?? '',
            act: a.act ?? '',
            sat: a.sat ?? '',
            ncaaStatus: a.ncaaStatus || 'Pending',
            intendedMajor: a.intendedMajor || '',
            isActivelyRecruiting: a.isActivelyRecruiting ?? true,
            profileVisibility: a.profileVisibility || 'PUBLIC',
            usbcId: a.usbcId || '',
          }));
        }
      })
      .catch(() => {});
  }, []);

  const updateField = (field: string, value: unknown) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      const res = await fetch('/api/athletes/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'profile');

    try {
      const res = await fetch('/api/media/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        updateField('profilePhotoUrl', data.url);
      }
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'bowling', label: 'Bowling Stats', icon: '🎳' },
    { id: 'academics', label: 'Academics', icon: '📚' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'articles', label: 'Articles', icon: '📰' },
  ] as const;

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
          <Button variant="primary" onClick={handleSave} loading={saving}>
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
            {tab.label}
          </button>
        ))}
      </div>

      {/* Personal Info */}
      {activeTab === 'personal' && (
        <Card className="animate-in">
          <CardContent className="space-y-6">
            <div className="flex items-start gap-6">
              <PhotoFrame
                src={profile.profilePhotoUrl}
                onUpload={handlePhotoUpload}
                size="lg"
                label="Profile Photo"
              />
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">First Name</label>
                    <input className="input" value={profile.firstName} onChange={(e) => updateField('firstName', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Last Name</label>
                    <input className="input" value={profile.lastName} onChange={(e) => updateField('lastName', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Class Year</label>
                    <select className="input" value={profile.classYear} onChange={(e) => updateField('classYear', parseInt(e.target.value))}>
                      {[2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">State</label>
                    <input className="input" value={profile.state} onChange={(e) => updateField('state', e.target.value)} placeholder="e.g. Kansas" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Gender</label>
                    <select className="input" value={profile.gender} onChange={(e) => updateField('gender', e.target.value)}>
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">School</label>
              <input className="input" value={profile.school} onChange={(e) => updateField('school', e.target.value)} placeholder="High school name" />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Bio</label>
              <textarea
                className="input min-h-[120px] resize-y"
                value={profile.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="Tell coaches about yourself, your bowling journey, and your goals..."
                rows={4}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-[var(--text-tertiary)] font-mono">{profile.bio.length}/500 characters</p>
                <Button variant="ghost" size="sm" loading={generatingBio} onClick={async () => {
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
                        seasonAverage: profile.seasonAverage ? Number(profile.seasonAverage) : undefined,
                        highGame: profile.highGame ? Number(profile.highGame) : undefined,
                        highSeries: profile.highSeries ? Number(profile.highSeries) : undefined,
                        gpa: profile.gpa ? Number(profile.gpa) : undefined,
                        intendedMajor: profile.intendedMajor,
                        personalStory: profile.bio || undefined,
                      }),
                    });
                    const data = await res.json();
                    if (data.bio) {
                      updateField('bio', data.bio);
                    } else {
                      alert(data.error || 'AI generation failed');
                    }
                  } catch {
                    alert('AI generation failed');
                  } finally {
                    setGeneratingBio(false);
                  }
                }}>
                  Generate with AI
                </Button>
              </div>
            </div>

            <div className="border-t border-[var(--border-primary)] pt-6">
              <h3 className="section-header">Coaching & Facilities</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Coach Name</label>
                <input className="input" value={profile.coachName} onChange={(e) => updateField('coachName', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Coach Contact</label>
                <input className="input" value={profile.coachContact} onChange={(e) => updateField('coachContact', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Pro Shop</label>
                <input className="input" value={profile.proShop} onChange={(e) => updateField('proShop', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Home Center</label>
                <input className="input" value={profile.bowlingCenter} onChange={(e) => updateField('bowlingCenter', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">USBC League</label>
                <input className="input" value={profile.usbcClub || ''} onChange={(e) => updateField('usbcClub', e.target.value)} placeholder="e.g. Wednesday Night Mixed" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">USBC ID Number</label>
                <input className="input" value={(profile as any).usbcId || ''} onChange={(e) => updateField('usbcId', e.target.value)} placeholder="e.g. 12345678" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bowling Stats */}
      {activeTab === 'bowling' && (
        <Card className="animate-in">
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Dominant Hand</label>
                <div className="flex gap-2">
                  {(['RIGHT', 'LEFT'] as const).map((hand) => (
                    <button
                      key={hand}
                      onClick={() => updateField('dominantHand', hand)}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border',
                        profile.dominantHand === hand
                          ? 'bg-gradient-to-r from-maroon to-maroon-bright text-white border-maroon shadow-lg shadow-maroon/20'
                          : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-gold/30'
                      )}
                    >
                      {hand === 'RIGHT' ? 'Right' : 'Left'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Style</label>
                <div className="flex gap-2">
                  {(['ONE_HANDED', 'TWO_HANDED'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => updateField('style', style)}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border',
                        profile.style === style
                          ? 'bg-gradient-to-r from-maroon to-maroon-bright text-white border-maroon shadow-lg shadow-maroon/20'
                          : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-primary)] hover:border-gold/30'
                      )}
                    >
                      {style === 'ONE_HANDED' ? '1-Hand' : '2-Hand'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <h3 className="section-header">Performance Stats</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Season Average</label>
                <input className="input" type="number" step="0.1" value={profile.seasonAverage} onChange={(e) => updateField('seasonAverage', e.target.value)} placeholder="e.g. 213.5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">High Game</label>
                <input className="input" type="number" value={profile.highGame} onChange={(e) => updateField('highGame', e.target.value)} placeholder="e.g. 289" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">High Series</label>
                <input className="input" type="number" value={profile.highSeries} onChange={(e) => updateField('highSeries', e.target.value)} placeholder="e.g. 782" />
              </div>
            </div>

            <h3 className="section-header">Technical Stats</h3>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Rev Rate (RPM)</label>
                <input className="input" type="number" value={profile.revRate} onChange={(e) => updateField('revRate', e.target.value)} placeholder="e.g. 375" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Ball Speed (MPH)</label>
                <input className="input" type="number" step="0.1" value={profile.ballSpeed} onChange={(e) => updateField('ballSpeed', e.target.value)} placeholder="e.g. 17.5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Spare Conv. %</label>
                <input className="input" type="number" step="0.1" value={profile.spareConversion} onChange={(e) => updateField('spareConversion', e.target.value)} placeholder="e.g. 87.5" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Academics */}
      {activeTab === 'academics' && (
        <Card className="animate-in">
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">GPA</label>
                <input className="input" type="number" step="0.01" max="4.0" value={profile.gpa} onChange={(e) => updateField('gpa', e.target.value)} placeholder="e.g. 3.85" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">ACT Score</label>
                <input className="input" type="number" max="36" value={profile.act} onChange={(e) => updateField('act', e.target.value)} placeholder="e.g. 28" />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">SAT Score</label>
                <input className="input" type="number" max="1600" value={profile.sat} onChange={(e) => updateField('sat', e.target.value)} placeholder="e.g. 1280" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">NCAA Eligibility</label>
                <select className="input" value={profile.ncaaStatus} onChange={(e) => updateField('ncaaStatus', e.target.value)}>
                  <option value="Pending">Pending</option>
                  <option value="Eligible">Eligible</option>
                  <option value="Not Started">Not Started</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1.5 uppercase tracking-wider font-mono">Intended Major</label>
                <input className="input" value={profile.intendedMajor} onChange={(e) => updateField('intendedMajor', e.target.value)} placeholder="e.g. Business Administration" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferences */}
      {activeTab === 'preferences' && (
        <Card className="animate-in">
          <CardContent className="space-y-6">
            <Toggle
              checked={profile.isActivelyRecruiting}
              onChange={(v) => updateField('isActivelyRecruiting', v)}
              label="Actively Recruiting"
              description="Show coaches that you are open to recruitment opportunities"
            />
            <Toggle
              checked={profile.profileVisibility === 'PUBLIC'}
              onChange={(v) => updateField('profileVisibility', v ? 'PUBLIC' : 'PRIVATE')}
              label="Public Profile"
              description="Allow your profile to appear in coach search results"
            />

            <div className="border-t border-[var(--border-primary)] pt-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Interested In</h3>
              <div className="flex flex-wrap gap-2">
                {['D1', 'D2', 'D3', 'NAIA', 'NJCAA'].map((div) => (
                  <button key={div} className="badge badge-division cursor-pointer hover:bg-blue-500/30 hover:border-blue-400/50 transition-all">{div}</button>
                ))}
              </div>
            </div>

            <div className="border-t border-[var(--border-primary)] pt-6">
              <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Preferred Regions</h3>
              <div className="flex flex-wrap gap-2">
                {['Northeast', 'Southeast', 'Midwest', 'Southwest', 'West'].map((region) => (
                  <button key={region} className="badge badge-division cursor-pointer hover:bg-blue-500/30 hover:border-blue-400/50 transition-all">{region}</button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Articles */}
      {activeTab === 'articles' && (
        <div className="animate-in">
          <ArticleManager articles={articles} onChange={setArticles} />
        </div>
      )}

      {/* Sticky Save */}
      <div className="sticky bottom-4">
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
