"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import {
  personalInfoSchema,
  bowlingStatsSchema,
  academicInfoSchema,
  bioSchema,
  privacySchema,
} from "@/lib/validations/profile";

type ActionResult = { error?: string; success?: boolean };

async function getAthleteProfileId(): Promise<
  { userId: string; profileId: string; slug: string | null } | { error: string }
> {
  const user = await verifySession();
  if (!user) return { error: "Not authenticated" };
  if (!user.athleteProfile) return { error: "No athlete profile found" };
  return {
    userId: user.id,
    profileId: user.athleteProfile.id,
    slug: user.athleteProfile.slug ?? null,
  };
}

function revalidateAll(slug: string | null) {
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/${slug}`);
}

export async function savePersonalInfo(
  formData: unknown,
): Promise<ActionResult> {
  const auth = await getAthleteProfileId();
  if ("error" in auth) return { error: auth.error };

  const parsed = personalInfoSchema.safeParse(formData);
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  await prisma.athleteProfile.update({
    where: { id: auth.profileId },
    data: parsed.data,
  });

  revalidateAll(auth.slug);
  return { success: true };
}

export async function saveBowlingStats(
  formData: unknown,
): Promise<ActionResult> {
  const auth = await getAthleteProfileId();
  if ("error" in auth) return { error: auth.error };

  const parsed = bowlingStatsSchema.safeParse(formData);
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  await prisma.athleteProfile.update({
    where: { id: auth.profileId },
    data: parsed.data,
  });

  revalidateAll(auth.slug);
  return { success: true };
}

export async function saveAcademicInfo(
  formData: unknown,
): Promise<ActionResult> {
  const auth = await getAthleteProfileId();
  if ("error" in auth) return { error: auth.error };

  const parsed = academicInfoSchema.safeParse(formData);
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  await prisma.athleteProfile.update({
    where: { id: auth.profileId },
    data: parsed.data,
  });

  revalidateAll(auth.slug);
  return { success: true };
}

export async function saveBio(formData: unknown): Promise<ActionResult> {
  const auth = await getAthleteProfileId();
  if ("error" in auth) return { error: auth.error };

  const parsed = bioSchema.safeParse(formData);
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  await prisma.athleteProfile.update({
    where: { id: auth.profileId },
    data: { bio: parsed.data.bio },
  });

  revalidateAll(auth.slug);
  return { success: true };
}

export async function savePrivacy(formData: unknown): Promise<ActionResult> {
  const auth = await getAthleteProfileId();
  if ("error" in auth) return { error: auth.error };

  const parsed = privacySchema.safeParse(formData);
  if (!parsed.success)
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  await prisma.athleteProfile.update({
    where: { id: auth.profileId },
    data: parsed.data,
  });

  revalidateAll(auth.slug);
  return { success: true };
}
