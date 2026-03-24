import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { verifySessionFromRequest } from "@/lib/dal";

const updateTargetSchema = z.object({
  schoolName: z.string().min(1).max(200).optional(),
  division: z.string().optional(),
  conference: z.string().optional(),
  status: z
    .enum(["INTERESTED", "APPLIED", "VISITED", "OFFERED", "COMMITTED"])
    .optional(),
  notes: z.string().max(1000).optional(),
});

async function verifyOwnership(request: NextRequest, targetId: string) {
  const user = await verifySessionFromRequest(request);
  if (!user) return null;

  const target = await prisma.collegeTarget.findUnique({
    where: { id: targetId },
    include: { athlete: { select: { userId: true } } },
  });
  if (!target || target.athlete.userId !== user.id) return null;
  return target;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const target = await verifyOwnership(request, params.id);
    if (!target)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const validated = updateTargetSchema.parse(body);

    const updated = await prisma.collegeTarget.update({
      where: { id: params.id },
      data: validated,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 },
      );
    }
    console.error("Update target error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const target = await verifyOwnership(request, params.id);
    if (!target)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.collegeTarget.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete target error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
