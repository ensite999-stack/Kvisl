import { NextResponse } from 'next/server';
import { subscribeEmail } from '@/lib/db';
import type { NewsletterFrequency } from '@/lib/types';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function sendSubscriptionThanks(email: string, frequency: NewsletterFrequency): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: 'Kvisl <newsletter@kvisl.com>',
      to: [email],
      reply_to: 'distributary@kvisl.com',
      template: {
        id: 'kvisl-subscription-thanks',
        variables: { FREQUENCY: frequency }
      }
    })
  });

  if (!response.ok) {
    console.error('Subscription thank-you email failed', response.status, await response.text());
    return false;
  }

  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const honeypot = String(body?.website || '').trim();
    const frequency: NewsletterFrequency = body?.frequency === 'daily' ? 'daily' : 'weekly';

    if (honeypot) return NextResponse.json({ message: 'Subscribed.', emailSent: false });
    if (!emailPattern.test(email) || email.length > 254) {
      return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 });
    }

    await subscribeEmail(email, frequency);
    const emailSent = await sendSubscriptionThanks(email, frequency).catch((error) => {
      console.error('Subscription thank-you email error', error);
      return false;
    });
    return NextResponse.json({ message: `Subscribed to the ${frequency} Kvisl newsletter.`, emailSent });
  } catch (error) {
    const message = error instanceof Error && error.message.includes('DATABASE_URL')
      ? 'Subscriptions are not configured yet.'
      : 'Unable to subscribe right now.';
    return NextResponse.json({ message }, { status: 503 });
  }
}
