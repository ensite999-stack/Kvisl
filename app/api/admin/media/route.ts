import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { MediaResolutionError, mediaConfiguration, resolveImageUrl } from '@/lib/media-resolver';

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }
  return NextResponse.json(mediaConfiguration());
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    return NextResponse.json(await resolveImageUrl(String(body?.url || '')));
  } catch (error) {
    const status = error instanceof MediaResolutionError && error.code === 'PROVIDER_KEY_MISSING' ? 424 : 400;
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : 'Unable to resolve image URL.',
        code: error instanceof MediaResolutionError ? error.code : 'PROVIDER_ERROR',
        provider: error instanceof MediaResolutionError ? error.provider : undefined
      },
      { status }
    );
  }
}
