'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { applyTheme, type ThemeName } from './theme-provider';

const navigation = [
  ['/about', 'About Kvisl'],
  ['/privacy', 'Privacy Policy'],
  ['/donate', 'Donate'],
  ['/contact', 'Contact']
] as const;

const themes: { name: ThemeName; label: string }[] = [
  { name: 'dark', label: 'Dark mode' },
  { name: 'light', label: 'Light mode' },
  { name: 'comfort', label: 'Eye comfort mode' }
];

export function Header() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open]);

  function chooseTheme(theme: ThemeName) {
    applyTheme(theme);
    setOpen(false);
  }

  return (
    <>
      <header className="site-header">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="header-inner">
          <div className="header-kicker" aria-hidden="true">Independent magazine</div>
          <Link className="wordmark-link" href="/" aria-label="Kvisl home">
            <img className="wordmark" src="/kvisl-wordmark.svg" alt="Kvisl" />
          </Link>
          <button
            className="menu-button"
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {open && (
        <div className="menu-overlay" id="site-menu" role="dialog" aria-modal="true" aria-label="Site menu">
          <div className="menu-top">
            <span className="menu-brand">Kvisl</span>
            <button ref={closeRef} className="menu-close" type="button" onClick={() => setOpen(false)}>
              <span aria-hidden="true">×</span><span className="sr-only">Close menu</span>
            </button>
          </div>
          <nav className="menu-nav" aria-label="Primary">
            {navigation.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
            ))}
          </nav>
          <div className="menu-theme" aria-label="Theme">
            {themes.map((theme) => (
              <button key={theme.name} type="button" onClick={() => chooseTheme(theme.name)}>
                {theme.label}
              </button>
            ))}
          </div>
          <p className="menu-note">A branch is only the beginning.</p>
        </div>
      )}
    </>
  );
}
