import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Newsletter privacy policy',
  description: 'How Kvisl handles email addresses and newsletter preferences.'
};

export default function NewsletterPrivacyPage() {
  return (
    <article className="static-page">
      <header className="static-hero"><p className="eyebrow">Newsletter</p><h1>Newsletter privacy policy</h1></header>
      <div className="prose narrow">
        <p>When you subscribe, Kvisl stores your email address and your selected delivery frequency: daily or weekly. We use that information only to deliver the newsletter and manage your subscription.</p>
        <p>Newsletter delivery is handled through Resend. Kvisl does not enable advertising trackers, and our Resend domain is configured without open or click tracking.</p>
        <p>Every newsletter includes an unsubscribe link. Unsubscribing marks the address as inactive for newsletter delivery.</p>
        <p>For questions about newsletter data, use the Contact page.</p>
      </div>
    </article>
  );
}
