import type { Metadata } from 'next';
import { unsubscribeNewsletter, validUnsubscribeToken } from '@/lib/newsletter-digest';

export const metadata: Metadata = { title: 'Newsletter preferences', robots: { index: false, follow: false } };

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ email?: string; token?: string }> }) {
  const params = await searchParams;
  const email = String(params.email || '').trim().toLowerCase();
  const token = String(params.token || '');
  const valid = Boolean(email && token && validUnsubscribeToken(email, token));
  if (valid) await unsubscribeNewsletter(email);

  return (
    <article className="static-page">
      <header className="static-hero"><p className="eyebrow">Newsletter</p><h1>{valid ? 'You are unsubscribed.' : 'This unsubscribe link is invalid.'}</h1></header>
      <div className="prose narrow"><p>{valid ? 'You will no longer receive Kvisl newsletters at this address.' : 'The link may have expired or been altered. You can contact Kvisl if you need help with your subscription.'}</p></div>
    </article>
  );
}
