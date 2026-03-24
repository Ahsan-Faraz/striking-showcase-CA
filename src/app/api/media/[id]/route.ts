import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySessionFromRequest } from "@/lib/dal";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await verifySessionFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const media = await prisma.media.findUnique({
      where: { id: params.id },
      include: { athlete: { select: { userId: true } } },
    });
    if (!media || media.athlete.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const updateData: Record<string, unknown> = {};
    if (typeof body.title === "string") updateData.title = body.title;
    if (typeof body.isFeatured === "boolean")
      updateData.isFeatured = body.isFeatured;
    if (typeof body.sortOrder === "number")
      updateData.sortOrder = body.sortOrder;

    const updated = await prisma.media.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function extractCloudinaryPublicId(url: string): string | null {
  // Cloudinary URLs: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{public_id}.{ext}
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  return match ? match[1] : null;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await verifySessionFromRequest(request);
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const media = await prisma.media.findUnique({
      where: { id: params.id },
      include: { athlete: { select: { userId: true, id: true } } },
    });
    if (!media || media.athlete.userId !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete from Cloudinary if it's a Cloudinary URL
    if (media.url.includes("res.cloudinary.com")) {
      try {
        const publicId = extractCloudinaryPublicId(media.url);
        if (publicId) {
          const resourceType =
            media.type === "video" ? ("video" as const) : ("image" as const);
          await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
          });
        }
      } catch {
        // Cloudinary deletion is best-effort
      }
    }

    await prisma.media.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
