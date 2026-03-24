import { z } from 'zod';

/** Tab 1: Personal Info */
export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  classYear: z.coerce.number().int().min(2020).max(2035),
  state: z.string().max(50).optional().nullable(),
  school: z.string().max(100).optional().nullable(),
  gender: z.string().max(20).optional().nullable(),
  dominantHand: z.enum(['LEFT', 'RIGHT']).optional().nullable(),
  style: z.enum(['ONE_HANDED', 'TWO_HANDED']).optional().nullable(),
  coachName: z.string().max(100).optional().nullable(),
  coachContact: z.string().max(100).optional().nullable(),
  proShop: z.string().max(100).optional().nullable(),
  bowlingCenter: z.string().max(100).optional().nullable(),
});

/** Tab 2: Bowling Stats */
export const bowlingStatsSchema = z.object({
  seasonAverage: z.coerce.number().min(0).max(300).optional().nullable(),
  highGame: z.coerce.number().int().min(0).max(300).optional().nullable(),
  highSeries: z.coerce.number().int().min(0).max(900).optional().nullable(),
  revRate: z.coerce.number().int().min(0).max(750).optional().nullable(),
  ballSpeed: z.coerce.number().min(0).max(30).optional().nullable(),
  pap: z.string().max(20).optional().nullable(),
  axisTilt: z.coerce.number().min(0).max(90).optional().nullable(),
  axisRotation: z.coerce.number().min(0).max(90).optional().nullable(),
  spareConversion: z.coerce.number().min(0).max(100).optional().nullable(),
  usbcId: z.string().max(50).optional().nullable(),
});

/** Tab 3: Academic Info */
export const academicInfoSchema = z.object({
  gpa: z.coerce.number().min(0).max(5.0).optional().nullable(),
  act: z.coerce.number().int().min(1).max(36).optional().nullable(),
  sat: z.coerce.number().int().min(400).max(1600).optional().nullable(),
  ncaaStatus: z.string().max(50).optional().nullable(),
  intendedMajor: z.string().max(100).optional().nullable(),
});

/** Tab 4: Bio */
export const bioSchema = z.object({
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional().nullable(),
});

/** Tab 5: Privacy & Preferences */
export const privacySchema = z.object({
  profileVisibility: z.enum(['PUBLIC', 'PRIVATE']),
  isActivelyRecruiting: z.boolean(),
  preferredDivisions: z.array(z.string()).max(10),
  preferredRegions: z.array(z.string()).max(20),
});

export type PersonalInfoInput = z.infer<typeof personalInfoSchema>;
export type BowlingStatsInput = z.infer<typeof bowlingStatsSchema>;
export type AcademicInfoInput = z.infer<typeof academicInfoSchema>;
export type BioInput = z.infer<typeof bioSchema>;
export type PrivacyInput = z.infer<typeof privacySchema>;
