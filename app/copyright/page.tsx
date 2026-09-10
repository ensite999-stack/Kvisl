import type { Metadata } from 'next';
import { SITE_EMAIL } from '@/lib/site-meta';

export const metadata: Metadata = {
  title: 'Copyright Notice',
  description: 'Copyright and permissions information for Crawe.'
};

export default function CopyrightPage() {
  return (
    <article className="static-page">
      <header className="static-hero">
        <p className="eyebrow">Copyright</p>
        <h1>Rights, quotation and republication.</h1>
      </header>
      <div className="prose narrow">
        <p>© 2026 Crawe. Unless otherwise credited or licensed, Crawe’s site design and original editorial material are protected by applicable copyright law.</p>
        <h2>Quoting Crawe</h2>
        <p>Reasonable quotation for criticism, review, scholarship, reporting and other uses allowed by applicable law is welcome when the author, article title and Crawe are clearly credited and a link is provided where practical.</p>
        <h2>Republication and licensing</h2>
        <p>For republication, translation, syndication, classroom packets, commercial reuse or image permissions, contact <a href={`mailto:${SITE_EMAIL}`}>{SITE_EMAIL}</a> before use unless the relevant page carries a licence that already permits it.</p>
        <h2>Contributor rights</h2>
        <p>Contributor-owned material remains subject to the rights agreed with that contributor. Third-party photographs, artworks and excerpts may be governed by separate rights notices.</p>
      </div>
    </article>
  );
}
