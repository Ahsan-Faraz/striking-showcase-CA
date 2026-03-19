'use client';

import { Portfolio } from '@/components/athlete/Portfolio';

interface PortfolioClientProps {
  athlete: Record<string, unknown>;
  colorScheme: string;
}

export default function PortfolioClient({ athlete, colorScheme }: PortfolioClientProps) {
  return (
    <div data-color={colorScheme} className="min-h-screen py-8 px-4" style={{ background: 'var(--bg-primary, #110E18)' }}>
      <Portfolio athlete={athlete as any} />
    </div>
  );
}
