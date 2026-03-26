import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { sendAthleteWelcomeEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/register
 * Creates a Supabase Auth user (auto-confirmed, no email verification),
 * then creates matching Prisma User + role profile in a transaction.
 * Returns needsOnboarding flag for client-side redirect.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Check if email already exists in Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    // Use Supabase Admin client (service role) to create user without email confirmation
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: validated.email,
        password: validated.password,
        email_confirm: true, // Auto-confirm — no email verification
        user_metadata: {
          role: validated.role,
          first_name: validated.firstName,
          last_name: validated.lastName,
          class_year: validated.classYear,
          school: validated.school,
        },
      });

    if (authError) {
      // Handle duplicate email in Supabase
      if (authError.message?.includes("already been registered")) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 },
        );
      }
      console.error("Supabase auth error:", authError);
      return NextResponse.json(
        { error: "Failed to create account. Please try again." },
        { status: 500 },
      );
    }

    const supabaseUserId = authData.user.id;

    // Create Prisma User + role profile in a transaction
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          id: supabaseUserId,
          email: validated.email,
          role: validated.role,
        },
      });

      if (validated.role === "ATHLETE") {
        await tx.athleteProfile.create({
          data: {
            userId: newUser.id,
            firstName: validated.firstName,
            lastName: validated.lastName,
            classYear: validated.classYear || new Date().getFullYear() + 2,
          },
        });

        await tx.subscription.create({
          data: {
            userId: newUser.id,
            plan: "FREE",
            status: "ACTIVE",
          },
        });
      } else if (validated.role === "COACH") {
        await tx.coachProfile.create({
          data: {
            userId: newUser.id,
            school: validated.school || "",
          },
        });
      }

      return newUser;
    });

    const needsOnboarding = validated.role === "ATHLETE";

    // Send welcome email to athletes (fire-and-forget — don't block registration)
    if (validated.role === "ATHLETE") {
      sendAthleteWelcomeEmail({
        to: validated.email,
        firstName: validated.firstName,
      }).catch((err) => {
        console.error("Failed to send athlete welcome email:", err);
      });
    }

    return NextResponse.json(
      {
        data: {
          userId: supabaseUserId,
          email: validated.email,
          role: validated.role,
          needsOnboarding,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      const zodError = error as import("zod").ZodError;
      return NextResponse.json(
        { error: zodError.errors[0].message },
        { status: 400 },
      );
    }
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
