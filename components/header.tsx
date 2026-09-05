'use client';

import { useEffect, useRef, useState } from 'react';
import { applyTheme, type ThemeName } from './theme-provider';
import { InstagramIcon } from './instagram-icon';

const navigation = [
  ['/about', 'About Kvisl'],
  ['/submissions', 'Pitch an essay'],
  ['/donate', 'Donate'],
  ['/privacy', 'Privacy Policy'],
  ['/terms', 'Terms of Service'],
  ['/contact', 'Contact']
] as const;

const themes: { name: ThemeName; label: string }[] = [
  { name: 'light', label: 'Light' },
  { name: 'dark', label: 'Dark' },
  { name: 'comfort', label: 'Eye comfort' }
];

type Panel = 'menu' | 'search' | null;

export function Header() {
  const [panel, setPanel] = useState<Panel>(null);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPanel(null);
    };
    document.addEventListener('keydown', onKeyDown);
    if (panel === 'search') requestAnimationFrame(() => searchRef.current?.focus());
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [panel]);

  function chooseTheme(theme: ThemeName) {
    applyTheme(theme);
    setPanel(null);
  }

  const menuOpen = panel === 'menu';

  return (
    <header className={`site-header${scrolled || panel ? ' is-scrolled' : ''}`}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="header-inner">
        <a className="wordmark-link notranslate" translate="no" href="/" aria-label="Kvisl home">
          <img className="wordmark" src="/kvisl-wordmark.svg" alt="Kvisl" />
        </a>

        <div className="header-actions">
          <button
            className="search-button"
            type="button"
            aria-label="Search Kvisl"
            aria-expanded={panel === 'search'}
            onClick={() => setPanel(panel === 'search' ? null : 'search')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.6" cy="10.6" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="m15.4 15.4 4.4 4.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" /></svg>
          </button>
          <button
            className={`menu-button${menuOpen ? ' is-open' : ''}`}
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Menu'}
            aria-expanded={menuOpen}
            onClick={() => setPanel(menuOpen ? null : 'menu')}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {panel === 'search' && (
        <div className="header-panel search-panel" role="dialog" aria-label="Search Kvisl">
          <form className="site-search-form" action="/search" method="get">
            <label className="sr-only" htmlFor="site-search-input">Search articles</label>
            <input ref={searchRef} id="site-search-input" name="q" type="search" placeholder="Search Kvisl" autoComplete="off" />
            <button type="submit">Search</button>
          </form>
        </div>
      )}

      {menuOpen && (
        <div className="header-panel menu-panel" role="dialog" aria-label="Site menu">
          <nav className="menu-nav" aria-label="Primary">
            {navigation.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setPanel(null)}>{label}</a>
            ))}
          </nav>
          <div className="menu-utility">
            <a className="menu-instagram" href="https://www.instagram.com/kvisl_?igsi=MW1wNTVscXl5c3ozbw==" target="_blank" rel="noreferrer" aria-label="Kvisl on Instagram">
              <InstagramIcon /><span>Instagram</span>
            </a>
            <div className="menu-theme" aria-label="Theme">
              {themes.map((theme) => <button key={theme.name} type="button" onClick={() => chooseTheme(theme.name)}>{theme.label}</button>)}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
