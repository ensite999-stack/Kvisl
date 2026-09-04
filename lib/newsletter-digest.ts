import { createHmac, timingSafeEqual } from 'crypto';
import { getNewsletterSubscribers, getPublishedArticles, unsubscribeEmail } from './db';
import type { NewsletterFrequency } from './types';
import { formatDate } from './utils';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kvisl.com';

function secret() {
  return process.env.NEWSLETTER_SIGNING_SECRET || process.env.ADMIN_SESSION_SECRET || process.env.CRON_SECRET || '';
}

export function unsubscribeToken(email: string) {
  const key = secret();
  if (!key) return '';
  return createHmac('sha256', key).update(email.toLowerCase()).digest('hex');
}

export function validUnsubscribeToken(email: string, token: string) {
  const expected = unsubscribeToken(email);
  if (!expected || expected.length !== token.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(token));
}

export async function unsubscribeNewsletter(email: string) {
  await unsubscribeEmail(email);
}

function emailHtml(title: string, dek: string, author: string, date: string, url: string, unsubscribeUrl: string, edition: string) {
  return `<!doctype html><html><body style="margin:0;background:#f2f1ec;color:#171714"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:38px 20px;background:#f2f1ec"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;margin:0 auto"><tr><td style="font:13px Arial,Helvetica,sans-serif;letter-spacing:2px;padding-bottom:32px">KVISL</td></tr><tr><td style="font:11px Arial,Helvetica,sans-serif;letter-spacing:1.4px;text-transform:uppercase;color:#706d65;padding-bottom:11px">${edition}</td></tr><tr><td style="font:38px Georgia,'Times New Roman',serif;line-height:1.12;padding-bottom:14px">${title}</td></tr><tr><td style="font:18px Georgia,'Times New Roman',serif;line-height:1.55;color:#3e3c37;padding-bottom:18px">${dek}</td></tr><tr><td style="font:12px Arial,Helvetica,sans-serif;color:#706d65;padding-bottom:26px">By ${author} · ${date}</td></tr><tr><td style="padding-bottom:34px"><a href="${url}" style="display:inline-block;background:#171714;color:#f2f1ec;text-decoration:none;font:12px Arial,Helvetica,sans-serif;padding:12px 18px">Read on Kvisl</a></td></tr><tr><td style="border-top:1px solid #c8c5bd;padding-top:16px;font:11px Arial,Helvetica,sans-serif;line-height:1.5;color:#706d65">You subscribed to Kvisl. <a href="${unsubscribeUrl}" style="color:#706d65">Unsubscribe</a>.</td></tr></table></td></tr></table></body></html>`;
}

export async function sendNewsletterDigest(frequency: NewsletterFrequency) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured.');
  const subscribers = await getNewsletterSubscribers(frequency);
  if (!subscribers.length) return { sent: 0 };
  const [article] = await getPublishedArticles(1);
  if (!article) return { sent: 0 };

  const edition = frequency === 'daily' ? 'Kvisl daily' : 'Kvisl weekly';
  const subject = `${edition}: ${article.title}`;
  const articleUrl = `${siteUrl.replace(/\/$/, '')}/articles/${article.slug}`;
  let sent = 0;

  for (const subscriber of subscribers) {
    const token = unsubscribeToken(subscriber.email);
    if (!token) throw new Error('Newsletter signing secret is not configured.');
    const unsubscribeUrl = `${siteUrl.replace(/\/$/, '')}/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${token}`;
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: 'Kvisl <newsletter@kvisl.com>',
        to: [subscriber.email],
        reply_to: 'distributary@kvisl.com',
        subject,
        html: emailHtml(article.title, article.dek, article.author, formatDate(article.publishedAt), articleUrl, unsubscribeUrl, edition),
        text: `${edition}\n\n${article.title}\n${article.dek}\n\nBy ${article.author} · ${formatDate(article.publishedAt)}\n\n${articleUrl}\n\nUnsubscribe: ${unsubscribeUrl}`,
        headers: { 'List-Unsubscribe': `<${unsubscribeUrl}>` }
      })
    });
    if (response.ok) sent += 1;
    else console.error('Newsletter send failed', subscriber.email, response.status, await response.text());
  }

  return { sent };
}
