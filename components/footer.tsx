import Link from 'next/link';
import { Newsletter } from './newsletter';
import { InstagramIcon } from './instagram-icon';

const footerLinks = [
  ['/about', 'About Kvisl'],
  ['/submissions', 'Submissions'],
  ['/contact', 'Contact'],
  ['/donate', 'Donate'],
  ['/accessibility', 'Accessibility'],
  ['/copyright', 'Copyright']
] as const;

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-block">
          <img className="footer-wordmark" src="/kvisl-wordmark.svg" alt="Kvisl" />
          <p className="footer-tagline">Ideas begin by branching.</p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          {footerLinks.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
        </nav>

        <div className="footer-social">
          <p>Follow Kvisl</p>
          <a
            href="https://www.instagram.com/kvisl_?igsi=MW1wNTVscXl5c3ozbw=="
            target="_blank"
            rel="noreferrer"
            aria-label="Kvisl on Instagram"
          >
            <InstagramIcon />
            <span>Instagram</span>
          </a>
        </div>

        <Newsletter />
      </div>

      <div className="footer-legal">
        <p>© 2026 Kvisl. All rights reserved.</p>
        <div>
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
