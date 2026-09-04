import { NextResponse } from 'next/server';
import { subscribeEmail } from '@/lib/db';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const honeypot = String(body?.website || '').trim();

    if (honeypot) {
      return NextResponse.json({ message: 'Subscribed.' });
    }
    if (!emailPattern.test(email) || email.length > 254) {
      return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 });
    }

    await subscribeEmail(email);
    return NextResponse.json({ message: 'You are subscribed to Kvisl.' });
  } catch (error) {
    const message = error instanceof Error && error.message.includes('DATABASE_URL')
      ? 'Subscriptions are not configured yet.'
      : 'Unable to subscribe right now.';
    return NextResponse.json({ message }, { status: 503 });
  }
}
