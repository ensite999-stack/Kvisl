import { createHmac, timingSafeEqual } from 'crypto';
import { getNewsletterSubscribers, getPublishedArticles, unsubscribeEmail } from './db';
import {
  brandedEmailHtml,
  brandedEmailText,
  escapeEmailHtml,
  KVISL_LIST_ID,
  KVISL_NEWSLETTER_FROM,
  KVISL_REPLY_TO
} from './email-brand';
import type { NewsletterFrequency } from './types';
import { formatDate } from './utils';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://kvisl.com').replace(/\/$/, '');

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

function unsubscribeUrls(email: string, token: string) {
  const params = new URLSearchParams({ email, token });
  return {
    visible: `${siteUrl}/newsletter/unsubscribe?${params.toString()}`,
    oneClick: `${siteUrl}/api/newsletter/unsubscribe?${params.toString()}`
  };
}

export async function sendNewsletterDigest(frequency: NewsletterFrequency) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not configured.');
  const subscribers = await getNewsletterSubscribers(frequency);
  if (!subscribers.length) return { sent: 0 };
  const [article] = await getPublishedArticles(1);
  if (!article) return { sent: 0 };

  const edition = frequency === 'daily' ? 'Kvisl Daily' : 'Kvisl Weekly';
  const subject = `${edition} — ${article.title}`;
  const articleUrl = `${siteUrl}/articles/${article.slug}`;
  const safeDek = escapeEmailHtml(article.dek);
  const safeAuthor = escapeEmailHtml(article.author);
  const safeDate = escapeEmailHtml(formatDate(article.publishedAt));
  const safeArticleUrl = escapeEmailHtml(articleUrl);
  let sent = 0;

  for (const subscriber of subscribers) {
    const token = unsubscribeToken(subscriber.email);
    if (!token) throw new Error('Newsletter signing secret is not configured.');
    const unsubscribe = unsubscribeUrls(subscriber.email, token);
    const bodyHtml = `<p style="margin-top:0;margin-right:0;margin-bottom:18px;margin-left:0;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:29px;color:#3b3b3b;">${safeDek}</p><p style="margin-top:0;margin-right:0;margin-bottom:26px;margin-left:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:19px;color:#707070;">By ${safeAuthor} · ${safeDate}</p><table cellpadding="0" cellspacing="0" border="0" role="presentation"><tr><td bgcolor="#111111" style="background-color:#111111;"><a href="${safeArticleUrl}" style="display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#ffffff;text-decoration:none;padding-top:12px;padding-right:18px;padding-bottom:12px;padding-left:18px;">Read the essay</a></td></tr></table>`;
    const text = brandedEmailText(
      `${edition}\n\n${article.title}\n${article.dek}\n\nBy ${article.author} · ${formatDate(article.publishedAt)}\n\nRead: ${articleUrl}`,
      unsubscribe.visible
    );

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: KVISL_NEWSLETTER_FROM,
        to: [subscriber.email],
        reply_to: KVISL_REPLY_TO,
        subject,
        text,
        html: brandedEmailHtml({
          preheader: article.dek,
          eyebrow: edition,
          title: article.title,
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
    if (response.ok) sent += 1;
    else console.error('Newsletter send failed', subscriber.email, response.status, await response.text());
  }

  return { sent };
}
