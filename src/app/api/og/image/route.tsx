import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace("#", "");
  return {
    r: parseInt(normalized.slice(0, 2), 16) || 0,
    g: parseInt(normalized.slice(2, 4), 16) || 0,
    b: parseInt(normalized.slice(4, 6), 16) || 0,
  };
}

function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function darken(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex);
  const tone = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value * factor)));
  return `#${tone(r).toString(16).padStart(2, "0")}${tone(g).toString(16).padStart(2, "0")}${tone(b).toString(16).padStart(2, "0")}`;
}

function resolveOgTheme(themeJson: unknown, colorScheme?: string | null) {
  const presets: Record<string, { primary: string; accent: string }> = {
    MAROON: { primary: "#660033", accent: "#C9A84C" },
    NAVY: { primary: "#1E3A5F", accent: "#5B8CC5" },
    EMERALD: { primary: "#065F46", accent: "#34D399" },
    CRIMSON: { primary: "#991B1B", accent: "#F87171" },
    ROYAL: { primary: "#4C1D95", accent: "#A78BFA" },
    SLATE: { primary: "#334155", accent: "#94A3B8" },
  };

  let parsed: {
    primaryColor?: string;
    accentColor?: string;
    colorScheme?: string;
  } = {};
  if (typeof themeJson === "string") {
    try {
      parsed = JSON.parse(themeJson) as typeof parsed;
    } catch {
      parsed = {};
    }
  } else if (themeJson && typeof themeJson === "object") {
    parsed = themeJson as typeof parsed;
  }

  if (parsed.primaryColor && parsed.accentColor) {
    return { primary: parsed.primaryColor, accent: parsed.accentColor };
  }

  const scheme = (parsed.colorScheme || colorScheme || "MAROON").toUpperCase();
  return presets[scheme] ?? presets.MAROON;
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0d0d0d",
          color: "#C9A84C",
          fontSize: 48,
          fontWeight: 700,
        }}
      >
        Striking Showcase
      </div>,
      { width: 1200, height: 630 },
    );
  }

  let name = "Athlete";
  let classYear = "";
  let school = "";
  let state = "";
  let avg: string | null = null;
  let revRate: string | null = null;
  let photoUrl: string | null = null;
  let primary = "#660033";
  let accent = "#C9A84C";

  try {
    const athlete = await prisma.athleteProfile.findUnique({
      where: { slug },
      select: {
        firstName: true,
        lastName: true,
        classYear: true,
        school: true,
        state: true,
        seasonAverage: true,
        revRate: true,
        profilePhotoUrl: true,
        themeJson: true,
        colorScheme: true,
      },
    });
    if (athlete) {
      name = `${athlete.firstName} ${athlete.lastName}`;
      classYear = `Class of ${athlete.classYear}`;
      school = athlete.school ?? "";
      state = athlete.state ?? "";
      avg =
        athlete.seasonAverage != null ? `${athlete.seasonAverage} Avg` : null;
      revRate = athlete.revRate != null ? `${athlete.revRate} RPM` : null;
      photoUrl = athlete.profilePhotoUrl;
      ({ primary, accent } = resolveOgTheme(
        athlete.themeJson,
        athlete.colorScheme,
      ));
    }
  } catch {
    // Fall through with defaults
  }

  const background = `linear-gradient(135deg, ${darken(primary, 0.38)} 0%, ${darken(primary, 0.66)} 42%, #0d0d12 100%)`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        background,
        padding: "60px",
        gap: "48px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 78% 20%, ${rgba(accent, 0.18)} 0%, transparent 42%)`,
        }}
      />
      {/* Avatar */}
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          width={200}
          height={200}
          style={{
            borderRadius: "50%",
            border: `3px solid ${accent}`,
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: darken(primary, 0.85),
            border: `3px solid ${accent}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accent,
            fontSize: 64,
            fontWeight: 700,
          }}
        >
          {name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>
      )}

      {/* Text */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          flex: 1,
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: accent,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Bowling Recruit
        </div>
        <div
          style={{
            fontSize: 52,
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.1,
          }}
        >
          {name}
        </div>
        <div
          style={{ fontSize: 24, color: "#999", display: "flex", gap: "12px" }}
        >
          {classYear}
          {school && ` · ${school}`}
          {state && ` · ${state}`}
        </div>

        {/* Stats row */}
        {(avg || revRate) && (
          <div style={{ display: "flex", gap: "24px", marginTop: "16px" }}>
            {avg && (
              <div
                style={{
                  background: rgba(accent, 0.12),
                  border: `1px solid ${rgba(accent, 0.32)}`,
                  borderRadius: "12px",
                  padding: "12px 24px",
                  color: accent,
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                {avg}
              </div>
            )}
            {revRate && (
              <div
                style={{
                  background: rgba(accent, 0.12),
                  border: `1px solid ${rgba(accent, 0.32)}`,
                  borderRadius: "12px",
                  padding: "12px 24px",
                  color: accent,
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                {revRate}
              </div>
            )}
          </div>
        )}

        {/* Branding */}
        <div style={{ fontSize: 18, color: "#555", marginTop: "20px" }}>
          strikingshowcase.com
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
