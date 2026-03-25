import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { verifySessionFromRequest } from "@/lib/dal";

export const dynamic = "force-dynamic";

const arsenalSchema = z.object({
  name: z.string().min(1, "Ball name is required"),
  brand: z.string().nullable().optional(),
  weight: z.coerce.number().int().min(6).max(16).default(15),
  condition: z.string().nullable().optional(),
  isPrimary: z.boolean().default(false),
});

async function getAthleteProfile(request: NextRequest) {
  const user = await verifySessionFromRequest(request);
  if (!user) return null;
  return prisma.athleteProfile.findUnique({ where: { userId: user.id } });
}

export async function GET(request: NextRequest) {
  try {
    const profile = await getAthleteProfile(request);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const arsenal = await prisma.ballArsenal.findMany({
      where: { athleteId: profile.id },
      orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json({ arsenal });
  } catch (error: any) {
    console.error("Get arsenal error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const profile = await getAthleteProfile(request);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const body = await request.json();
    const validated = arsenalSchema.parse(body);

    // If setting as primary, unset other primaries
    if (validated.isPrimary) {
      await prisma.ballArsenal.updateMany({
        where: { athleteId: profile.id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Get max sort order
    const maxSort = await prisma.ballArsenal.findFirst({
      where: { athleteId: profile.id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const ball = await prisma.ballArsenal.create({
      data: {
        athleteId: profile.id,
        name: validated.name,
        brand: validated.brand || null,
        weight: validated.weight,
        condition: validated.condition || null,
        isPrimary: validated.isPrimary,
        sortOrder: (maxSort?.sortOrder ?? -1) + 1,
      },
    });

    return NextResponse.json(ball, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }
    console.error("Create ball error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
