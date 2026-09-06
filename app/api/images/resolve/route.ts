import { NextResponse } from 'next/server';
import { resolveImageUrl } from '@/lib/media-resolver';
import { providerImagePage } from '@/lib/media-url';

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url') || '';

  if (!providerImagePage(url)) {
    return NextResponse.json({ message: 'Image unavailable.' }, { status: 404 });
  }

  try {
    const image = await resolveImageUrl(url);
    return NextResponse.redirect(image.url, {
      status: 307,
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' }
    });
  } catch {
    return NextResponse.json({ message: 'Image unavailable.' }, { status: 404 });
  }
}
