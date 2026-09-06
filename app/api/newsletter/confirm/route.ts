import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { confirmNewsletterSubscription } from '@/lib/newsletter-confirmation';

function destination(request: Request, status: 'success' | 'invalid', frequency?: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const url = new URL('/newsletter/confirmed', siteUrl);
  url.searchParams.set('status', status);
  if (frequency) url.searchParams.set('frequency', frequency);
  return url;
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('token') || '';
  if (token.length < 32 || token.length > 128) {
    return NextResponse.redirect(destination(request, 'invalid'));
  }

  try {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const frequency = await confirmNewsletterSubscription(tokenHash);
    if (!frequency) return NextResponse.redirect(destination(request, 'invalid'));
    return NextResponse.redirect(destination(request, 'success', frequency));
  } catch (error) {
    console.error('Newsletter confirmation failed', error);
    return NextResponse.redirect(destination(request, 'invalid'));
  }
}
