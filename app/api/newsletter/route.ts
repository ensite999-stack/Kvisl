import { NextResponse } from 'next/server';
import { subscribeEmail } from '@/lib/db';
import type { NewsletterFrequency } from '@/lib/types';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const honeypot = String(body?.website || '').trim();
    const frequency: NewsletterFrequency = body?.frequency === 'daily' ? 'daily' : 'weekly';

    if (honeypot) return NextResponse.json({ message: 'Subscribed.' });
    if (!emailPattern.test(email) || email.length > 254) {
      return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 });
    }

    await subscribeEmail(email, frequency);
    return NextResponse.json({ message: `Subscribed to the ${frequency} Kvisl newsletter.` });
  } catch (error) {
    const message = error instanceof Error && error.message.includes('DATABASE_URL')
      ? 'Subscriptions are not configured yet.'
      : 'Unable to subscribe right now.';
    return NextResponse.json({ message }, { status: 503 });
  }
}
