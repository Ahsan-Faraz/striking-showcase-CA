import { z } from 'zod';

/** Coach signup form validation */
export const coachSignupSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z
    .string()
    .email('Invalid email address')
    .refine(
      (email) => {
        const domain = email.split('@')[1]?.toLowerCase() ?? '';
        return domain.endsWith('.edu') || domain.includes('.edu.');
      },
      { message: 'An educational (.edu) email address is required for coach accounts' },
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  school: z.string().min(1, 'School is required').max(200),
  title: z.enum(['Head Coach', 'Assistant Coach', 'Volunteer Coach'], {
    required_error: 'Please select your title',
  }),
  division: z.enum(['D1', 'D2', 'D3', 'NAIA', 'JUCO'], {
    required_error: 'Please select a division',
  }),
  conference: z.string().max(200).optional(),
});

export type CoachSignupInput = z.infer<typeof coachSignupSchema>;

/** Coach profile editor validation */
export const coachProfileSchema = z.object({
  title: z.enum(['Head Coach', 'Assistant Coach', 'Volunteer Coach']).optional(),
  division: z.enum(['D1', 'D2', 'D3', 'NAIA', 'JUCO']).optional(),
  conference: z.string().max(200).optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
});

export type CoachProfileInput = z.infer<typeof coachProfileSchema>;

/** Coach notification settings validation */
export const coachSettingsSchema = z.object({
  emailOnAthleteReply: z.boolean(),
  emailDailyDigest: z.boolean(),
});

export type CoachSettingsInput = z.infer<typeof coachSettingsSchema>;
