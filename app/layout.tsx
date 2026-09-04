import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ThemeProvider } from '@/components/theme-provider';
import { JsonLd } from '@/components/json-ld';
import { absoluteUrl } from '@/lib/utils';
import './globals.css';

const description = 'Kvisl is an independent space exploring the meeting points of nature, culture and human thought through essays, deep reading and quiet reflection.';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://kvisl.com'),
  title: {
    default: 'Kvisl — A branch is only the beginning',
    template: '%s — Kvisl'
  },
  description,
  keywords: ['independent magazine', 'essays', 'nature', 'culture', 'philosophy', 'humanities', 'ideas'],
  authors: [{ name: 'Kvisl', url: absoluteUrl('/about') }],
  creator: 'Kvisl',
  publisher: 'Kvisl',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Kvisl',
    title: 'Kvisl — A branch is only the beginning',
    description,
    url: '/'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kvisl — A branch is only the beginning',
    description
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
  category: 'magazine'
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f0e8' },
    { media: '(prefers-color-scheme: dark)', color: '#11110f' }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider />
        <JsonLd data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Kvisl',
            url: absoluteUrl('/'),
            email: 'distributary@kvisl.com',
            slogan: 'A branch is only the beginning'
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Kvisl',
            url: absoluteUrl('/'),
            description
          }
        ]} />
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
