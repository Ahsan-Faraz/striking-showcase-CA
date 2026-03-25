'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const CLASS_YEARS = [2025, 2026, 2027, 2028, 2029];
const DIVISIONS = ['D1', 'D2', 'D3', 'NAIA', 'JUCO'];
const REV_RATE_OPTIONS = [
  { value: 'low', label: 'Low (<250)' },
  { value: 'medium', label: 'Medium (250-349)' },
  { value: 'high', label: 'High (350-449)' },
  { value: 'elite', label: 'Elite (450+)' },
];
const SORT_OPTIONS = [
  { value: 'average', label: 'Average' },
  { value: 'revRate', label: 'Rev Rate' },
  { value: 'gradYear', label: 'Grad Year' },
  { value: 'lastActive', label: 'Last Active' },
  { value: 'gpa', label: 'GPA' },
];
const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming',
];

interface SearchFiltersProps {
  show: boolean;
  onToggle: () => void;
}

export function SearchFilters({ show, onToggle }: SearchFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Read current filters from URL
  const getParam = (key: string) => searchParams.get(key) || '';
  const getMulti = (key: string) => {
    const val = searchParams.get(key);
    return val ? val.split(',') : [];
  };

  const [classYears, setClassYears] = useState<string[]>(getMulti('classYear'));
  const [state, setState] = useState(getParam('state'));
  const [divisions, setDivisions] = useState<string[]>(getMulti('division'));
  const [avgMin, setAvgMin] = useState(getParam('avgMin'));
  const [avgMax, setAvgMax] = useState(getParam('avgMax'));
  const [revRate, setRevRate] = useState(getParam('revRate'));
  const [handed, setHanded] = useState(getParam('handed'));
  const [gender, setGender] = useState(getParam('gender'));
  const [gpaMin, setGpaMin] = useState(getParam('gpaMin'));
  const [gpaMax, setGpaMax] = useState(getParam('gpaMax'));
  const [hasVideo, setHasVideo] = useState(getParam('hasVideo') === 'true');
  const [hasUsbc, setHasUsbc] = useState(getParam('hasUsbc') === 'true');
  const [lastActive, setLastActive] = useState(getParam('lastActive'));

  const toggleMulti = (arr: string[], value: string, setter: (v: string[]) => void) => {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const countActiveFilters = () => {
    let count = 0;
    if (classYears.length) count++;
    if (state) count++;
    if (divisions.length) count++;
    if (avgMin || avgMax) count++;
    if (revRate) count++;
    if (handed) count++;
    if (gender) count++;
    if (gpaMin || gpaMax) count++;
    if (hasVideo) count++;
    if (hasUsbc) count++;
    if (lastActive) count++;
    return count;
  };

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (classYears.length) params.set('classYear', classYears.join(','));
    if (state) params.set('state', state);
    if (divisions.length) params.set('division', divisions.join(','));
    if (avgMin) params.set('avgMin', avgMin);
    if (avgMax) params.set('avgMax', avgMax);
    if (revRate) params.set('revRate', revRate);
    if (handed) params.set('handed', handed);
    if (gender) params.set('gender', gender);
    if (gpaMin) params.set('gpaMin', gpaMin);
    if (gpaMax) params.set('gpaMax', gpaMax);
    if (hasVideo) params.set('hasVideo', 'true');
    if (hasUsbc) params.set('hasUsbc', 'true');
    if (lastActive) params.set('lastActive', lastActive);

    // Preserve sort/order/view from URL
    const sort = searchParams.get('sort');
    const order = searchParams.get('order');
    const view = searchParams.get('view');
    if (sort) params.set('sort', sort);
    if (order) params.set('order', order);
    if (view) params.set('view', view);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [classYears, state, divisions, avgMin, avgMax, revRate, handed, gender, gpaMin, gpaMax, hasVideo, hasUsbc, lastActive, router, pathname, searchParams, startTransition]);

  const clearFilters = useCallback(() => {
    setClassYears([]);
    setState('');
    setDivisions([]);
    setAvgMin('');
    setAvgMax('');
    setRevRate('');
    setHanded('');
    setGender('');
    setGpaMin('');
    setGpaMax('');
    setHasVideo(false);
    setHasUsbc(false);
    setLastActive('');

    const params = new URLSearchParams();
    const sort = searchParams.get('sort');
    const order = searchParams.get('order');
    const view = searchParams.get('view');
    if (sort) params.set('sort', sort);
    if (order) params.set('order', order);
    if (view) params.set('view', view);

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }, [router, pathname, searchParams, startTransition]);

  const activeCount = countActiveFilters();

  const labelCls = 'block text-xs font-medium text-[var(--text-tertiary)] mb-1 uppercase tracking-wider font-mono';
  const inputCls = 'input';

  return (
    <>
      {/* Toggle button */}
      <Button variant="secondary" onClick={onToggle}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
        {show ? 'Hide Filters' : 'Show Filters'}
        {activeCount > 0 && (
          <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-gold text-maroon-dark text-xs font-bold">
            {activeCount}
          </span>
        )}
      </Button>

      {/* Filter Panel */}
      {show && (
        <Card className="animate-in-delay-1 border-t-2 border-t-gold/30">
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Graduation Year — multi-select chips */}
              <div className="col-span-2 md:col-span-3 lg:col-span-4">
                <label className={labelCls}>Graduation Year</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CLASS_YEARS.map((y) => (
                    <button
                      key={y}
                      onClick={() => toggleMulti(classYears, String(y), setClassYears)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        classYears.includes(String(y))
                          ? 'bg-gold text-maroon-dark border-gold'
                          : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-secondary)] hover:border-gold/50'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* State */}
              <div>
                <label className={labelCls}>State / Region</label>
                <select className={inputCls} value={state} onChange={(e) => setState(e.target.value)}>
                  <option value="">Any State</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Division Interest — multi-select chips */}
              <div className="col-span-2 md:col-span-2">
                <label className={labelCls}>Division Interest</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {DIVISIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => toggleMulti(divisions, d, setDivisions)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                        divisions.includes(d)
                          ? 'bg-gold text-maroon-dark border-gold'
                          : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-secondary)] hover:border-gold/50'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Handed */}
              <div>
                <label className={labelCls}>Handed</label>
                <select className={inputCls} value={handed} onChange={(e) => setHanded(e.target.value)}>
                  <option value="">Any</option>
                  <option value="LEFT">Left</option>
                  <option value="RIGHT">Right</option>
                </select>
              </div>

              {/* Average Range */}
              <div>
                <label className={labelCls}>Min Average</label>
                <input className={inputCls} type="number" placeholder="e.g. 180" value={avgMin} onChange={(e) => setAvgMin(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Max Average</label>
                <input className={inputCls} type="number" placeholder="e.g. 250" value={avgMax} onChange={(e) => setAvgMax(e.target.value)} />
              </div>

              {/* Rev Rate */}
              <div>
                <label className={labelCls}>Rev Rate</label>
                <select className={inputCls} value={revRate} onChange={(e) => setRevRate(e.target.value)}>
                  <option value="">Any</option>
                  {REV_RATE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className={labelCls}>Gender</label>
                <select className={inputCls} value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* GPA Range */}
              <div>
                <label className={labelCls}>Min GPA</label>
                <input className={inputCls} type="number" step="0.1" min="0" max="4.0" placeholder="e.g. 3.0" value={gpaMin} onChange={(e) => setGpaMin(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Max GPA</label>
                <input className={inputCls} type="number" step="0.1" min="0" max="4.0" placeholder="e.g. 4.0" value={gpaMax} onChange={(e) => setGpaMax(e.target.value)} />
              </div>

              {/* Last Active */}
              <div>
                <label className={labelCls}>Last Active</label>
                <select className={inputCls} value={lastActive} onChange={(e) => setLastActive(e.target.value)}>
                  <option value="">Any</option>
                  <option value="30">Last 30 days</option>
                  <option value="60">Last 60 days</option>
                  <option value="90">Last 90 days</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="col-span-2 md:col-span-3 lg:col-span-4 flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[var(--border-secondary)] text-gold focus:ring-gold/50"
                    checked={hasVideo}
                    onChange={(e) => setHasVideo(e.target.checked)}
                  />
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                    Has Highlight Video
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[var(--border-secondary)] text-gold focus:ring-gold/50"
                    checked={hasUsbc}
                    onChange={(e) => setHasUsbc(e.target.checked)}
                  />
                  <span className="text-sm text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                    USBC Verified
                  </span>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end mt-5 gap-3 pt-4 border-t border-[var(--border-secondary)]">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
              <Button variant="primary" size="sm" onClick={applyFilters} loading={isPending}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

/** Sort + view controls bar */
export function SearchControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSort = searchParams.get('sort') || 'average';
  const currentOrder = searchParams.get('order') || 'desc';
  const currentView = searchParams.get('view') || 'card';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    if (key === 'sort' || key === 'order') params.delete('page');
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="flex items-center gap-3">
      {/* Sort */}
      <select
        className="input py-1.5 text-sm w-auto"
        value={currentSort}
        onChange={(e) => updateParam('sort', e.target.value)}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {/* Order toggle */}
      <button
        onClick={() => updateParam('order', currentOrder === 'desc' ? 'asc' : 'desc')}
        className="p-1.5 rounded-lg border border-[var(--border-secondary)] hover:border-gold/50 transition-colors"
        title={currentOrder === 'desc' ? 'Descending' : 'Ascending'}
      >
        <svg className={`w-4 h-4 text-[var(--text-secondary)] transition-transform ${currentOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
        </svg>
      </button>

      {/* View toggle */}
      <div className="flex rounded-lg border border-[var(--border-secondary)] overflow-hidden">
        <button
          onClick={() => updateParam('view', 'card')}
          className={`p-1.5 transition-colors ${currentView === 'card' ? 'bg-gold/20 text-gold' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
          title="Card view"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        </button>
        <button
          onClick={() => updateParam('view', 'list')}
          className={`p-1.5 transition-colors border-l border-[var(--border-secondary)] ${currentView === 'list' ? 'bg-gold/20 text-gold' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
          title="List view"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
