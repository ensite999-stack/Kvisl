'use client';

import { usePathname } from 'next/navigation';

const secondaryRoutes = [
  '/about',
  '/submissions',
  '/donate',
  '/privacy',
  '/terms',
  '/contact',
  '/accessibility',
  '/copyright',
  '/newsletter-privacy',
  '/search'
] as const;

export function SecondaryClose() {
  const pathname = usePathname();
  const isSecondary = secondaryRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!isSecondary) return null;

  return (
    <a className="secondary-close" href="/" aria-label="Close page and return to Kvisl home">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5l14 14M19 5L5 19" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      </svg>
    </a>
  );
}
