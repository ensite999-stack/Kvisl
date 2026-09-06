import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ThemeProvider } from '@/components/theme-provider';
import { JsonLd } from '@/components/json-ld';
import { BrowserTitle } from '@/components/browser-title';
import { SecondaryClose } from '@/components/secondary-close';
import { absoluteUrl } from '@/lib/utils';
import { SITE_DESCRIPTION, SITE_LANGUAGE, SITE_LOCALE, SITE_MOTTO, SITE_NAME, SITE_URL } from '@/lib/site-meta';
import './globals.css';
import './aeon-refresh.css';
import './kvisl-v2.css';
import './close-controls.css';
import './home.css';
import './editor-enhancements.css';
import './editor-v2.css';
import './article.css';
import './header-overlay.css';
import './newsletter-feedback.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: { default: `${SITE_NAME} — ${SITE_MOTTO}`, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: ['independent magazine', 'long-form essays', 'essays', 'nature', 'culture', 'philosophy', 'humanities', 'ideas', 'deep reading'],
  authors: [{ name: SITE_NAME, url: absoluteUrl('/about') }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    types: { 'application/rss+xml': absoluteUrl('/feed.xml') }
  },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_MOTTO}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: SITE_LOCALE
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — ${SITE_MOTTO}`,
    description: SITE_DESCRIPTION
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  icons: {
    icon: [{ url: '/icon.svg?v=2', type: 'image/svg+xml', sizes: 'any' }],
    shortcut: ['/icon.svg?v=2']
  },
  category: 'magazine'
};

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={SITE_LANGUAGE} suppressHydrationWarning>
      <body>
        <ThemeProvider />
        <BrowserTitle />
        <JsonLd data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            '@id': `${SITE_URL}/#organization`,
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
            slogan: SITE_MOTTO,
            logo: {
              '@type': 'ImageObject',
              url: absoluteUrl('/kvisl-bimi.svg')
            },
            email: 'distributary@kvisl.com'
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            '@id': `${SITE_URL}/#website`,
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
            inLanguage: SITE_LANGUAGE,
            publisher: { '@id': `${SITE_URL}/#organization` },
            potentialAction: {
              '@type': 'SearchAction',
              target: `${SITE_URL}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string'
            }
          }
        ]} />
        <Header />
        <SecondaryClose />
        <main id="main-content">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
