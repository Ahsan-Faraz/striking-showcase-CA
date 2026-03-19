import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

async function getAthleteProfile(request: NextRequest) {
  let user = null;
  try { user = await getCurrentUser(request); } catch {}

  if (user) {
    return prisma.athleteProfile.findUnique({ where: { userId: user.id } });
  }
  return prisma.athleteProfile.findFirst({ orderBy: { createdAt: 'asc' } });
}

export async function GET(request: NextRequest) {
  try {
    const profile = await getAthleteProfile(request);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const media = await prisma.media.findMany({
      where: { athleteId: profile.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ media });
  } catch (error: any) {
    console.error('Get media error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const profile = await getAthleteProfile(request);
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'image';
    const title = (formData.get('title') as string) || null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: `Storage not configured. SUPABASE_URL: ${supabaseUrl ? 'set' : 'missing'}, SERVICE_KEY: ${supabaseServiceKey ? 'set' : 'missing'}` },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate unique filename
    const ext = file.name.split('.').pop() || (type === 'video' ? 'mp4' : 'jpg');
    const filename = `${profile.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('media')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload failed:', uploadError);
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(filename);

    const publicUrl = urlData.publicUrl;

    // Save to database
    const media = await prisma.media.create({
      data: {
        athleteId: profile.id,
        type,
        url: publicUrl,
        thumbnailUrl: null,
        title,
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
