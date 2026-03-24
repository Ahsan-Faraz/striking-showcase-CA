import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySessionFromRequest } from "@/lib/dal";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

    const media = await prisma.media.findMany({
      where: { athleteId: profile.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ media });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const profile = await getAthleteProfile(request);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      return NextResponse.json(
        { error: "Cloudinary not configured" },
        { status: 503 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "image";
    const title = (formData.get("title") as string) || null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64 data URI for Cloudinary upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType =
      file.type || (type === "video" ? "video/mp4" : "image/jpeg");
    const dataUri = `data:${mimeType};base64,${base64}`;

    const resourceType =
      type === "video" ? ("video" as const) : ("image" as const);

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: `striking-showcase/${profile.id}`,
      resource_type: resourceType,
      transformation:
        resourceType === "image"
          ? [
              {
                width: 2000,
                crop: "limit",
                quality: "auto",
                fetch_format: "auto",
              },
            ]
          : undefined,
    });

    // Build thumbnail URL
    let thumbnailUrl: string | null = null;
    if (resourceType === "image") {
      thumbnailUrl = cloudinary.url(uploadResult.public_id, {
        width: 400,
        height: 300,
        crop: "fill",
        quality: "auto",
        fetch_format: "auto",
      });
    } else if (resourceType === "video") {
      thumbnailUrl = cloudinary.url(uploadResult.public_id, {
        resource_type: "video",
        width: 400,
        height: 300,
        crop: "fill",
        format: "jpg",
      });
    }

    const media = await prisma.media.create({
      data: {
        athleteId: profile.id,
        type,
        url: uploadResult.secure_url,
        thumbnailUrl,
        title,
        duration: uploadResult.duration
          ? Math.round(uploadResult.duration)
          : null,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
