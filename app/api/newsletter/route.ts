import { createHash, randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { saveNewsletterConfirmationRequest } from '@/lib/newsletter-confirmation';
import type { NewsletterFrequency } from '@/lib/types';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const confirmationLifetimeMs = 24 * 60 * 60 * 1000;

function confirmationEmailHtml(confirmUrl: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta http-equiv="X-UA-Compatible" content="IE=edge"></head><body style="margin:0;background-color:#ffffff;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#ffffff" style="background-color:#ffffff;padding-top:40px;padding-right:20px;padding-bottom:40px;padding-left:20px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin-left:auto;margin-right:auto;"><tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#111111;letter-spacing:2px;padding-bottom:28px;">KVISL</td></tr><tr><td style="font-family:Georgia,'Times New Roman',serif;font-size:32px;line-height:39px;color:#111111;padding-bottom:16px;">Confirm your subscription</td></tr><tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:25px;color:#333333;padding-bottom:24px;">We received a request to subscribe this email address to Kvisl.</td></tr><tr><td style="padding-bottom:24px;"><table cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#111111" style="background-color:#111111;"><a href="${confirmUrl}" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:20px;color:#ffffff;text-decoration:none;padding-top:12px;padding-right:18px;padding-bottom:12px;padding-left:18px;">Confirm subscription</a></td></tr></table></td></tr><tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#666666;padding-bottom:8px;">This link expires in 24 hours.</td></tr><tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:20px;color:#666666;">If you did not request this, you can ignore this email.</td></tr></table></td></tr></table></body></html>`;
}

async function sendConfirmationEmail(email: string, confirmUrl: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const text = [
    'Confirm your Kvisl subscription',
    '',
    'We received a request to subscribe this email address to Kvisl.',
    '',
    `Confirm subscription: ${confirmUrl}`,
    '',
    'This link expires in 24 hours.',
    'If you did not request this, you can ignore this email.'
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: 'Kvisl <hello@kvisl.com>',
      to: [email],
      reply_to: 'distributary@kvisl.com',
      subject: 'Confirm your Kvisl subscription',
      text,
      html: confirmationEmailHtml(confirmUrl)
    })
  });

  if (!response.ok) {
    console.error('Newsletter confirmation email failed', response.status, await response.text());
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

    if (honeypot) return NextResponse.json({ message: 'Confirmation email sent.' });
    if (!emailPattern.test(email) || email.length > 254) {
      return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 });
    }

    const token = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + confirmationLifetimeMs);
    await saveNewsletterConfirmationRequest(email, frequency, tokenHash, expiresAt);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kvisl.com';
    const confirmUrl = new URL('/api/newsletter/confirm', siteUrl);
    confirmUrl.searchParams.set('token', token);

    const emailSent = await sendConfirmationEmail(email, confirmUrl.toString()).catch((error) => {
      console.error('Newsletter confirmation email error', error);
      return false;
    });

    if (!emailSent) {
      return NextResponse.json(
        { message: 'We could not send the confirmation email. Please try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json({ message: 'Confirmation email sent.', confirmationRequired: true });
  } catch (error) {
    const message = error instanceof Error && error.message.includes('DATABASE_URL')
      ? 'Subscriptions are not configured yet.'
      : 'Unable to start the subscription right now.';
    return NextResponse.json({ message }, { status: 503 });
  }
}
