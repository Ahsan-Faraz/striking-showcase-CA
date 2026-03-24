import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import { getPublicProfile } from "@/lib/dal";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

// ─── THEME SYSTEM ───────────────────────────────────────────
interface ThemeColors {
  bg: string;
  surface: string;
  border: string;
  accent: string;
  accentMuted: string;
  text: string;
  textMuted: string;
  textDim: string;
  heroBg: string;
}

interface ThemeJson {
  layout?: string;
  colorScheme?: string;
  primaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  headerStyle?: string;
}

/** Parse a hex color to RGB. */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16) || 0,
    g: parseInt(h.substring(2, 4), 16) || 0,
    b: parseInt(h.substring(4, 6), 16) || 0,
  };
}

/** Darken a hex color by a factor (0 = black, 1 = original). */
function darken(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  const d = (v: number) =>
    Math.round(v * factor)
      .toString(16)
      .padStart(2, "0");
  return `#${d(r)}${d(g)}${d(b)}`;
}

/** Generate a full theme from primary + accent colors. */
function buildThemeFromColors(
  primary: string,
  accent: string,
  headerStyle?: string,
): ThemeColors {
  const { r, g, b } = hexToRgb(primary);
  const bgColor = darken(primary, 0.15);
  const heroBg =
    headerStyle === "gradient"
      ? `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`
      : `linear-gradient(160deg, ${primary} 0%, ${darken(primary, 0.7)} 35%, ${bgColor} 100%)`;
  return {
    bg: bgColor,
    surface: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.10)",
    accent,
    accentMuted: `rgba(${r},${g},${b},0.30)`,
    text: "#E8E6ED",
    textMuted: "#9A97A6",
    textDim: "#6B687A",
    heroBg,
  };
}

/** Resolve theme from themeJson (primary source) with colorScheme DB column as fallback. */
function resolveTheme(
  themeJson: unknown,
  colorScheme?: string | null,
): { colors: ThemeColors; layout: string; fontFamily: string } {
  // Default theme
  const defaultColors = buildThemeFromColors("#660033", "#C9A84C");

  let parsed: ThemeJson = {};
  if (themeJson && typeof themeJson === "object") {
    parsed = themeJson as ThemeJson;
  } else if (typeof themeJson === "string") {
    try {
      parsed = JSON.parse(themeJson);
    } catch {
      /* ignore */
    }
  }

  const layout = parsed.layout || "classic";
  const fontFamily = parsed.fontFamily || "default";

  // If themeJson has primaryColor + accentColor → use them
  if (parsed.primaryColor && parsed.accentColor) {
    return {
      colors: buildThemeFromColors(
        parsed.primaryColor,
        parsed.accentColor,
        parsed.headerStyle,
      ),
      layout,
      fontFamily,
    };
  }

  // Fallback to named schemes (by themeJson.colorScheme or DB column)
  const schemeName = (
    parsed.colorScheme ||
    colorScheme ||
    "maroon"
  ).toUpperCase();
  const presets: Record<string, { primary: string; accent: string }> = {
    MAROON: { primary: "#660033", accent: "#C9A84C" },
    NAVY: { primary: "#1E3A5F", accent: "#3B82F6" },
    EMERALD: { primary: "#065F46", accent: "#10B981" },
    CRIMSON: { primary: "#991B1B", accent: "#EF4444" },
    ROYAL: { primary: "#4C1D95", accent: "#8B5CF6" },
    SLATE: { primary: "#334155", accent: "#94A3B8" },
    MIDNIGHT: { primary: "#0F172A", accent: "#818CF8" },
    FOREST: { primary: "#14532D", accent: "#FCD34D" },
    OCEAN: { primary: "#164E63", accent: "#67E8F9" },
    "CLASSIC-RED": { primary: "#7F1D1D", accent: "#FBBF24" },
  };
  const preset = presets[schemeName] ?? presets.MAROON;
  return {
    colors: buildThemeFromColors(
      preset.primary,
      preset.accent,
      parsed.headerStyle,
    ),
    layout,
    fontFamily,
  };
}

