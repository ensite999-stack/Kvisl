import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms governing use of the Kvisl website.'
};

export default function TermsPage() {
  return (
    <article className="static-page">
      <header className="static-hero">
        <p className="eyebrow">Terms of Service</p>
        <h1>Terms for using Kvisl.</h1>
        <p>Last updated: 4 September 2026.</p>
      </header>
      <div className="prose narrow">
        <p>By using this website, you agree to use it lawfully and in a way that does not interfere with the site, its infrastructure, its authors, or other readers.</p>
        <h2>Editorial content</h2>
        <p>Kvisl publishes essays, commentary and other editorial material for general informational and cultural purposes. Nothing on this site should be treated as professional legal, medical, financial or other regulated advice unless explicitly stated otherwise.</p>
        <h2>Intellectual property</h2>
        <p>Unless a page states otherwise, Kvisl and its contributors retain the rights in text, design, illustrations, photography and other original material. Limited quotation, linking and other uses permitted by applicable law remain unaffected.</p>
        <h2>User submissions</h2>
        <p>Sending a pitch or manuscript does not transfer ownership. You represent that you have the right to submit the material. Publication rights, edits, payment and licensing are governed by any separate agreement made with the author.</p>
        <h2>Availability</h2>
        <p>We may change, suspend or remove parts of the site when necessary. We do not guarantee uninterrupted availability or that every archived page will remain permanently accessible.</p>
        <h2>External links</h2>
        <p>Links to external sites are provided for reference. Kvisl does not control those sites and is not responsible for their content, security or privacy practices.</p>
        <h2>Donations</h2>
        <p>Digital-asset transfers are made at the sender’s discretion. Verify the network, asset and address before sending. Unless required by law, mistaken or incompatible blockchain transfers may not be recoverable.</p>
        <h2>Contact</h2>
        <p>Questions about these terms: <a href="mailto:distributary@kvisl.com">distributary@kvisl.com</a>.</p>
      </div>
    </article>
  );
}
