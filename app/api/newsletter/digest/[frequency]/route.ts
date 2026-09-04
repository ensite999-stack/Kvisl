import { NextResponse } from 'next/server';
import { sendNewsletterDigest } from '@/lib/newsletter-digest';
import type { NewsletterFrequency } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: Request, context: { params: Promise<{ frequency: string }> }) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }
  const { frequency: value } = await context.params;
  if (value !== 'daily' && value !== 'weekly') {
    return NextResponse.json({ message: 'Invalid frequency.' }, { status: 400 });
  }
  try {
    const result = await sendNewsletterDigest(value as NewsletterFrequency);
    return NextResponse.json({ frequency: value, ...result });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Digest failed.' }, { status: 503 });
  }
}
