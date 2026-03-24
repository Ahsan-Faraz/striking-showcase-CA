"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ThemeConfig {
  layout: string;
  colorScheme: string;
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  headerStyle: string;
}

const LAYOUTS = [
  {
    id: "classic",
    label: "Classic",
    description: "Traditional profile layout",
  },
  { id: "modern", label: "Modern", description: "Two column hero section" },
  {
    id: "minimal",
    label: "Minimal",
    description: "Text-forward, clean design",
  },
  { id: "bold", label: "Bold", description: "Large stats, high impact" },
  {
    id: "media-first",
    label: "Media First",
    description: "Photos and videos upfront",
  },
];

const PRESET_COLORS = [
  { id: "maroon", label: "Maroon", primary: "#660033", accent: "#C9A84C" },
  { id: "navy", label: "Navy", primary: "#1E3A5F", accent: "#E8C547" },
  { id: "emerald", label: "Emerald", primary: "#065F46", accent: "#F59E0B" },
  { id: "crimson", label: "Crimson", primary: "#991B1B", accent: "#D4AF37" },
  { id: "royal", label: "Royal", primary: "#4C1D95", accent: "#F59E0B" },
  { id: "slate", label: "Slate", primary: "#334155", accent: "#38BDF8" },
  { id: "midnight", label: "Midnight", primary: "#0F172A", accent: "#818CF8" },
  { id: "forest", label: "Forest", primary: "#14532D", accent: "#FCD34D" },
  { id: "ocean", label: "Ocean", primary: "#164E63", accent: "#67E8F9" },
  {
    id: "classic-red",
    label: "Classic Red",
    primary: "#7F1D1D",
    accent: "#FBBF24",
  },
];

const FONTS = [
  {
    id: "default",
    label: "Default",
    family: "Inter",
    preview: "Clean & Modern",
  },
  {
    id: "athletic",
    label: "Athletic",
    family: "Bebas Neue + Inter",
    preview: "BOLD HEADERS",
  },
  {
    id: "classic",
    label: "Classic",
    family: "Georgia",
    preview: "Timeless Elegance",
  },
  {
    id: "modern",
    label: "Modern",
    family: "DM Sans",
    preview: "Contemporary Style",
  },
];

const HEADER_STYLES = [
  { id: "solid", label: "Solid Color", description: "Clean solid background" },
  { id: "gradient", label: "Gradient", description: "Smooth color transition" },
  {
    id: "photo-banner",
    label: "Photo Banner",
    description: "Profile photo as background",
  },
];

