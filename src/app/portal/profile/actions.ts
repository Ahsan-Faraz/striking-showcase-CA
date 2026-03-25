'use server';

import { revalidatePath } from 'next/cache';
import { verifySession } from '@/lib/dal';
import prisma from '@/lib/prisma';
import { coachProfileSchema } from '@/lib/validations/coach';

export async function saveCoachProfile(formData: {
  title: string;
  division: string;
  conference: string;
  bio: string;
}) {
  const user = await verifySession();
  if (!user || user.role !== 'COACH') {
    return { error: 'Unauthorized' };
  }

  const coach = user.coachProfile;
  if (!coach) {
    return { error: 'Coach profile not found' };
  }

  const parsed = coachProfileSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Validation failed' };
  }

  await prisma.coachProfile.update({
    where: { id: coach.id },
    data: {
      title: parsed.data.title,
      division: parsed.data.division,
      conference: parsed.data.conference || null,
      bio: parsed.data.bio || null,
    },
  });

  revalidatePath('/portal/profile');
  return { data: { success: true } };
}
