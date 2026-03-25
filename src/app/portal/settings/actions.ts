'use server';

import { revalidatePath } from 'next/cache';
import { verifySession } from '@/lib/dal';
import prisma from '@/lib/prisma';
import { coachSettingsSchema } from '@/lib/validations/coach';

export async function saveCoachSettings(formData: {
  emailOnAthleteReply: boolean;
  emailDailyDigest: boolean;
}) {
  const user = await verifySession();
  if (!user || user.role !== 'COACH') {
    return { error: 'Unauthorized' };
  }

  const coach = user.coachProfile;
  if (!coach) {
    return { error: 'Coach profile not found' };
  }

  const parsed = coachSettingsSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Validation failed' };
  }

  await prisma.coachProfile.update({
    where: { id: coach.id },
    data: {
      emailOnAthleteReply: parsed.data.emailOnAthleteReply,
      emailDailyDigest: parsed.data.emailDailyDigest,
    },
  });

  revalidatePath('/portal/settings');
  return { data: { success: true } };
}
