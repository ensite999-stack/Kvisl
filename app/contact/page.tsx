import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Kvisl',
  description: 'Contact Kvisl for editorial correspondence, rights, accessibility requests and general enquiries.'
};

export default function ContactPage() {
  return (
    <article className="static-page">
      <header className="static-hero">
        <p className="eyebrow">Contact Kvisl</p>
        <h1>Write to Kvisl.</h1>
      </header>
      <div className="prose narrow">
        <p>For editorial correspondence, rights, accessibility requests and general enquiries, email <a href="mailto:distributary@kvisl.com">distributary@kvisl.com</a>.</p>
        <p>For essays and article proposals, please use our dedicated <Link href="/submissions">Submissions</Link> page.</p>
        <h2>Accessibility</h2>
        <p>If any part of the site is difficult to use, include the page URL, your browser or assistive technology if relevant, and what you were trying to do. We will treat accessibility reports as product issues, not as reader inconvenience.</p>
      </div>
    </article>
  );
}
