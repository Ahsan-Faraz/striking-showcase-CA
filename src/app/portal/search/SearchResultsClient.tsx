'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SearchAthleteCard, AthleteListRow, type SearchAthleteResult } from './SearchResults';
import { SearchFilters, SearchControls } from './SearchFilters';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SearchResultsClientProps {
  athletes: SearchAthleteResult[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
  isCoachVerified: boolean;
  savedSearches: { id: string; name: string; filtersJson: unknown; emailAlerts: boolean }[];
  coachProfileId: string;
}

export default function SearchResultsClient({
  athletes: initialAthletes,
  pagination,
  isCoachVerified,
  savedSearches,
  coachProfileId,
}: SearchResultsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') || 'card';

  const [athletes, setAthletes] = useState(initialAthletes);
  const [showFilters, setShowFilters] = useState(true);
  const [savingSearch, setSavingSearch] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [searchName, setSearchName] = useState('');

  // Update local state when server re-renders with new data
  if (initialAthletes !== athletes && JSON.stringify(initialAthletes) !== JSON.stringify(athletes)) {
    setAthletes(initialAthletes);
  }

  const handleAddToBoard = useCallback(async (athleteId: string, status: string) => {
    try {
      // Check if already on board (has a boardStatus)
      const existing = athletes.find((a) => a.id === athleteId);
      if (existing?.boardStatus) {
        // Update status via PATCH
        const res = await fetch('/api/watchlist', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ athleteId, status }),
        });
        if (res.ok) {
          setAthletes((prev) =>
            prev.map((a) => (a.id === athleteId ? { ...a, boardStatus: status } : a)),
          );
        }
      } else {
        // Add to board via POST
        const res = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ athleteId, status }),
        });
        if (res.ok) {
          setAthletes((prev) =>
            prev.map((a) => (a.id === athleteId ? { ...a, boardStatus: status } : a)),
          );
        }
      }
    } catch (err) {
      console.error('Board action failed:', err);
    }
  }, [athletes]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) return;
    setSavingSearch(true);
    try {
      // Build filters object from current search params
      const filters: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        if (!['page', 'sort', 'order', 'view'].includes(key)) {
          filters[key] = value;
        }
      });

      const res = await fetch('/api/portal/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: searchName.trim(), filtersJson: filters }),
      });
      if (res.ok) {
        setSaveModalOpen(false);
        setSearchName('');
        router.refresh();
      }
    } catch (err) {
      console.error('Save search failed:', err);
    } finally {
      setSavingSearch(false);
    }
  };

  const handleLoadSearch = (filtersJson: unknown) => {
    const filters = filtersJson as Record<string, string>;
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleDeleteSearch = async (id: string) => {
    try {
      const res = await fetch(`/api/portal/saved-searches?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (res.ok) router.refresh();
    } catch (err) {
      console.error('Delete search failed:', err);
    }
  };

  const hasActiveFilters = Array.from(searchParams.entries()).some(
    ([key]) => !['page', 'sort', 'order', 'view'].includes(key),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between animate-in">
        <div>
          <p className="section-label mb-1">Discovery</p>
          <h1 className="font-heading text-4xl font-bold">Discover Athletes</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Search and filter athletes by stats, location, and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={() => setSaveModalOpen(true)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
              </svg>
              Save Search
            </Button>
          )}
          <SearchFilters show={showFilters} onToggle={() => setShowFilters(!showFilters)} />
        </div>
      </div>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap animate-in-delay-1">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">Saved:</span>
          {savedSearches.map((s) => (
            <div key={s.id} className="flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-secondary)] rounded-full px-3 py-1">
              <button
                onClick={() => handleLoadSearch(s.filtersJson)}
                className="text-xs text-[var(--text-secondary)] hover:text-gold transition-colors"
              >
                {s.name}
              </button>
              <button
                onClick={() => handleDeleteSearch(s.id)}
                className="text-[var(--text-tertiary)] hover:text-red-400 ml-1 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)] font-mono">
          <span className="text-gold font-bold">{pagination.total}</span> athlete{pagination.total !== 1 ? 's' : ''} found
        </p>
        <SearchControls />
      </div>

      {/* Results */}
      {athletes.length === 0 ? (
        <Card className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-maroon/10 border border-maroon/20 flex items-center justify-center mx-auto mb-5">
            <svg className="w-10 h-10 text-gold/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <p className="text-lg font-heading font-bold text-[var(--text-primary)]">No Athletes Found</p>
          <p className="text-sm text-[var(--text-tertiary)] mt-2 max-w-sm mx-auto">
            Try adjusting your filters to discover more athletes in our network
          </p>
        </Card>
      ) : currentView === 'list' ? (
        <Card variant="glass" padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-[var(--border-secondary)]">
                <tr>
                  <th className="py-3 px-4 text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)]">Athlete</th>
                  <th className="py-3 px-3 text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)] text-center">Year</th>
                  <th className="py-3 px-3 text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)] text-center">Avg</th>
                  <th className="py-3 px-3 text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)] text-center">High</th>
                  <th className="py-3 px-3 text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)] text-center">Rev</th>
                  <th className="py-3 px-3 text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)] text-center">GPA</th>
                  <th className="py-3 px-3 text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)] text-center">Hand</th>
                  <th className="py-3 px-3 text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)] text-center">Tags</th>
                  <th className="py-3 px-3 text-xs font-mono uppercase tracking-wider text-[var(--text-tertiary)] text-center">Board</th>
                </tr>
              </thead>
              <tbody>
                {athletes.map((athlete) => (
                  <AthleteListRow
                    key={athlete.id}
                    athlete={athlete}
                    onAddToBoard={handleAddToBoard}
                    isCoachVerified={isCoachVerified}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {athletes.map((athlete) => (
            <SearchAthleteCard
              key={athlete.id}
              athlete={athlete}
              onAddToBoard={handleAddToBoard}
              isCoachVerified={isCoachVerified}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (pagination.totalPages <= 7) {
                pageNum = i + 1;
              } else if (pagination.page <= 4) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 3) {
                pageNum = pagination.totalPages - 6 + i;
              } else {
                pageNum = pagination.page - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-mono transition-colors ${
                    pageNum === pagination.page
                      ? 'bg-gold text-maroon-dark font-bold'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Save Search Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent>
              <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] mb-4">Save Search</h2>
              <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-1 uppercase tracking-wider font-mono">
                Search Name
              </label>
              <input
                className="input mb-4"
                placeholder="e.g. D1 Lefties 200+ Average"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-3">
                <Button variant="ghost" size="sm" onClick={() => { setSaveModalOpen(false); setSearchName(''); }}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveSearch}
                  loading={savingSearch}
                  disabled={!searchName.trim()}
                >
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