export default function ThemeStudioPage() {
  const [theme, setTheme] = useState<ThemeConfig>({
    layout: "classic",
    colorScheme: "maroon",
    primaryColor: "#660033",
    accentColor: "#C9A84C",
    fontFamily: "default",
    headerStyle: "solid",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [athleteName, setAthleteName] = useState({
    first: "John",
    last: "Doe",
  });
  const [athleteInfo, setAthleteInfo] = useState({
    classYear: 2026,
    state: "",
    seasonAverage: 0,
    highGame: 0,
    highSeries: 0,
  });

  useEffect(() => {
    fetch("/api/athletes/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.athlete) {
          setAthleteName({
            first: data.athlete.firstName || "John",
            last: data.athlete.lastName || "Doe",
          });
          setAthleteInfo({
            classYear: data.athlete.classYear ?? 2026,
            state: data.athlete.state ?? "",
            seasonAverage: data.athlete.seasonAverage ?? 0,
            highGame: data.athlete.highGame ?? 0,
            highSeries: data.athlete.highSeries ?? 0,
          });
        }
        if (data.athlete?.themeJson) {
          const existing =
            typeof data.athlete.themeJson === "string"
              ? JSON.parse(data.athlete.themeJson)
              : data.athlete.themeJson;
          setTheme((prev) => ({ ...prev, ...existing }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePresetSelect = (preset: (typeof PRESET_COLORS)[0]) => {
    setTheme({
      ...theme,
      colorScheme: preset.id,
      primaryColor: preset.primary,
      accentColor: preset.accent,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      // Save themeJson + sync colorScheme and portfolioLayout columns
      const layoutMap: Record<string, string> = {
        classic: "CLASSIC",
        modern: "MODERN",
        minimal: "MINIMAL",
        bold: "BOLD",
        "media-first": "MEDIA_FIRST",
      };
      const res = await fetch("/api/athletes/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeJson: theme,
          colorScheme: theme.colorScheme?.toUpperCase() || "MAROON",
          portfolioLayout: layoutMap[theme.layout] || "CLASSIC",
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // Handle silently
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 animate-in">
          <p className="section-label mb-1">Customize</p>
          <h1 className="font-heading text-4xl font-bold">Theme Studio</h1>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-gold border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between animate-in">
        <div>
          <p className="section-label mb-1">Customize</p>
          <h1 className="font-heading text-4xl font-bold">Theme Studio</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Personalize how your public profile looks to coaches
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="text-sm text-green-400 font-medium">Saved!</span>
          )}
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Save Theme
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      <Card className="animate-in-delay-1 border-t-2 border-t-gold/30">
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-xl overflow-hidden border border-[var(--border-primary)]"
            style={{
              background:
                theme.headerStyle === "gradient"
                  ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`
                  : theme.primaryColor,
            }}
          >
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 mx-auto mb-3 flex items-center justify-center">
                <span className="text-white text-xl font-bold">
                  {athleteName.first[0]}
                  {athleteName.last[0]}
                </span>
              </div>
              <h3
                className="text-xl font-bold text-white"
                style={{
                  fontFamily:
                    FONTS.find((f) => f.id === theme.fontFamily)?.family?.split(
                      " + ",
                    )[0] || "inherit",
                }}
              >
                {athleteName.first.toUpperCase()}{" "}
                {athleteName.last.toUpperCase()}
              </h3>
              <p className="text-white/70 text-sm mt-1">
                Class of {athleteInfo.classYear}
                {athleteInfo.state ? ` • ${athleteInfo.state}` : ""}
              </p>
              <div className="flex justify-center gap-4 mt-4">
                {[
                  athleteInfo.seasonAverage
                    ? `${athleteInfo.seasonAverage} Avg`
                    : null,
                  athleteInfo.highGame ? `${athleteInfo.highGame} High` : null,
                  athleteInfo.highSeries
                    ? `${athleteInfo.highSeries} Series`
                    : null,
                ]
                  .filter(Boolean)
                  .map((stat) => (
                    <div
                      key={stat}
                      className="px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: theme.accentColor + "30" }}
                    >
                      <span
                        className="text-xs font-bold"
                        style={{ color: theme.accentColor }}
                      >
                        {stat}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout */}
      <Card className="animate-in-delay-2">
        <CardHeader>
          <CardTitle>Layout</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {LAYOUTS.map((layout) => (
              <button
                key={layout.id}
                onClick={() => setTheme({ ...theme, layout: layout.id })}
                className={cn(
                  "p-4 rounded-xl border text-center transition-all duration-300",
                  theme.layout === layout.id
                    ? "border-gold bg-gold/5 shadow-glow-gold/10"
                    : "border-[var(--border-primary)] hover:border-gold/30 hover:bg-[var(--bg-card)]",
                )}
              >
                <div
                  className={cn(
                    "w-full h-16 rounded-lg mb-2 flex items-center justify-center border transition-colors",
                    theme.layout === layout.id
                      ? "bg-maroon/10 border-maroon/20"
                      : "bg-[var(--bg-tertiary)] border-transparent",
                  )}
                >
                  <span
                    className={cn(
                      "text-[9px] font-mono uppercase tracking-wider",
                      theme.layout === layout.id
                        ? "text-gold"
                        : "text-[var(--text-tertiary)]",
                    )}
                  >
                    {layout.id}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  {layout.label}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                  {layout.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Scheme */}
      <Card className="animate-in-delay-2">
        <CardHeader>
          <CardTitle>Color Scheme</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-5 gap-3">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300",
                  theme.colorScheme === preset.id
                    ? "border-gold bg-gold/5 ring-2 ring-gold/20"
                    : "border-[var(--border-primary)] hover:border-gold/30",
                )}
              >
                <div className="flex gap-1">
                  <div
                    className="w-6 h-6 rounded-full border border-white/10"
                    style={{ background: preset.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border border-white/10"
                    style={{ background: preset.accent }}
                  />
                </div>
                <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Color Pickers */}
          <div className="flex gap-6 pt-4 border-t border-[var(--border-primary)]">
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-2 block">
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.primaryColor}
                  onChange={(e) =>
                    setTheme({
                      ...theme,
                      colorScheme: "custom",
                      primaryColor: e.target.value,
                    })
                  }
                  className="w-10 h-10 rounded-lg cursor-pointer border border-[var(--border-primary)]"
                />
                <input
                  className="input w-28 font-mono text-xs"
                  value={theme.primaryColor}
                  onChange={(e) =>
                    setTheme({
                      ...theme,
                      colorScheme: "custom",
                      primaryColor: e.target.value,
                    })
                  }
                  maxLength={7}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--text-secondary)] mb-2 block">
                Accent Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.accentColor}
                  onChange={(e) =>
                    setTheme({
                      ...theme,
                      colorScheme: "custom",
                      accentColor: e.target.value,
                    })
                  }
                  className="w-10 h-10 rounded-lg cursor-pointer border border-[var(--border-primary)]"
                />
                <input
                  className="input w-28 font-mono text-xs"
                  value={theme.accentColor}
                  onChange={(e) =>
                    setTheme({
                      ...theme,
                      colorScheme: "custom",
                      accentColor: e.target.value,
                    })
                  }
                  maxLength={7}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Font */}
      <Card className="animate-in-delay-3">
        <CardHeader>
          <CardTitle>Font Style</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-3">
            {FONTS.map((font) => (
              <button
                key={font.id}
                onClick={() => setTheme({ ...theme, fontFamily: font.id })}
                className={cn(
                  "p-4 rounded-xl border text-center transition-all duration-300",
                  theme.fontFamily === font.id
                    ? "border-gold bg-gold/5 shadow-glow-gold/10"
                    : "border-[var(--border-primary)] hover:border-gold/30 hover:bg-[var(--bg-card)]",
                )}
              >
                <p
                  className="text-lg font-bold text-[var(--text-primary)] mb-1"
                  style={{ fontFamily: font.family.split(" + ")[0] }}
                >
                  {font.preview}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {font.label}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] font-mono">
                  {font.family}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Header Style */}
      <Card className="animate-in-delay-3">
        <CardHeader>
          <CardTitle>Header Style</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {HEADER_STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => setTheme({ ...theme, headerStyle: style.id })}
                className={cn(
                  "p-4 rounded-xl border text-center transition-all duration-300",
                  theme.headerStyle === style.id
                    ? "border-gold bg-gold/5 shadow-glow-gold/10"
                    : "border-[var(--border-primary)] hover:border-gold/30 hover:bg-[var(--bg-card)]",
                )}
              >
                <div
                  className={cn(
                    "w-full h-20 rounded-lg mb-3 overflow-hidden border",
                    theme.headerStyle === style.id
                      ? "border-gold/30"
                      : "border-transparent",
                  )}
                >
                  {style.id === "solid" && (
                    <div
                      className="w-full h-full"
                      style={{ background: theme.primaryColor }}
                    />
                  )}
                  {style.id === "gradient" && (
                    <div
                      className="w-full h-full"
                      style={{
                        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                      }}
                    />
                  )}
                  {style.id === "photo-banner" && (
                    <div className="w-full h-full bg-[var(--bg-tertiary)] flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-[var(--text-tertiary)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  {style.label}
                </p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                  {style.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
