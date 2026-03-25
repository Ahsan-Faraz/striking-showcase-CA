'use server';

import { createClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';
import { coachSignupSchema } from '@/lib/validations/coach';

type ActionResult = { error?: string; data?: { success: boolean } };

export async function signupCoach(formData: unknown): Promise<ActionResult> {
  // 1. Validate
  const result = coachSignupSchema.safeParse(formData);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid data' };
  }

  const d = result.data;

  // 2. Double-check .edu (supports international: .edu.pk, .edu.au, etc.)
  const domain = d.email.split('@')[1]?.toLowerCase() ?? '';
  if (!domain.endsWith('.edu') && !domain.includes('.edu.')) {
    return { error: 'An educational (.edu) email address is required for coach accounts' };
  }

  // 3. Check if email already exists
  const existing = await prisma.user.findUnique({ where: { email: d.email } });
  if (existing) {
    return { error: 'An account with this email already exists. Sign in instead.' };
  }

  // 4. Create Supabase Auth user (auto-confirmed)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: d.email,
    password: d.password,
    email_confirm: true,
    user_metadata: {
      role: 'COACH',
      first_name: d.firstName,
      last_name: d.lastName,
      school: d.school,
      title: d.title,
      division: d.division,
    },
  });

  if (authError) {
    if (authError.message?.includes('already been registered')) {
      return { error: 'An account with this email already exists. Sign in instead.' };
    }
    console.error('Supabase coach signup error:', authError);
    return { error: 'Something went wrong. Please try again.' };
  }

  const supabaseUserId = authData.user.id;

  // 5. Create Prisma User + CoachProfile in transaction
  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        id: supabaseUserId,
        email: d.email,
        role: 'COACH',
        coachProfile: {
          create: {
            school: d.school,
            title: d.title,
            division: d.division,
            conference: d.conference || null,
            sport: 'Bowling',
            isVerified: false,
          },
        },
      },
    });
  });

  // 6. Send verification pending email via Resend (best-effort)
  try {
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Striking Showcase <noreply@strikingshowcase.com>',
        to: [d.email],
        subject: 'Your Striking Showcase coach account is pending verification',
        html: `
          <h2>Welcome, ${d.firstName}!</h2>
          <p>Thank you for creating a coach account on Striking Showcase.</p>
          <p>Your account is currently under review. Our team verifies all coach accounts to protect athletes and their families.</p>
          <p>You'll be notified within <strong>24–48 hours</strong> once your account is verified.</p>
          <p>In the meantime, you can browse athlete profiles and search the athlete database.</p>
          <br/>
          <p>— The Striking Showcase Team</p>
        `,
      });
    }
  } catch (emailErr) {
    console.error('Failed to send verification pending email:', emailErr);
    // Non-blocking — account is created; email failure is not fatal.
  }

  return { data: { success: true } };
}
