import Link from 'next/link';
import { Newsletter } from './newsletter';

const footerLinks = [
  ['/about', 'About Kvisl'],
  ['/privacy', 'Privacy Policy'],
  ['/terms', 'Terms of Service'],
  ['/copyright', 'Copyright Notice'],
  ['/contact', 'Contact Kvisl'],
  ['/submissions', 'Submissions'],
  ['/accessibility', 'Accessibility Statement']
] as const;

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <img className="footer-wordmark" src="/kvisl-wordmark.svg" alt="Kvisl" />
        <p className="footer-tagline">A branch is only the beginning.</p>
        <Newsletter />
        <nav className="footer-nav" aria-label="Footer">
          {footerLinks.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>
        <a className="footer-email" href="mailto:distributary@kvisl.com">distributary@kvisl.com</a>
        <p className="footer-copy">© 2026 Kvisl. All rights reserved.</p>
      </div>
    </footer>
  );
}
