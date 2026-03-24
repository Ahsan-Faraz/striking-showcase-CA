'use server';

import prisma from '@/lib/prisma';
import { verifySession } from '@/lib/dal';
import {
  basicInfoSchema,
  bowlingStatsSchema,
  profilePhotoSchema,
  ballArsenalSchema,
  slugSchema,
} from '@/lib/validations/onboarding';
import type { DominantHand, BowlingStyle } from '@prisma/client';

type ActionResult = { error?: string; data?: Record<string, unknown> };

/** Helper to return profile ID after verifying athlete session */
async function getAthleteProfileId(): Promise<{ profileId: string } | { error: string }> {
  const user = await verifySession();
  if (!user) return { error: 'Not authenticated' };
  if (user.role !== 'ATHLETE') return { error: 'Only athletes can complete onboarding' };
  if (!user.athleteProfile) return { error: 'Athlete profile not found' };
  return { profileId: user.athleteProfile.id };
}

/** Step 1 — Save basic info */
export async function saveBasicInfo(formData: unknown): Promise<ActionResult> {
  const result = basicInfoSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid data' };
  }

  const auth = await getAthleteProfileId();
  if ('error' in auth) return { error: auth.error };

  await prisma.athleteProfile.update({
    where: { id: auth.profileId },
    data: {
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      classYear: result.data.classYear,
      state: result.data.state,
      school: result.data.school,
      gender: result.data.gender,
    },
  });

  return { data: { success: true } };
}

/** Step 2 — Save bowling stats */
export async function saveBowlingStats(formData: unknown): Promise<ActionResult> {
  const result = bowlingStatsSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid data' };
  }

  const auth = await getAthleteProfileId();
  if ('error' in auth) return { error: auth.error };

  const d = result.data;
  await prisma.athleteProfile.update({
    where: { id: auth.profileId },
    data: {
      seasonAverage: typeof d.seasonAverage === 'number' ? d.seasonAverage : undefined,
      highGame: typeof d.highGame === 'number' ? d.highGame : undefined,
      highSeries: typeof d.highSeries === 'number' ? d.highSeries : undefined,
      dominantHand: d.dominantHand as DominantHand | undefined,
      style: d.style as BowlingStyle | undefined,
      revRate: typeof d.revRate === 'number' ? d.revRate : undefined,
      ballSpeed: typeof d.ballSpeed === 'number' ? d.ballSpeed : undefined,
    },
  });

  return { data: { success: true } };
}

/** Step 3 — Save profile photo URL */
export async function saveProfilePhoto(formData: unknown): Promise<ActionResult> {
  const result = profilePhotoSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid data' };
  }

  const auth = await getAthleteProfileId();
  if ('error' in auth) return { error: auth.error };

  if (result.data.profilePhotoUrl) {
    await prisma.athleteProfile.update({
      where: { id: auth.profileId },
      data: { profilePhotoUrl: result.data.profilePhotoUrl },
    });
  }

  return { data: { success: true } };
}

/** Step 4 — Save ball arsenal entries */
export async function saveBallArsenal(formData: unknown): Promise<ActionResult> {
  const result = ballArsenalSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid data' };
  }

  const auth = await getAthleteProfileId();
  if ('error' in auth) return { error: auth.error };

  const items = result.data.arsenal ?? [];

  if (items.length > 0) {
    // Upsert: delete existing then create new (simple for onboarding)
    await prisma.ballArsenal.deleteMany({ where: { athleteId: auth.profileId } });
    await prisma.ballArsenal.createMany({
      data: items.map((item) => ({
        athleteId: auth.profileId,
        name: item.ballName,
        brand: item.brand || null,
        weight: typeof item.weight === 'number' ? item.weight : 15,
        coverstock: item.coverstock || null,
      })),
    });
  }

  return { data: { success: true } };
}

/** Step 5 — Save slug */
export async function saveSlug(formData: unknown): Promise<ActionResult> {
  const result = slugSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid data' };
  }

  const auth = await getAthleteProfileId();
  if ('error' in auth) return { error: auth.error };

  // Double-check uniqueness server-side
  const existing = await prisma.athleteProfile.findUnique({
    where: { slug: result.data.slug },
    select: { id: true },
  });

  if (existing && existing.id !== auth.profileId) {
    return { error: 'This URL is already taken. Please choose another.' };
  }

  await prisma.athleteProfile.update({
    where: { id: auth.profileId },
    data: { slug: result.data.slug },
  });

  return { data: { success: true, slug: result.data.slug } };
}
