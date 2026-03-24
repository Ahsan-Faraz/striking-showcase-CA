import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Metadata } from 'next';
import { getPublicProfile } from '@/lib/dal';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await getPublicProfile(params.slug);
  if (!profile) return { title: 'Athlete Not Found' };

  const name = `${profile.firstName} ${profile.lastName}`;
  const desc = `${name} is a ${profile.classYear} bowling recruit from ${profile.state ?? 'unknown'} with a ${profile.seasonAverage ?? '—'} average${profile.revRate ? ` and ${profile.revRate} rev rate` : ''}.`;
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
      images: [{ url: `${appUrl}/api/og/image?slug=${params.slug}`, width: 1200, height: 630, alt: `${name} — Bowling Recruit` }],
    },
    twitter: { card: 'summary_large_image', title: `${name} — Striking Showcase`, description: desc },
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
  const prisma = (await import('@/lib/prisma')).default;
  prisma.profileView.create({ data: { athleteId: profile.id, viewerType: 'anonymous' } }).catch(() => {});

  const name = `${profile.firstName} ${profile.lastName}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://strikingshowcase.com';

  // Schema.org Person JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    description: profile.bio ?? undefined,
    url: `${appUrl}/${params.slug}`,
    image: profile.profilePhotoUrl ?? undefined,
    address: profile.state ? { '@type': 'PostalAddress', addressLocality: profile.state } : undefined,
  };

  const videos = profile.media.filter((m) => m.type === 'video');
  const photos = profile.media.filter((m) => m.type === 'photo');
  const highlightVideo = videos.find((v) => v.isFeatured) ?? videos[0];

  const statCards: { label: string; value: string | number; unit?: string }[] = [];
  if (profile.seasonAverage != null) statCards.push({ label: 'Season Avg', value: profile.seasonAverage });
  if (profile.highGame != null) statCards.push({ label: 'High Game', value: profile.highGame });
  if (profile.highSeries != null) statCards.push({ label: 'High Series', value: profile.highSeries });
  if (profile.revRate != null) statCards.push({ label: 'Rev Rate', value: profile.revRate, unit: 'rpm' });
  if (profile.ballSpeed != null) statCards.push({ label: 'Ball Speed', value: profile.ballSpeed, unit: 'mph' });
  if (profile.pap) statCards.push({ label: 'PAP', value: profile.pap });
  if (profile.axisTilt != null) statCards.push({ label: 'Axis Tilt', value: `${profile.axisTilt}°` });
  if (profile.axisRotation != null) statCards.push({ label: 'Axis Rotation', value: `${profile.axisRotation}°` });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <link rel="canonical" href={`${appUrl}/${params.slug}`} />

      <div className="min-h-screen bg-[#0d0d0d] text-white">
        {/* ─── 1. HERO ───────────────────────────────── */}
        <section className="relative px-6 py-16 sm:py-24 max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {profile.profilePhotoUrl ? (
              <Image src={profile.profilePhotoUrl} alt={name} width={160} height={160} className="rounded-full border-2 border-[#C9A84C]/40 object-cover w-36 h-36 sm:w-40 sm:h-40 flex-shrink-0" priority />
            ) : (
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-[#660033]/30 border border-[#C9A84C]/20 flex items-center justify-center text-4xl font-bold text-[#C9A84C]/60 flex-shrink-0">
                {profile.firstName[0]}{profile.lastName[0]}
              </div>
            )}
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">{name}</h1>
              <p className="mt-2 text-lg text-gray-400">
                Class of {profile.classYear}
                {profile.school && ` · ${profile.school}`}
                {profile.state && ` · ${profile.state}`}
              </p>
              {profile.preferredDivisions.length > 0 && (
                <p className="mt-1 text-sm text-[#C9A84C]">
                  Division interest: {profile.preferredDivisions.join(', ')}
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

        {/* ─── 2. BOWLING STATS ──────────────────────── */}
        {statCards.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 pb-14">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-3">Bowling Stats</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {statCards.map((card) => (
                <div key={card.label} className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center hover:border-[#C9A84C]/30 transition-colors">
                  <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">{card.label}</p>
                  <p className="text-2xl font-bold text-[#C9A84C]">{card.value}</p>
                  {card.unit && <p className="text-xs text-gray-500 mt-0.5">{card.unit}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 3. HIGHLIGHT REEL ─────────────────────── */}
        {videos.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 pb-14">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-3">Highlight Reel</h2>
            {highlightVideo && (
              <div className="aspect-video rounded-xl overflow-hidden bg-black mb-6 border border-white/10">
                <iframe src={highlightVideo.url} title={highlightVideo.title ?? 'Highlight Video'} allow="autoplay; encrypted-media" allowFullScreen className="w-full h-full" loading="lazy" />
              </div>
            )}
            {videos.length > 1 && (
              <div className="grid sm:grid-cols-2 gap-4">
                {videos.filter((v) => v.id !== highlightVideo?.id).map((v) => (
                  <div key={v.id} className="aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
                    <iframe src={v.url} title={v.title ?? 'Video'} allow="encrypted-media" allowFullScreen className="w-full h-full" loading="lazy" />
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
                <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-white/[0.04] border border-white/10">
                  <Image src={p.url} alt={p.title ?? 'Photo'} width={400} height={400} className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 5. BALL ARSENAL ───────────────────────── */}
        {profile.arsenal.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 pb-14">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-3">Ball Arsenal</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {profile.arsenal.map((b) => (
                <div key={b.id} className="bg-white/[0.04] border border-white/10 rounded-xl p-5 hover:border-[#C9A84C]/30 transition-colors">
                  <p className="font-bold text-lg">{b.name}</p>
                  {b.brand && <p className="text-sm text-gray-400">{b.brand}</p>}
                  <div className="mt-3 space-y-1 text-sm text-gray-300">
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
        )}

        {/* ─── 6. TOURNAMENT RESULTS ─────────────────── */}
        {profile.tournaments.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 pb-14">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-3">Tournament Results</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-white/10">
                    <th className="pb-2 pr-4">Event</th>
                    <th className="pb-2 pr-4">Date</th>
                    <th className="pb-2 pr-4">Place</th>
                    <th className="pb-2 pr-4">Avg</th>
                    {profile.tournaments.some((t) => t.format) && <th className="pb-2">Format</th>}
                  </tr>
                </thead>
                <tbody>
                  {profile.tournaments.map((t) => (
                    <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 pr-4 font-medium">{t.name}</td>
                      <td className="py-3 pr-4 text-gray-400">{t.date}</td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${t.place <= 3 ? 'bg-[#C9A84C]/10 text-[#C9A84C] border border-[#C9A84C]/20' : 'bg-white/5 text-gray-400'}`}>
                          {t.place}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-gray-300">{t.average}</td>
                      {profile.tournaments.some((ti) => ti.format) && <td className="py-3 text-gray-400">{t.format ?? '—'}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ─── 7. COLLEGE TARGETS ────────────────────── */}
        {profile.collegeTargets.length > 0 && (
          <section className="max-w-5xl mx-auto px-6 pb-14">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-3">College Targets</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {profile.collegeTargets.map((ct) => (
                <div key={ct.id} className="bg-white/[0.04] border border-white/10 rounded-xl p-4 hover:border-[#C9A84C]/30 transition-colors">
                  <p className="font-bold">{ct.schoolName}</p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                    {ct.division && <span>{ct.division}</span>}
                    {ct.conference && <span>· {ct.conference}</span>}
                  </div>
                  <span className="inline-block mt-2 text-xs font-medium uppercase tracking-wider bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-gray-300">
                    {ct.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 8. BIO ────────────────────────────────── */}
        {profile.bio && (
          <section className="max-w-5xl mx-auto px-6 pb-14">
            <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-3">About</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-line max-w-3xl">
              {profile.bio.slice(0, 500)}
            </p>
          </section>
        )}

        {/* Footer */}
        <footer className="max-w-5xl mx-auto px-6 py-10 border-t border-white/10 text-center text-xs text-gray-600">
          <p>Powered by <span className="text-[#C9A84C]">Striking Showcase</span></p>
        </footer>
      </div>
    </>
  );
}
