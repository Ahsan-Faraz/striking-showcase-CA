/** Shared types for the Kanban board */

export interface BoardAthlete {
  id: string;
  slug: string | null;
  firstName: string;
  lastName: string;
  classYear: number;
  school: string | null;
  state: string | null;
  profilePhotoUrl: string | null;
  seasonAverage: number | null;
  highGame: number | null;
  highSeries: number | null;
  revRate: number | null;
  ballSpeed: number | null;
  dominantHand: string | null;
  style: string | null;
  gpa: number | null;
  divisionInterest: string | null;
  preferredDivisions: string[];
}

export interface BoardActivity {
  id: string;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  details: string | null;
  createdAt: string;
}

export interface SerializedBoardEntry {
  id: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  athlete: BoardAthlete;
  lastMessage: { content: string; createdAt: string } | null;
  daysInactive: number;
  activities: BoardActivity[];
}

export type ColumnKey = 'TRACKING' | 'CONTACTED' | 'VISITED' | 'OFFERED' | 'COMMITTED' | 'PASSED';

export type SerializedBoardColumns = Record<ColumnKey, SerializedBoardEntry[]>;

export const COLUMN_ORDER: ColumnKey[] = [
  'TRACKING',
  'CONTACTED',
  'VISITED',
  'OFFERED',
  'COMMITTED',
  'PASSED',
];

export const COLUMN_LABELS: Record<ColumnKey, string> = {
  TRACKING: 'Tracking',
  CONTACTED: 'Contacted',
  VISITED: 'Visited',
  OFFERED: 'Offered',
  COMMITTED: 'Committed',
  PASSED: 'Passed',
};

export const COLUMN_COLORS: Record<ColumnKey, { border: string; bg: string; text: string }> = {
  TRACKING: { border: 'border-gray-500/40', bg: 'bg-gray-500/10', text: 'text-gray-400' },
  CONTACTED: { border: 'border-blue-500/40', bg: 'bg-blue-500/10', text: 'text-blue-400' },
  VISITED: { border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  OFFERED: { border: 'border-orange-500/40', bg: 'bg-orange-500/10', text: 'text-orange-400' },
  COMMITTED: { border: 'border-green-500/40', bg: 'bg-green-500/10', text: 'text-green-400' },
  PASSED: { border: 'border-red-500/30', bg: 'bg-red-500/5', text: 'text-red-400/60' },
};
