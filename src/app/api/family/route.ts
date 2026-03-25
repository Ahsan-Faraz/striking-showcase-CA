import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { verifySessionFromRequest } from "@/lib/dal";
import { sendFamilyInviteEmail } from "@/lib/email";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const inviteSchema = z.object({
  email: z.string().email("Valid email required"),
  name: z.string().min(1, "Name is required").max(100),
  relationship: z.enum(["Parent", "Guardian", "Sibling", "Other"]),
});

export async function GET(request: NextRequest) {
  try {
    const user = await verifySessionFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) return NextResponse.json({ members: [] });

    const members = await prisma.familyAccess.findMany({
      where: { athleteId: profile.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        relationship: true,
        status: true,
        acceptedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Get family error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifySessionFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile)
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    // Check limit of 4 family members
    const existingCount = await prisma.familyAccess.count({
      where: { athleteId: profile.id },
    });
    if (existingCount >= 4) {
      return NextResponse.json(
        { error: "Maximum 4 family members allowed" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validated = inviteSchema.parse(body);

    // Check duplicate email
    const existing = await prisma.familyAccess.findFirst({
      where: { athleteId: profile.id, email: validated.email },
    });
    if (existing) {
      return NextResponse.json(
        { error: "This email has already been invited" },
        { status: 409 },
      );
    }

    const inviteCode = crypto.randomBytes(32).toString("hex");

    const member = await prisma.familyAccess.create({
      data: {
        athleteId: profile.id,
        parentId: user.id,
        email: validated.email,
        name: validated.name,
        relationship: validated.relationship,
        inviteCode,
        status: "pending",
        permissions: ["view_profile", "view_messages", "view_analytics"],
      },
      select: {
        id: true,
        email: true,
        name: true,
        relationship: true,
        status: true,
        acceptedAt: true,
        createdAt: true,
      },
    });

    // Send invitation email (fire-and-forget — don't block the response)
    const athleteName = `${profile.firstName} ${profile.lastName}`;
    sendFamilyInviteEmail({
      to: validated.email,
      inviteeName: validated.name,
      athleteName,
      relationship: validated.relationship,
      inviteCode,
    }).catch((err) => console.error("Family invite email failed:", err));

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }
    console.error("Create family invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
