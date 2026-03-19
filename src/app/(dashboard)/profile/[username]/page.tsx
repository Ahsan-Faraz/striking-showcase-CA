import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Portfolio } from '@/components/athlete/Portfolio';

export const dynamic = 'force-dynamic';

interface Props {
  params: { username: string };
}

async function getAthlete(id: string) {
  try {
    const athlete = await prisma.athleteProfile.findUnique({
      where: { id },
      include: {
        tournaments: { orderBy: { date: 'desc' }, take: 10 },
        arsenal: { orderBy: { sortOrder: 'asc' } },
        media: { where: { isPublic: true }, orderBy: { sortOrder: 'asc' }, take: 12 },
      },
    });
    return athlete;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props) {
  const athlete = await getAthlete(params.username);
  if (!athlete) return { title: 'Athlete Not Found' };

  return {
    title: `${athlete.firstName} ${athlete.lastName} — Bowling Portfolio`,
    description: athlete.bio || `View ${athlete.firstName} ${athlete.lastName}'s bowling recruitment portfolio on Striking Showcase.`,
  };
}

export default async function PublicPortfolioPage({ params }: Props) {
  const athlete = await getAthlete(params.username);

  if (!athlete) {
    notFound();
  }

  // Record profile view
  try {
    await prisma.profileView.create({
      data: {
        athleteId: athlete.id,
        viewerType: 'anonymous',
      },
    });
  } catch {
    // Non-critical, ignore
  }

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden bg-[var(--bg-primary)]">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
             style={{ background: 'radial-gradient(ellipse, rgba(102,0,51,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px]"
             style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.05) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px]"
             style={{ background: 'radial-gradient(circle, rgba(102,0,51,0.06) 0%, transparent 60%)' }} />
      </div>
      <div className="relative">
        <Portfolio athlete={athlete} />
      </div>
    </div>
  );
}
