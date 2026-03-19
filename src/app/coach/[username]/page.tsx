import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import CoachPortfolioClient from './CoachPortfolioClient';

export const dynamic = 'force-dynamic';

async function getCoach(id: string) {
  try {
    // Try exact ID first
    const coach = await prisma.coachProfile.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
      },
    });
    if (coach) return coach;

    // Fallback: return first coach profile (demo mode)
    return await prisma.coachProfile.findFirst({
      include: {
        user: { select: { email: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const coach = await getCoach(username);
  if (!coach) return { title: 'Coach Not Found' };

  return {
    title: `${coach.school} Bowling | Striking Showcase`,
    description: `${coach.division || 'Collegiate'} bowling program at ${coach.school}. ${coach.openSpots || 0} roster spots available.`,
  };
}

export default async function CoachPortfolioPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const dbCoach = await getCoach(username);

  if (!dbCoach) {
    notFound();
  }

  const school = dbCoach.school;
  const division = dbCoach.division || 'D1';
  const conference = dbCoach.conference || 'Missouri Valley Conference';
  const rosterSize = dbCoach.rosterSize || 12;
  const openSpots = dbCoach.openSpots || 2;

  // Build rich default data based on what we know from the DB
  const coach = {
    id: dbCoach.id,
    firstName: 'Coach',
    lastName: 'Williams',
    school,
    division,
    conference,
    isVerified: dbCoach.isVerified,
    rosterSize,
    openSpots,
    bio: `The ${school} bowling program competes at the ${division} level in the ${conference}. Our program is built on a foundation of competitive excellence, academic achievement, and personal development. We foster a team-first culture where student-athletes push each other to reach their full potential on the lanes and in the classroom. With state-of-the-art training facilities and a proven track record of developing talent, we are committed to providing an elite collegiate bowling experience.`,
    achievements: [
      `${conference} Tournament Contender`,
      'Top 25 National Ranking',
      'Multiple All-Conference Selections',
      '95% Student-Athlete Graduation Rate',
      'State-of-the-Art Training Facility',
      'Year-Round Competition Schedule',
    ],
    programHighlights: [
      { label: 'National Rank', value: 'Top 25' },
      { label: 'Team Average', value: '198' },
      { label: 'Years Active', value: '15+' },
      { label: 'All-Americans', value: '6' },
    ],
    recruitingNeeds: [
      'High-average bowlers (190+ season average) who compete well under pressure and bring consistency to the lineup',
      'Student-athletes with strong academic records (3.0+ GPA) who are committed to excelling both on the lanes and in the classroom',
      'Versatile competitors comfortable on sport and challenge oil patterns with the ability to make mid-game adjustments',
      'Team-oriented individuals with strong character, leadership potential, and a coachable mindset',
      'Athletes with tournament experience at the regional or national level (USBC, JBT, PBA Jr, or equivalent)',
    ],
    contactEmail: dbCoach.user?.email || 'bowling@wichita.edu',
    contactPhone: '(316) 978-3250',
    schoolWebsite: 'https://goshockers.com/sports/bowling',
  };

  return <CoachPortfolioClient coach={coach} />;
}
