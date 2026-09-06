import { NextResponse } from 'next/server';
import { unsubscribeNewsletter, validUnsubscribeToken } from '@/lib/newsletter-digest';

function readParams(request: Request) {
  const url = new URL(request.url);
  const email = String(url.searchParams.get('email') || '').trim().toLowerCase();
  const token = String(url.searchParams.get('token') || '').trim();
  return { email, token };
}

export async function POST(request: Request) {
  const { email, token } = readParams(request);
  if (!email || !token || !validUnsubscribeToken(email, token)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  await unsubscribeNewsletter(email);
  return new NextResponse(null, { status: 200 });
}
