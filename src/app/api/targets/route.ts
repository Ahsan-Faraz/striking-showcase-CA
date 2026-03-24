import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { verifySessionFromRequest } from "@/lib/dal";

export const dynamic = "force-dynamic";

const createTargetSchema = z.object({
  schoolName: z.string().min(1, "School name is required").max(200),
  division: z.string().optional(),
  conference: z.string().optional(),
  status: z
    .enum(["INTERESTED", "APPLIED", "VISITED", "OFFERED", "COMMITTED"])
    .default("INTERESTED"),
  notes: z.string().max(1000).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await verifySessionFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.athleteProfile.findUnique({
      where: { userId: user.id },
    });
    if (!profile) return NextResponse.json({ targets: [] });

    const targets = await prisma.collegeTarget.findMany({
      where: { athleteId: profile.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ targets });
  } catch (error) {
    console.error("Get targets error:", error);
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

    const body = await request.json();
    const validated = createTargetSchema.parse(body);

    const target = await prisma.collegeTarget.create({
      data: { athleteId: profile.id, ...validated },
    });

    return NextResponse.json(target, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }
    console.error("Create target error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
