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
import './globals.css';
import './aeon-refresh.css';
import './kvisl-v2.css';
import './close-controls.css';
import './home.css';
import './editor-enhancements.css';
import './editor-v2.css';
import './article.css';
import './header-overlay.css';

const motto = 'Sparking Thought, Growing Wild';
const description = `${motto}. Kvisl is an independent magazine exploring nature, culture and human thought through essays, deep reading and quiet reflection.`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://kvisl.com'),
  title: { default: motto, template: '%s — Kvisl' },
  description,
  keywords: ['independent magazine', 'essays', 'nature', 'culture', 'philosophy', 'humanities', 'ideas'],
  authors: [{ name: 'Kvisl', url: absoluteUrl('/about') }],
  creator: 'Kvisl', publisher: 'Kvisl', alternates: { canonical: '/' },
  openGraph: { type: 'website', siteName: 'Kvisl', title: 'Kvisl — Sparking Thought, Growing Wild', description, url: '/' },
  twitter: { card: 'summary_large_image', title: 'Kvisl — Sparking Thought, Growing Wild', description },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider />
        <BrowserTitle />
        <JsonLd data={[
          { '@context': 'https://schema.org', '@type': 'Organization', name: 'Kvisl', url: absoluteUrl('/'), slogan: motto },
          { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Kvisl', url: absoluteUrl('/'), description }
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