const FONT_MAP: Record<string, string> = {
  default: "Inter, sans-serif",
  athletic: '"Bebas Neue", Inter, sans-serif',
  classic: "Georgia, serif",
  modern: '"DM Sans", sans-serif',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getPublicProfile(params.slug);
  if (!profile) return { title: "Athlete Not Found" };

  const name = `${profile.firstName} ${profile.lastName}`;
  const desc = `${name} is a ${profile.classYear} bowling recruit from ${profile.state ?? "unknown"} with a ${profile.seasonAverage ?? "—"} average${profile.revRate ? ` and ${profile.revRate} rev rate` : ""}.`;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://strikingshowcase.com";
  const canonical = `${appUrl}/${params.slug}`;

  return {
    title: `${name} — Bowling Recruit | Striking Showcase`,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: `${name} — Bowling Recruit`,
      description: desc,
      siteName: "Striking Showcase",
      type: "profile",
      url: canonical,
      images: [
        {
          url: `${appUrl}/api/og/image?slug=${params.slug}`,
          width: 1200,
          height: 630,
          alt: `${name} — Bowling Recruit`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} — Striking Showcase`,
      description: desc,
    },
  };
}

/**
 * /[slug] — Public athlete profile page.
 * Fully Server-Side Rendered. Zero client JS. Zero editor UI.
 * SEO-critical: coaches Google athlete names.
 */
export default async function PublicProfilePage({ params }: Props) {
  const profile = await getPublicProfile(params.slug);
  if (!profile) notFound();

  // Fire-and-forget profile view tracking
  const prisma = (await import("@/lib/prisma")).default;
  prisma.profileView
    .create({ data: { athleteId: profile.id, viewerType: "anonymous" } })
    .catch(() => {});

  const name = `${profile.firstName} ${profile.lastName}`;
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://strikingshowcase.com";

  // Schema.org Person JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    description: profile.bio ?? undefined,
    url: `${appUrl}/${params.slug}`,
    image: profile.profilePhotoUrl ?? undefined,
    address: profile.state
      ? { "@type": "PostalAddress", addressLocality: profile.state }
      : undefined,
  };

  const videos = profile.media.filter((m) => m.type === "video");
  const photos = profile.media.filter((m) => m.type === "photo");
  const highlightVideo = videos.find((v) => v.isFeatured) ?? videos[0];

  const statCards: { label: string; value: string | number; unit?: string }[] =
    [];
  if (profile.seasonAverage != null)
    statCards.push({ label: "Season Avg", value: profile.seasonAverage });
  if (profile.highGame != null)
    statCards.push({ label: "High Game", value: profile.highGame });
  if (profile.highSeries != null)
    statCards.push({ label: "High Series", value: profile.highSeries });
  if (profile.revRate != null)
    statCards.push({ label: "Rev Rate", value: profile.revRate, unit: "rpm" });
  if (profile.ballSpeed != null)
    statCards.push({
      label: "Ball Speed",
      value: profile.ballSpeed,
      unit: "mph",
    });
  if (profile.pap) statCards.push({ label: "PAP", value: profile.pap });
  if (profile.axisTilt != null)
    statCards.push({ label: "Axis Tilt", value: `${profile.axisTilt}°` });
  if (profile.axisRotation != null)
    statCards.push({
      label: "Axis Rotation",
      value: `${profile.axisRotation}°`,
    });

  // Resolve theme from themeJson (primary) with colorScheme column as fallback
  const {
    colors: theme,
    layout,
    fontFamily,
  } = resolveTheme(profile.themeJson, profile.colorScheme);
  const fontFamilyCss = FONT_MAP[fontFamily] ?? FONT_MAP.default;

  // ─── Layout-specific section ordering ─────────────────────
  // media-first: media before stats
  // bold: stats giant, hero centered
  // minimal: compact, text-forward
  // modern: two-column hero
  // classic: default order

  const heroSection = (
    <section
      key="hero"
      className={`relative px-6 py-16 sm:py-24 max-w-5xl mx-auto ${layout === "bold" ? "text-center" : ""}`}
      style={{ background: theme.heroBg, borderRadius: "0 0 1.5rem 1.5rem" }}
    >
      <div
        className={`flex ${layout === "bold" ? "flex-col items-center" : layout === "modern" ? "flex-col sm:flex-row items-start gap-8" : "flex-col sm:flex-row items-center gap-8"}`}
      >
        {profile.profilePhotoUrl ? (
          <Image
            src={profile.profilePhotoUrl}
            alt={name}
            width={160}
            height={160}
            className={`rounded-full object-cover flex-shrink-0 ${layout === "bold" ? "w-48 h-48" : "w-36 h-36 sm:w-40 sm:h-40"}`}
            style={{
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: `${theme.accent}66`,
            }}
            priority
          />
        ) : (
          <div
            className={`rounded-full flex items-center justify-center font-bold flex-shrink-0 ${layout === "bold" ? "w-48 h-48 text-5xl" : "w-36 h-36 sm:w-40 sm:h-40 text-4xl"}`}
            style={{
              backgroundColor: theme.accentMuted,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: `${theme.accent}33`,
              color: `${theme.accent}99`,
            }}
          >
            {profile.firstName[0]}
            {profile.lastName[0]}
          </div>
        )}
        <div className={layout === "bold" ? "mt-4" : ""}>
          <h1
            className={`font-bold tracking-tight ${layout === "bold" ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl"}`}
          >
            {name}
          </h1>
          <p className="mt-2 text-lg" style={{ color: theme.textMuted }}>
            Class of {profile.classYear}
            {profile.school && ` · ${profile.school}`}
            {profile.state && ` · ${profile.state}`}
          </p>
          {profile.preferredDivisions.length > 0 && (
            <p className="mt-1 text-sm" style={{ color: theme.accent }}>
              Division interest: {profile.preferredDivisions.join(", ")}
            </p>
          )}
          {profile.isActivelyRecruiting && (
            <span className="inline-block mt-3 text-xs font-semibold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-3 py-1">
              Actively Recruiting
            </span>
          )}
        </div>
      </div>
    </section>
  );

  const statsSection =
    statCards.length > 0 ? (
      <section key="stats" className="max-w-5xl mx-auto px-6 pb-14 pt-14">
        <h2
          className="text-2xl font-bold mb-6 pb-3"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          Bowling Stats
        </h2>
        <div
          className={`grid gap-4 ${layout === "bold" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"}`}
        >
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl p-4 text-center transition-colors"
              style={{
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
              }}
            >
              <p
                className="text-[11px] uppercase tracking-widest mb-1"
                style={{ color: theme.textDim }}
              >
                {card.label}
              </p>
              <p
                className={`font-bold ${layout === "bold" ? "text-4xl" : "text-2xl"}`}
                style={{ color: theme.accent }}
              >
                {card.value}
              </p>
              {card.unit && (
                <p className="text-xs mt-0.5" style={{ color: theme.textDim }}>
                  {card.unit}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const videosSection =
    videos.length > 0 ? (
      <section key="videos" className="max-w-5xl mx-auto px-6 pb-14">
        <h2
          className="text-2xl font-bold mb-6 pb-3"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          Highlight Reel
        </h2>
        {highlightVideo && (
          <div
            className="aspect-video rounded-xl overflow-hidden bg-black mb-6"
            style={{ border: `1px solid ${theme.border}` }}
          >
            <iframe
              src={highlightVideo.url}
              title={highlightVideo.title ?? "Highlight Video"}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-full h-full"
              loading="lazy"
            />
          </div>
        )}
        {videos.length > 1 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {videos
              .filter((v) => v.id !== highlightVideo?.id)
              .map((v) => (
                <div
                  key={v.id}
                  className="aspect-video rounded-xl overflow-hidden bg-black"
                  style={{ border: `1px solid ${theme.border}` }}
                >
                  <iframe
                    src={v.url}
                    title={v.title ?? "Video"}
                    allow="encrypted-media"
                    allowFullScreen
                    className="w-full h-full"
                    loading="lazy"
                  />
                </div>
              ))}
          </div>
        )}
      </section>
    ) : null;

  const photosSection =
    photos.length > 0 ? (
      <section key="photos" className="max-w-5xl mx-auto px-6 pb-14">
        <h2
          className="text-2xl font-bold mb-6 pb-3"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          Photos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((p) => (
            <div
              key={p.id}
              className="aspect-square rounded-xl overflow-hidden"
              style={{
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
              }}
            >
              <Image
                src={p.url}
                alt={p.title ?? "Photo"}
                width={400}
                height={400}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const arsenalSection =
    profile.arsenal.length > 0 ? (
      <section key="arsenal" className="max-w-5xl mx-auto px-6 pb-14">
        <h2
          className="text-2xl font-bold mb-6 pb-3"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          Ball Arsenal
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {profile.arsenal.map((b) => (
            <div
              key={b.id}
              className="rounded-xl p-5 transition-colors"
              style={{
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
              }}
            >
              <p className="font-bold text-lg">{b.name}</p>
              {b.brand && (
                <p className="text-sm" style={{ color: theme.textMuted }}>
                  {b.brand}
                </p>
              )}
              <div
                className="mt-3 space-y-1 text-sm"
                style={{ color: theme.textMuted }}
              >
                <p>Weight: {b.weight} lb</p>
                {b.coverstock && <p>Coverstock: {b.coverstock}</p>}
                {b.layout && <p>Layout: {b.layout}</p>}
                {b.core && <p>Core: {b.core}</p>}
                {b.surface && <p>Surface: {b.surface}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const tournamentsSection =
    profile.tournaments.length > 0 ? (
      <section key="tournaments" className="max-w-5xl mx-auto px-6 pb-14">
        <h2
          className="text-2xl font-bold mb-6 pb-3"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          Tournament Results
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                className="text-left"
                style={{
                  color: theme.textDim,
                  borderBottom: `1px solid ${theme.border}`,
                }}
              >
                <th className="pb-2 pr-4">Event</th>
                <th className="pb-2 pr-4">Date</th>
                <th className="pb-2 pr-4">Place</th>
                <th className="pb-2 pr-4">Avg</th>
                {profile.tournaments.some((t) => t.format) && (
                  <th className="pb-2">Format</th>
                )}
              </tr>
            </thead>
            <tbody>
              {profile.tournaments.map((t) => (
                <tr
                  key={t.id}
                  style={{ borderBottom: `1px solid ${theme.border}22` }}
                >
                  <td className="py-3 pr-4 font-medium">{t.name}</td>
                  <td className="py-3 pr-4" style={{ color: theme.textMuted }}>
                    {t.date}
                  </td>
                  <td className="py-3 pr-4">
                    <span
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold"
                      style={
                        t.place <= 3
                          ? {
                              backgroundColor: `${theme.accent}1A`,
                              color: theme.accent,
                              border: `1px solid ${theme.accent}33`,
                            }
                          : {
                              backgroundColor: theme.surface,
                              color: theme.textMuted,
                            }
                      }
                    >
                      {t.place}
                    </span>
                  </td>
                  <td className="py-3 pr-4" style={{ color: theme.textMuted }}>
                    {t.average}
                  </td>
                  {profile.tournaments.some((ti) => ti.format) && (
                    <td className="py-3" style={{ color: theme.textMuted }}>
                      {t.format ?? "—"}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    ) : null;

  const collegeSection =
    profile.collegeTargets.length > 0 ? (
      <section key="college" className="max-w-5xl mx-auto px-6 pb-14">
        <h2
          className="text-2xl font-bold mb-6 pb-3"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          College Targets
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {profile.collegeTargets.map((ct) => (
            <div
              key={ct.id}
              className="rounded-xl p-4 transition-colors"
              style={{
                backgroundColor: theme.surface,
                border: `1px solid ${theme.border}`,
              }}
            >
              <p className="font-bold">{ct.schoolName}</p>
              <div
                className="mt-1 flex items-center gap-2 text-sm"
                style={{ color: theme.textMuted }}
              >
                {ct.division && <span>{ct.division}</span>}
                {ct.conference && <span>· {ct.conference}</span>}
              </div>
              <span
                className="inline-block mt-2 text-xs font-medium uppercase tracking-wider rounded-full px-2 py-0.5"
                style={{
                  backgroundColor: theme.surface,
                  border: `1px solid ${theme.border}`,
                  color: theme.textMuted,
                }}
              >
                {ct.status.replace("_", " ")}
              </span>
            </div>
          ))}
        </div>
      </section>
    ) : null;

  const bioSection = profile.bio ? (
    <section key="bio" className="max-w-5xl mx-auto px-6 pb-14">
      <h2
        className="text-2xl font-bold mb-6 pb-3"
        style={{ borderBottom: `1px solid ${theme.border}` }}
      >
        About
      </h2>
      <p
        className="leading-relaxed whitespace-pre-line max-w-3xl"
        style={{ color: theme.textMuted }}
      >
        {profile.bio.slice(0, 500)}
      </p>
    </section>
  ) : null;

  // Layout-based section ordering
  let sections: (React.ReactNode | null)[];
  switch (layout) {
    case "media-first":
      sections = [
        videosSection,
        photosSection,
        statsSection,
        arsenalSection,
        tournamentsSection,
        collegeSection,
        bioSection,
      ];
      break;
    case "bold":
      sections = [
        statsSection,
        videosSection,
        arsenalSection,
        photosSection,
        tournamentsSection,
        collegeSection,
        bioSection,
      ];
      break;
    case "minimal":
      sections = [
        bioSection,
        statsSection,
        tournamentsSection,
        arsenalSection,
        videosSection,
        photosSection,
        collegeSection,
      ];
      break;
    default: // classic, modern
      sections = [
        statsSection,
        videosSection,
        photosSection,
        arsenalSection,
        tournamentsSection,
        collegeSection,
        bioSection,
      ];
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <link rel="canonical" href={`${appUrl}/${params.slug}`} />

      <div
        className="min-h-screen"
        style={{
          backgroundColor: theme.bg,
          color: theme.text,
          fontFamily: fontFamilyCss,
        }}
      >
        {heroSection}
        {sections.filter(Boolean)}

        {/* Footer */}
        <footer
          className="max-w-5xl mx-auto px-6 py-10 text-center text-xs"
          style={{
            borderTop: `1px solid ${theme.border}`,
            color: theme.textDim,
          }}
        >
          <p>
            Powered by{" "}
            <span style={{ color: theme.accent }}>Striking Showcase</span>
          </p>
        </footer>
      </div>
    </>
  );
}
