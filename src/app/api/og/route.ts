import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StrikingShowcase/1.0)' },
      signal: AbortSignal.timeout(5000),
    });
    const html = await res.text();

    const getMetaContent = (property: string): string | null => {
      // Match both property="..." and name="..."
      const regex = new RegExp(
        `<meta[^>]*(?:property|name)=["']${property}["'][^>]*content=["']([^"']*)["']|<meta[^>]*content=["']([^"']*)["'][^>]*(?:property|name)=["']${property}["']`,
        'i'
      );
      const match = html.match(regex);
      return match ? (match[1] || match[2] || null) : null;
    };

    // Extract title from og:title, twitter:title, or <title> tag
    const title =
      getMetaContent('og:title') ||
      getMetaContent('twitter:title') ||
      html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ||
      null;

    const description =
      getMetaContent('og:description') ||
      getMetaContent('twitter:description') ||
      getMetaContent('description') ||
      null;

    const image =
      getMetaContent('og:image') ||
      getMetaContent('twitter:image') ||
      null;

    const siteName =
      getMetaContent('og:site_name') ||
      new URL(url).hostname.replace('www.', '') ||
      null;

    return NextResponse.json({ title, description, image, siteName, url });
  } catch {
    return NextResponse.json(
      { title: null, description: null, image: null, siteName: new URL(url).hostname.replace('www.', ''), url },
      { status: 200 }
    );
  }
}
