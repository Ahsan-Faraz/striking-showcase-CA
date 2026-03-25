import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifySessionFromRequest } from "@/lib/dal";
import { hasProAccess, type SubscriptionSnapshot } from "@/lib/subscription";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";

const FREE_MEDIA_LIMITS = {
  photos: 3,
  videos: 1,
} as const;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getAthleteProfile(request: NextRequest) {
  const user = await verifySessionFromRequest(request);
  if (!user) return null;

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) return null;

  return {
    profile,
    subscription: (user.subscription as SubscriptionSnapshot) ?? null,
  };
}

async function getMediaUsage(profileId: string) {
  const [photoCount, videoCount] = await Promise.all([
    prisma.media.count({ where: { athleteId: profileId, type: "image" } }),
    prisma.media.count({ where: { athleteId: profileId, type: "video" } }),
  ]);

  return { photoCount, videoCount };
}

function buildMediaLimits(
  subscription: SubscriptionSnapshot,
  usage: { photoCount: number; videoCount: number },
) {
  const isPro = hasProAccess(subscription);

  return {
    isPro,
    plan: subscription?.plan ?? "FREE",
    photoCount: usage.photoCount,
    videoCount: usage.videoCount,
    maxPhotos: isPro ? null : FREE_MEDIA_LIMITS.photos,
    maxVideos: isPro ? null : FREE_MEDIA_LIMITS.videos,
    remainingPhotos: isPro
      ? null
      : Math.max(FREE_MEDIA_LIMITS.photos - usage.photoCount, 0),
    remainingVideos: isPro
      ? null
      : Math.max(FREE_MEDIA_LIMITS.videos - usage.videoCount, 0),
  };
}

export async function GET(request: NextRequest) {
  try {
    const context = await getAthleteProfile(request);
    if (!context) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const media = await prisma.media.findMany({
      where: { athleteId: context.profile.id },
      orderBy: { createdAt: "desc" },
    });
    const usage = await getMediaUsage(context.profile.id);

    return NextResponse.json({
      media,
      limits: buildMediaLimits(context.subscription, usage),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Extract YouTube or Vimeo ID from a URL (server-side validation). */
function parseVideoUrl(
  url: string,
): { provider: "youtube" | "vimeo"; id: string; thumbnail: string } | null {
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (ytMatch) {
    return {
      provider: "youtube",
      id: ytMatch[1],
      thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
    };
  }
  const vmMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vmMatch) {
    return { provider: "vimeo", id: vmMatch[1], thumbnail: "" };
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const context = await getAthleteProfile(request);
    if (!context) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const usage = await getMediaUsage(context.profile.id);
    const limits = buildMediaLimits(context.subscription, usage);

    const formData = await request.formData();
    const type = (formData.get("type") as string) || "image";
    const title = (formData.get("title") as string) || null;
    const videoUrl = formData.get("videoUrl") as string | null;

    const isVideoUpload = Boolean(videoUrl) || type === "video";

    if (!limits.isPro) {
      if (isVideoUpload && limits.remainingVideos === 0) {
        return NextResponse.json(
          {
            error:
              "Free plan includes 1 video. Upgrade to Pro for unlimited media.",
            code: "MEDIA_VIDEO_LIMIT_REACHED",
            limits,
          },
          { status: 403 },
        );
      }

      if (!isVideoUpload && limits.remainingPhotos === 0) {
        return NextResponse.json(
          {
            error:
              "Free plan includes 3 photos. Upgrade to Pro for unlimited media.",
            code: "MEDIA_PHOTO_LIMIT_REACHED",
            limits,
          },
          { status: 403 },
        );
      }
    }

    // ── YouTube / Vimeo URL (no Cloudinary needed) ──────────────────
    if (videoUrl) {
      const parsed = parseVideoUrl(videoUrl.trim());
      if (!parsed) {
        return NextResponse.json(
          { error: "Invalid YouTube or Vimeo URL" },
          { status: 400 },
        );
      }

      const media = await prisma.media.create({
        data: {
          athleteId: context.profile.id,
          type: "video",
          url: videoUrl.trim(),
          thumbnailUrl: parsed.thumbnail || null,
          title: title || `${parsed.provider} video`,
        },
      });

      return NextResponse.json(media, { status: 201 });
    }

    // ── File upload via Cloudinary ──────────────────────────────────
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

    const file = formData.get("file") as File | null;
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
      folder: `striking-showcase/${context.profile.id}`,
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
        athleteId: context.profile.id,
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
