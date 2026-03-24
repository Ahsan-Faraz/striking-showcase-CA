'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AthleteCard } from '@/components/athlete/AthleteCard';
import { cn } from '@/lib/utils';

interface SearchFilters {
  minAverage: string;
  maxAverage: string;
  classYear: string;
  state: string;
  hand: string;
  style: string;
  minGpa: string;
  division: string;
  gender: string;
}

interface AthleteResult {
  id: string;
  firstName: string;
  lastName: string;
  classYear: number;
  state: string | null;
  school: string | null;
  profilePhotoUrl: string | null;
  seasonAverage: number | null;
  highGame: number | null;
  highSeries: number | null;
  dominantHand: string | null;
  style: string | null;
  gpa: number | null;
  isActivelyRecruiting: boolean;
  usbcVerified: boolean;
}

export default function DiscoverPage() {
  const [athletes, setAthletes] = useState<AthleteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({
    minAverage: '',
    maxAverage: '',
    classYear: '',
    state: '',
    hand: '',
    style: '',
    minGpa: '',
    division: '',
    gender: '',
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params.append(key, val);
      });
      const res = await fetch(`/api/athletes?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAthletes(data.athletes || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <p className="section-label mb-1">Discovery</p>
          <h1 className="font-heading text-4xl font-bold">Discover Athletes</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Search and filter athletes by stats, location, and preferences
          </p>
        </div>
        <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="animate-in-delay-1 border-t-2 border-t-gold/30">
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1 uppercase tracking-wider font-mono">Min Average</label>
                <input className="input" type="number" placeholder="e.g. 180" value={filters.minAverage} onChange={(e) => updateFilter('minAverage', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1 uppercase tracking-wider font-mono">Max Average</label>
                <input className="input" type="number" placeholder="e.g. 250" value={filters.maxAverage} onChange={(e) => updateFilter('maxAverage', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1 uppercase tracking-wider font-mono">Class Year</label>
                <select className="input" value={filters.classYear} onChange={(e) => updateFilter('classYear', e.target.value)}>
                  <option value="">Any</option>
                  {[2025, 2026, 2027, 2028, 2029].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1 uppercase tracking-wider font-mono">State</label>
                <input className="input" placeholder="e.g. Kansas" value={filters.state} onChange={(e) => updateFilter('state', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1 uppercase tracking-wider font-mono">Hand</label>
                <select className="input" value={filters.hand} onChange={(e) => updateFilter('hand', e.target.value)}>
                  <option value="">Any</option>
                  <option value="RIGHT">Right</option>
                  <option value="LEFT">Left</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1 uppercase tracking-wider font-mono">Style</label>
                <select className="input" value={filters.style} onChange={(e) => updateFilter('style', e.target.value)}>
                  <option value="">Any</option>
                  <option value="ONE_HANDED">One-Handed</option>
                  <option value="TWO_HANDED">Two-Handed</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1 uppercase tracking-wider font-mono">Min GPA</label>
                <input className="input" type="number" step="0.1" max="4.0" placeholder="e.g. 3.0" value={filters.minGpa} onChange={(e) => updateFilter('minGpa', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1 uppercase tracking-wider font-mono">Gender</label>
                <select className="input" value={filters.gender} onChange={(e) => updateFilter('gender', e.target.value)}>
                  <option value="">Any</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-5 gap-3 pt-4 border-t border-[var(--border-secondary)]">
              <Button variant="ghost" size="sm" onClick={() => setFilters({ minAverage: '', maxAverage: '', classYear: '', state: '', hand: '', style: '', minGpa: '', division: '', gender: '' })}>
                Clear Filters
              </Button>
              <Button variant="primary" size="sm" onClick={handleSearch} loading={loading}>
                Search Athletes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)] font-mono">
          <span className="text-gold font-bold">{athletes.length}</span> athlete{athletes.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
        </div>
      ) : athletes.length === 0 ? (
        <Card className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-maroon/10 border border-maroon/20 flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="text-lg font-heading font-bold text-[var(--text-primary)]">No Athletes Found</p>
          <p className="text-sm text-[var(--text-tertiary)] mt-2 max-w-sm mx-auto">Try adjusting your filters to discover more athletes in our network</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {athletes.map((athlete) => (
            <AthleteCard key={athlete.id} athlete={athlete} />
          ))}
        </div>
      )}
    </div>
  );
}
