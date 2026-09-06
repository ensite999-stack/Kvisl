import { NextResponse } from 'next/server';
import { subscribeEmail } from '@/lib/db';
import {
  brandedEmailHtml,
  brandedEmailText,
  KVISL_LIST_ID,
  KVISL_NEWSLETTER_FROM,
  KVISL_REPLY_TO
} from '@/lib/email-brand';
import { unsubscribeToken } from '@/lib/newsletter-digest';
import type { NewsletterFrequency } from '@/lib/types';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function unsubscribeUrls(email: string) {
  const token = unsubscribeToken(email);
  if (!token) return null;
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kvisl.com').replace(/\/$/, '');
  const params = new URLSearchParams({ email, token });
  return {
    visible: `${siteUrl}/newsletter/unsubscribe?${params.toString()}`,
    oneClick: `${siteUrl}/api/newsletter/unsubscribe?${params.toString()}`
  };
}

async function sendSubscriptionReceipt(email: string, frequency: NewsletterFrequency): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const unsubscribe = unsubscribeUrls(email);
  if (!apiKey || !unsubscribe) return false;

  const cadence = frequency === 'daily' ? 'daily' : 'weekly';
  const bodyHtml = `<p style="margin-top:0;margin-right:0;margin-bottom:16px;margin-left:0;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#333333;">Your Kvisl newsletter subscription is active.</p><table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#666666;padding-top:10px;padding-right:0;padding-bottom:10px;padding-left:0;border-top-width:1px;border-top-style:solid;border-top-color:#e5e5e5;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:#e5e5e5;">Delivery frequency: <strong style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#333333;font-weight:600;">${cadence}</strong></td></tr></table><p style="margin-top:16px;margin-right:0;margin-bottom:0;margin-left:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:21px;color:#666666;">No further action is required. You can unsubscribe at any time using the link below.</p>`;
  const text = brandedEmailText(
    `Kvisl subscription active\n\nYour Kvisl newsletter subscription is active.\nDelivery frequency: ${cadence}\n\nNo further action is required.`,
    unsubscribe.visible
  );

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: KVISL_NEWSLETTER_FROM,
      to: [email],
      reply_to: KVISL_REPLY_TO,
      subject: 'Kvisl subscription active',
      text,
      html: brandedEmailHtml({
        preheader: 'Your Kvisl newsletter subscription is active.',
        eyebrow: 'Subscription',
        title: 'Subscription active',
        bodyHtml,
        unsubscribeUrl: unsubscribe.visible
      }),
      headers: {
        'List-ID': KVISL_LIST_ID,
        'List-Unsubscribe': `<${unsubscribe.oneClick}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      }
    })
  });

  if (!response.ok) {
    console.error('Subscription receipt email failed', response.status, await response.text());
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
    const emailSent = await sendSubscriptionReceipt(email, frequency).catch((error) => {
      console.error('Subscription receipt email error', error);
      return false;
    });

    return NextResponse.json({
      message: `Subscribed to the ${frequency} Kvisl newsletter.`,
      emailSent,
      confirmationRequired: false
    });
  } catch (error) {
    const message = error instanceof Error && error.message.includes('DATABASE_URL')
      ? 'Subscriptions are not configured yet.'
      : 'Unable to subscribe right now.';
    return NextResponse.json({ message }, { status: 503 });
  }
}
