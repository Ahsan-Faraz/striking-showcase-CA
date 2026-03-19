import { notFound } from 'next/navigation';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

/**
 * Look up athlete by ID (future: by slug column).
 * Uses explicit column selection — never select('*').
 */
async function getAthlete(slug: string) {
  try {
    // Try by ID first — when slug column exists, swap to: where: { slug }
    const athlete = await prisma.athleteProfile.findUnique({
      where: { id: slug },
      include: {
        tournaments: { orderBy: { date: 'desc' }, take: 10 },
        arsenal: { orderBy: { sortOrder: 'asc' } },
        media: { where: { isPublic: true }, orderBy: { sortOrder: 'asc' }, take: 20 },
      },
    });
    return athlete;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const athlete = await getAthlete(params.slug);
  if (!athlete) return { title: 'Athlete Not Found' };

  const name = `${athlete.firstName} ${athlete.lastName}`;
  const desc =
    athlete.bio ??
    `${name} is a ${athlete.classYear} bowling recruit from ${athlete.state ?? 'unknown'} with a ${athlete.seasonAverage ?? '—'} average${athlete.revRate ? ` and ${athlete.revRate} rev rate` : ''}.`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://strikingshowcase.com';
  const canonical = `${appUrl}/${params.slug}`;

  return {
    title: `${name} — Bowling Recruit | Striking Showcase`,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: `${name} — Bowling Recruit`,
      description: desc,
      siteName: 'Striking Showcase',
      type: 'profile',
      url: canonical,
      images: [
        {
          url: `${appUrl}/api/og/image?id=${params.slug}`,
          width: 1200,
          height: 630,
          alt: `${name} — Bowling Recruit`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
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
  const athlete = await getAthlete(params.slug);
  if (!athlete) notFound();

  // Fire-and-forget profile view tracking
  prisma.profileView
    .create({ data: { athleteId: athlete.id, viewerType: 'anonymous' } })
    .catch(() => {});

  const name = `${athlete.firstName} ${athlete.lastName}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://strikingshowcase.com';

  // Schema.org Person JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description: athlete.bio ?? undefined,
    url: `${appUrl}/${params.slug}`,
    image: athlete.profilePhotoUrl ?? undefined,
    address: athlete.state
      ? { '@type': 'PostalAddress', addressRegion: athlete.state }
      : undefined,
  };

  const highlightVideo = athlete.media.find((m) => m.isFeatured && m.type === 'video');
  const photos = athlete.media.filter((m) => m.type === 'photo');
  const videos = athlete.media.filter((m) => m.type === 'video');

  const statCards: [string, string | number | null | undefined][] = [
    ['Season Avg', athlete.seasonAverage],
    ['High Game', athlete.highGame],
    ['High Series', athlete.highSeries],
    ['Rev Rate', athlete.revRate ? `${athlete.revRate} rpm` : null],
    ['Ball Speed', athlete.ballSpeed ? `${athlete.ballSpeed} mph` : null],
    ['PAP', athlete.pap],
    ['Axis Tilt', athlete.axisTilt ? `${athlete.axisTilt}°` : null],
    ['Axis Rotation', athlete.axisRotation ? `${athlete.axisRotation}°` : null],
  ];
  const hasStats = statCards.some(([, v]) => v != null);

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-[#0d0d0d] text-white">
        {/* ─── 1. HERO ───────────────────────────────── */}
        <section className="relative px-6 py-16 sm:py-24 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {athlete.profilePhotoUrl ? (
              <Image
                src={athlete.profilePhotoUrl}
                alt={name}
                width={160}
                height={160}
                className="rounded-full border-2 border-[#C9A84C]/40 object-cover w-36 h-36 sm:w-40 sm:h-40 flex-shrink-0"
                priority
              />
            ) : (
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-[#660033]/30 border border-[#C9A84C]/20 flex items-center justify-center text-4xl font-bold text-[#C9A84C]/60 flex-shrink-0">
                {athlete.firstName[0]}
                {athlete.lastName[0]}
              </div>
            )}
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{name}</h1>
              <p className="mt-2 text-lg text-gray-400">
                Class of {athlete.classYear}
                {athlete.school && ` · ${athlete.school}`}
                {athlete.state && ` · ${athlete.state}`}
              </p>
              {athlete.preferredDivisions.length > 0 && (
                <p className="mt-1 text-sm text-[#C9A84C]">
                  Division interest: {athlete.preferredDivisions.join(', ')}
                </p>
              )}
              {athlete.isActivelyRecruiting && (
                <span className="inline-block mt-3 text-xs font-semibold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-3 py-1">
                  Actively Recruiting
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ─── 2. BOWLING STATS ──────────────────────── */}
        {hasStats && (
          <section className="max-w-5xl mx-auto px-6 pb-14">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-3">
              Bowling Stats
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {statCards.map(
                ([label, val]) =>
                  val != null && (
                    <div
                      key={label}
                      className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center hover:border-[#C9A84C]/30 transition-colors"
                    >
                      <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">
                        {label}
                      </p>
                      <p className="text-2xl font-bold text-[#C9A84C]">{val}</p>
                    </div>
                  )
              )}
            </div>
          </section>
        )}

        {/* ─── 3. HIGHLIGHT REEL ─────────────────────── */}
        {videos.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 pb-14">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-3">
              Highlight Reel
            </h2>
            {highlightVideo && (
              <div className="aspect-video rounded-xl overflow-hidden bg-black mb-6 border border-white/10">
                <iframe
                  src={highlightVideo.url}
                  title={highlightVideo.title ?? 'Highlight Video'}
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
                      className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10"
                    >
                      <iframe
                        src={v.url}
                        title={v.title ?? 'Video'}
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
        )}

        {/* ─── 4. PHOTO GALLERY ──────────────────────── */}
        {photos.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 pb-14">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-3">Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {photos.map((p) => (
                <div
                  key={p.id}
                  className="aspect-square rounded-xl overflow-hidden bg-white/[0.04] border border-white/10"
                >
                  <Image
                    src={p.url}
                    alt={p.title ?? 'Photo'}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 5. BALL ARSENAL ───────────────────────── */}
        {athlete.arsenal.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 pb-14">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-3">
              Ball Arsenal
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {athlete.arsenal.map((b) => (
                <div
                  key={b.id}
                  className="bg-white/[0.04] border border-white/10 rounded-xl p-5 hover:border-[#C9A84C]/30 transition-colors"
                >
                  <p className="font-bold text-lg">{b.name}</p>
                  {b.brand && <p className="text-sm text-gray-400">{b.brand}</p>}
                  <div className="mt-3 space-y-1 text-sm text-gray-300">
                    <p>Weight: {b.weight} lb</p>
                    {b.coverstock && <p>Coverstock: {b.coverstock}</p>}
                    {b.pinToPap && <p>Pin-to-PAP: {b.pinToPap}</p>}
                    {b.condition && <p>Condition: {b.condition}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 6. TOURNAMENT RESULTS ─────────────────── */}
        {athlete.tournaments.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 pb-14">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-3">
              Tournament Results
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-white/10">
                    <th className="pb-2 pr-4">Event</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Place</th>
                    <th className="pb-2 pr-4">Avg</th>
                    {athlete.tournaments.some((t) => t.format) && (
                      <th className="pb-2">Format</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {athlete.tournaments.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-2.5 pr-4 font-medium">{t.name}</td>
                      <td className="py-2.5 pr-4 text-gray-400">{t.date}</td>
                      <td className="py-2.5 pr-4">
                        <span className="inline-flex items-center justify-center min-w-[28px] h-7 rounded-md bg-[#C9A84C]/10 text-[#C9A84C] text-xs font-bold px-2">
                          {t.place}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-gray-300">{t.average}</td>
                      {t.format && (
                        <td className="py-2.5 text-gray-400">{t.format}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ─── 7. ACADEMICS ──────────────────────────── */}
        {(athlete.gpa != null ||
          athlete.act != null ||
          athlete.sat != null ||
          athlete.intendedMajor) && (
          <section className="max-w-5xl mx-auto px-6 pb-14">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-3">
              Academics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {athlete.gpa != null && (
                <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">GPA</p>
                  <p className="text-2xl font-bold">{athlete.gpa}</p>
                </div>
              )}
              {athlete.act != null && (
                <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">ACT</p>
                  <p className="text-2xl font-bold">{athlete.act}</p>
                </div>
              )}
              {athlete.sat != null && (
                <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">SAT</p>
                  <p className="text-2xl font-bold">{athlete.sat}</p>
                </div>
              )}
              {athlete.intendedMajor && (
                <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center">
                  <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">Major</p>
                  <p className="text-lg font-semibold">{athlete.intendedMajor}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── 8. BIO / ABOUT ────────────────────────── */}
        {athlete.bio && (
          <section className="max-w-5xl mx-auto px-6 pb-16">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-3">About</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line max-w-prose">
              {athlete.bio}
            </p>
          </section>
        )}

        {/* ─── FOOTER ────────────────────────────────── */}
        <footer className="border-t border-white/10 py-8 text-center text-xs text-gray-600">
          <p>Powered by Striking Showcase</p>
        </footer>
      </div>
    </>
  );
}
