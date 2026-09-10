import { Newsletter } from './newsletter';
import { InstagramIcon } from './instagram-icon';

const footerLinks = [
  ['/about', 'About Crawe'],
  ['/submissions', 'Editorial Submissions'],
  ['/contact', 'Contact'],
  ['/donate', 'Donate'],
  ['/privacy', 'Privacy Policy'],
  ['/terms', 'Terms of Service'],
  ['/accessibility', 'Accessibility'],
  ['/copyright', 'Copyright']
] as const;

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand-block notranslate" translate="no">
          <div className="footer-brand-lockup">
            <img className="crawe-mark" src="/crawe-mark.svg" alt="" aria-hidden="true" />
            <span className="crawe-name">Crawe</span>
          </div>
          <p className="footer-tagline">Sparking Thought, Growing Wild</p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          {footerLinks.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
        </nav>

        <a className="footer-instagram" href="https://www.instagram.com/kvisl_?igsi=MW1wNTVscXl5c3ozbw==" target="_blank" rel="noreferrer" aria-label="Crawe on Instagram">
          <InstagramIcon /><span>Instagram</span>
        </a>

        <Newsletter />

        <div className="footer-legal">
          <p>© 2026 <span className="notranslate" translate="no">Crawe</span>. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
