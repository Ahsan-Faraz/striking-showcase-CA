import { redirect } from 'next/navigation';
import { verifySession, searchAthletes, getSavedSearches, type SearchFilters } from '@/lib/dal';
import SearchResultsClient from './SearchResultsClient';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await verifySession();
  if (!user) redirect('/login');
  if (user.role !== 'COACH') redirect('/dashboard');

  const coachProfile = user.coachProfile;
  if (!coachProfile) redirect('/coaches/signup');

  // Build filter params from URL
  const filters: SearchFilters = {};
  const paramKeys: (keyof SearchFilters)[] = [
    'classYear', 'state', 'division', 'avgMin', 'avgMax', 'revRate',
    'handed', 'gender', 'gpaMin', 'gpaMax', 'hasVideo', 'hasUsbc',
    'lastActive', 'sort', 'order', 'page', 'limit',
  ];
  for (const key of paramKeys) {
    const val = searchParams[key];
    if (typeof val === 'string') {
      filters[key] = val;
    }
  }

  // Parallel data fetching
  const [searchResults, savedSearches] = await Promise.all([
    searchAthletes(filters, coachProfile.id),
    getSavedSearches(coachProfile.id),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <SearchResultsClient
        athletes={searchResults.athletes.map((a) => ({
          ...a,
          updatedAt: a.updatedAt.toISOString(),
        }))}
        pagination={searchResults.pagination}
        isCoachVerified={coachProfile.isVerified}
        savedSearches={savedSearches}
        coachProfileId={coachProfile.id}
      />
    </div>
  );
}
