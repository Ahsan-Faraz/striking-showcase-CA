import { z } from 'zod';

/** Step 1 — Basic Info */
export const basicInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  classYear: z.coerce
    .number()
    .int()
    .min(2024, 'Class year must be 2024 or later')
    .max(2032, 'Class year must be 2032 or earlier'),
  state: z.string().min(1, 'State is required').max(50),
  school: z.string().min(1, 'School is required').max(100),
  gender: z.enum(['Male', 'Female']),
});

/** Step 2 — Bowling Stats */
export const bowlingStatsSchema = z.object({
  seasonAverage: z.coerce.number().min(0).max(300).optional().or(z.literal('')),
  highGame: z.coerce.number().int().min(0).max(300).optional().or(z.literal('')),
  highSeries: z.coerce.number().int().min(0).max(900).optional().or(z.literal('')),
  dominantHand: z.enum(['RIGHT', 'LEFT']).optional(),
  style: z.enum(['STROKER', 'CRANKER', 'TWEENER', 'POWER_STROKER', 'HELICOPTER']).optional(),
  revRate: z.coerce.number().int().min(0).max(700).optional().or(z.literal('')),
  ballSpeed: z.coerce.number().min(0).max(30).optional().or(z.literal('')),
});

/** Step 3 — Profile Photo (file handled client-side via Cloudinary) */
export const profilePhotoSchema = z.object({
  profilePhotoUrl: z.string().url().optional().or(z.literal('')),
});

/** Step 4 — Ball Arsenal (up to 3 balls during onboarding) */
export const arsenalItemSchema = z.object({
  ballName: z.string().min(1, 'Ball name is required').max(100),
  brand: z.string().max(100).optional().or(z.literal('')),
  weight: z.coerce.number().int().min(8).max(16).optional().or(z.literal('')),
  coverstock: z.string().max(100).optional().or(z.literal('')),
});

export const ballArsenalSchema = z.object({
  arsenal: z.array(arsenalItemSchema).max(3).optional(),
});

/** Step 5 — Choose Slug */
export const slugSchema = z.object({
  slug: z
    .string()
    .min(3, 'URL must be at least 3 characters')
    .max(40, 'URL must be 40 characters or less')
    .regex(
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
      'URL can only contain lowercase letters, numbers, and hyphens (cannot start or end with a hyphen)'
    ),
});

export type BasicInfoData = z.infer<typeof basicInfoSchema>;
export type BowlingStatsData = z.infer<typeof bowlingStatsSchema>;
export type ProfilePhotoData = z.infer<typeof profilePhotoSchema>;
export type BallArsenalData = z.infer<typeof ballArsenalSchema>;
export type SlugData = z.infer<typeof slugSchema>;
