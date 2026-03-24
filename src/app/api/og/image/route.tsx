import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0d0d0d',
            color: '#C9A84C',
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          Striking Showcase
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  let name = 'Athlete';
  let classYear = '';
  let school = '';
  let state = '';
  let avg: string | null = null;
  let revRate: string | null = null;
  let photoUrl: string | null = null;

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
      },
    });
    if (athlete) {
      name = `${athlete.firstName} ${athlete.lastName}`;
      classYear = `Class of ${athlete.classYear}`;
      school = athlete.school ?? '';
      state = athlete.state ?? '';
      avg = athlete.seasonAverage != null ? `${athlete.seasonAverage} Avg` : null;
      revRate = athlete.revRate != null ? `${athlete.revRate} RPM` : null;
      photoUrl = athlete.profilePhotoUrl;
    }
  } catch {
    // Fall through with defaults
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0d0d0d 0%, #1a0a14 50%, #0d0d0d 100%)',
          padding: '60px',
          gap: '48px',
        }}
      >
        {/* Avatar */}
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt=""
            width={200}
            height={200}
            style={{
              borderRadius: '50%',
              border: '3px solid #C9A84C',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: '#660033',
              border: '3px solid #C9A84C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#C9A84C',
              fontSize: 64,
              fontWeight: 700,
            }}
          >
            {name.split(' ').map((n) => n[0]).join('')}
          </div>
        )}

        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          <div style={{ fontSize: 52, fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
            {name}
          </div>
          <div style={{ fontSize: 24, color: '#999', display: 'flex', gap: '12px' }}>
            {classYear}
            {school && ` · ${school}`}
            {state && ` · ${state}`}
          </div>

          {/* Stats row */}
          {(avg || revRate) && (
            <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
              {avg && (
                <div
                  style={{
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    color: '#C9A84C',
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
                    background: 'rgba(201,168,76,0.1)',
                    border: '1px solid rgba(201,168,76,0.3)',
                    borderRadius: '12px',
                    padding: '12px 24px',
                    color: '#C9A84C',
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
          <div style={{ fontSize: 18, color: '#555', marginTop: '20px' }}>
            strikingshowcase.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
