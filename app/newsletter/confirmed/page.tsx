import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Newsletter confirmation',
  robots: { index: false, follow: false }
};

export default async function NewsletterConfirmedPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string; frequency?: string }>;
}) {
  const params = await searchParams;
  const success = params.status === 'success';
  const frequency = params.frequency === 'daily' ? 'daily' : 'weekly';

  return (
    <article className="static-page">
      <header className="static-hero">
        <p className="eyebrow">Newsletter</p>
        <h1>{success ? 'Subscription confirmed.' : 'This confirmation link is invalid.'}</h1>
      </header>
      <div className="prose narrow">
        <p>
          {success
            ? `You are now subscribed to the ${frequency} Kvisl newsletter.`
            : 'The link may have expired, already been used, or been altered. Submit your email again to receive a new confirmation link.'}
        </p>
        <p><Link href="/">Return to Kvisl</Link></p>
      </div>
    </article>
  );
}
