import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicProfile, verifySession } from "@/lib/dal";
import { ShowcasePortfolio } from "@/app/athlete/preview/ShowcasePortfolio";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

function buildDescription(
  profile: NonNullable<Awaited<ReturnType<typeof getPublicProfile>>>,
  name: string,
): string {
  const avg =
    profile.seasonAverage != null
      ? `${profile.seasonAverage} average`
      : "competitive bowling profile";
  const location = profile.state || profile.location || "the United States";
  const revRate = profile.revRate ? ` and ${profile.revRate} rev rate` : "";
  return `${name} is a ${profile.classYear} bowling recruit from ${location} with a ${avg}${revRate}. View highlights, stats, tournament history, and recruiting details on Striking Showcase.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getPublicProfile(params.slug);
  if (!profile) return { title: "Athlete Not Found" };

  const name = `${profile.firstName} ${profile.lastName}`;
  const description = buildDescription(profile, name);
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://strikingshowcase.com";
  const canonical = `${appUrl}/${params.slug}`;
  const ogImage = `${appUrl}/api/og/image?slug=${params.slug}`;

  return {
    title: `${name} - Bowling Recruit | Striking Showcase`,
    description,
    keywords: [
      name,
      "bowling recruit",
      "college bowling",
      profile.school ?? "high school bowling",
      profile.state ?? "US bowling",
      "Striking Showcase",
    ],
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${name} - Bowling Recruit`,
      description,
      url: canonical,
      siteName: "Striking Showcase",
      type: "profile",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${name} recruiting profile`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} - Bowling Recruit`,
      description,
      images: [ogImage],
    },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const profile = await getPublicProfile(params.slug);
  if (!profile) notFound();

  const prisma = (await import("@/lib/prisma")).default;

  // Determine viewer context for CTA — non-blocking, public profiles still render if no session
  let viewerType: "verified-coach" | "unverified-coach" | "public" = "public";
  let hideMessagingCta = true;

  const session = await verifySession().catch(() => null);
  if (session?.role === "COACH") {
    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: session.id },
      select: { isVerified: true },
    });
    viewerType = coachProfile?.isVerified ? "verified-coach" : "unverified-coach";
    hideMessagingCta = false;
  }

  prisma.profileView
    .create({
      data: {
        athleteId: profile.id,
        viewerType: session?.role === "COACH" ? "coach" : "public",
        source: "slug-profile",
      },
    })
    .catch(() => {});

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://strikingshowcase.com";
  const name = `${profile.firstName} ${profile.lastName}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    url: `${appUrl}/${params.slug}`,
    image: profile.profilePhotoUrl ?? undefined,
    description: buildDescription(profile, name),
    address: profile.state
      ? { "@type": "PostalAddress", addressRegion: profile.state }
      : undefined,
    alumniOf: profile.school
      ? { "@type": "EducationalOrganization", name: profile.school }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ShowcasePortfolio
        sourceMode="provided"
        initialAthleteRaw={profile as unknown as Record<string, any>}
        hideMessagingCta={hideMessagingCta}
        showControls={false}
        trackScrollSticky={false}
        athleteProfileId={profile.id}
        viewerType={viewerType}
      />
    </>
  );
}
