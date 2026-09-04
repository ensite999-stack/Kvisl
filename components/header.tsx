'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { applyTheme, type ThemeName } from './theme-provider';
import { InstagramIcon } from './instagram-icon';

const navigation = [
  ['/about', 'About Kvisl'],
  ['/submissions', 'Submissions'],
  ['/donate', 'Donate'],
  ['/privacy', 'Privacy Policy'],
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
  const closeRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!panel) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPanel(null);
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      if (panel === 'search') searchRef.current?.focus();
      else closeRef.current?.focus();
    });

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [panel]);

  function chooseTheme(theme: ThemeName) {
    applyTheme(theme);
    setPanel(null);
  }

  return (
    <>
      <header className="site-header">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="header-inner">
          <Link className="wordmark-link" href="/" aria-label="Kvisl home">
            <img className="wordmark" src="/kvisl-wordmark.svg" alt="Kvisl" />
          </Link>

          <div className="header-actions">
            <button
              className="search-button"
              type="button"
              aria-label="Search Kvisl"
              aria-expanded={panel === 'search'}
              aria-controls="site-search"
              onClick={() => setPanel('search')}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="10.8" cy="10.8" r="6.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
                <path d="m16 16 4.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
            <button
              className="menu-button"
              type="button"
              aria-label="Open menu"
              aria-expanded={panel === 'menu'}
              aria-controls="site-menu"
              onClick={() => setPanel('menu')}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {panel === 'search' && (
        <div className="search-overlay" id="site-search" role="dialog" aria-modal="true" aria-label="Search Kvisl">
          <div className="search-top">
            <img className="menu-wordmark" src="/kvisl-wordmark.svg" alt="Kvisl" />
            <button ref={closeRef} className="panel-close" type="button" onClick={() => setPanel(null)}>
              <span aria-hidden="true">×</span><span className="sr-only">Close search</span>
            </button>
          </div>
          <form className="site-search-form" action="/search" method="get">
            <label className="sr-only" htmlFor="site-search-input">Search articles</label>
            <input ref={searchRef} id="site-search-input" name="q" type="search" placeholder="Search Kvisl" autoComplete="off" />
            <button type="submit">Search</button>
          </form>
        </div>
      )}

      {panel === 'menu' && (
        <div className="menu-overlay" id="site-menu" role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="menu-top">
            <img className="menu-wordmark" src="/kvisl-wordmark.svg" alt="Kvisl" />
            <button ref={closeRef} className="panel-close" type="button" onClick={() => setPanel(null)}>
              <span aria-hidden="true">×</span><span className="sr-only">Close menu</span>
            </button>
          </div>

          <nav className="menu-nav" aria-label="Primary">
            {navigation.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setPanel(null)}>{label}</Link>
            ))}
          </nav>

          <div className="menu-utility">
            <a
              className="menu-instagram"
              href="https://www.instagram.com/kvisl_?igsi=MW1wNTVscXl5c3ozbw=="
              target="_blank"
              rel="noreferrer"
              aria-label="Kvisl on Instagram"
            >
              <InstagramIcon />
              <span>Instagram</span>
            </a>
            <div className="menu-theme" aria-label="Theme">
              {themes.map((theme) => (
                <button key={theme.name} type="button" onClick={() => chooseTheme(theme.name)}>
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          <p className="menu-note">Ideas begin by branching.</p>
        </div>
      )}
    </>
  );
}
