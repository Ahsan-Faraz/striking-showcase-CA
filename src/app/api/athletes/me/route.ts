import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySessionFromRequest } from "@/lib/dal";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await verifySessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const athlete = await prisma.athleteProfile.findUnique({
      where: { userId: user.id },
      include: {
        tournaments: { orderBy: { date: "desc" as const } },
        arsenal: { orderBy: { sortOrder: "asc" as const } },
        media: { orderBy: { sortOrder: "asc" as const } },
      },
    });

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ athlete });
  } catch (error) {
    console.error("Get current athlete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await verifySessionFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const athlete = await prisma.athleteProfile.findUnique({
      where: { userId: user.id },
    });

    if (!athlete) {
      return NextResponse.json(
        { error: "Athlete profile not found" },
        { status: 404 },
      );
    }

    const body = await request.json();

    const allowedFields = [
      "firstName",
      "lastName",
      "classYear",
      "location",
      "state",
      "school",
      "gender",
      "dominantHand",
      "style",
      "coachName",
      "coachContact",
      "proShop",
      "bowlingCenter",
      "bio",
      "profilePhotoUrl",
      "gpa",
      "act",
      "sat",
      "ncaaStatus",
      "intendedMajor",
      "usbcId",
      "seasonAverage",
      "highGame",
      "highSeries",
      "revRate",
      "ballSpeed",
      "pap",
      "axisTilt",
      "axisRotation",
      "spareConversion",
      "preferredDivisions",
      "preferredRegions",
      "profileVisibility",
      "portfolioLayout",
      "colorScheme",
      "isActivelyRecruiting",
      "themeJson",
      "slug",
    ];

    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        const numericFields = [
          "classYear",
          "gpa",
          "act",
          "sat",
          "seasonAverage",
          "highGame",
          "highSeries",
          "revRate",
          "ballSpeed",
          "axisTilt",
          "axisRotation",
          "spareConversion",
        ];
        if (
          numericFields.includes(field) &&
          typeof body[field] === "string" &&
          body[field] !== ""
        ) {
          data[field] = parseFloat(body[field]);
        } else {
          data[field] = body[field];
        }
      }
    }

    // Slug uniqueness check
    if (typeof data.slug === "string" && data.slug) {
      const slugVal = data.slug.toLowerCase().trim();
      data.slug = slugVal;
      if (!/^[a-z0-9][a-z0-9-]{1,48}[a-z0-9]$/.test(slugVal)) {
        return NextResponse.json(
          {
            error:
              "Invalid slug format. Use 3-50 lowercase letters, numbers, and hyphens.",
          },
          { status: 400 },
        );
      }
      const existing = await prisma.athleteProfile.findUnique({
        where: { slug: slugVal },
        select: { id: true },
      });
      if (existing && existing.id !== athlete.id) {
        return NextResponse.json(
          { error: "This slug is already taken" },
          { status: 409 },
        );
      }
    }

    const updated = await prisma.athleteProfile.update({
      where: { id: athlete.id },
      data,
    });

    return NextResponse.json({ athlete: updated });
  } catch (error) {
    console.error("Update current athlete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
