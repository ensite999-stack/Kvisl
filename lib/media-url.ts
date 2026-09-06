export type ImageProvider = 'unsplash' | 'pexels';

export type ProviderImagePage = {
  provider: ImageProvider;
  id: string;
  pageUrl: string;
};

const directImageHosts = new Set([
  'images.unsplash.com',
  'images.pexels.com',
  'cdn.pixabay.com',
  'upload.wikimedia.org',
  'live.staticflickr.com',
  'blob.vercel-storage.com'
]);

export function cleanHttpUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '';
  } catch {
    return '';
  }
}

export function sourceNameFromUrl(value: string) {
  try {
    const host = new URL(value).hostname.replace(/^www\./, '').toLowerCase();
    if (host.includes('unsplash.com')) return 'Unsplash';
    if (host.includes('pexels.com')) return 'Pexels';
    if (host.includes('pixabay.com')) return 'Pixabay';
    if (host.includes('wikimedia.org') || host.includes('wikipedia.org')) return 'Wikimedia Commons';
    if (host.includes('flickr.com') || host.includes('staticflickr.com')) return 'Flickr';
    return host;
  } catch {
    return '';
  }
}

export function providerImagePage(value: string): ProviderImagePage | null {
  const clean = cleanHttpUrl(value);
  if (!clean) return null;
  const url = new URL(clean);
  const host = url.hostname.replace(/^www\./, '').toLowerCase();

  if (host === 'unsplash.com') {
    const segment = url.pathname.match(/^\/photos\/([^/]+)/)?.[1] || '';
    const id = segment.match(/([a-zA-Z0-9_-]{11})$/)?.[1];
    if (id) return { provider: 'unsplash', id, pageUrl: clean };
  }

  if (host === 'pexels.com') {
    const segment = url.pathname.match(/^\/photo\/([^/]+)/)?.[1] || '';
    const id = segment.match(/(?:^|-)(\d+)$/)?.[1];
    if (id) return { provider: 'pexels', id, pageUrl: clean };
  }

  return null;
}

export function isLikelyDirectImageUrl(value: string) {
  const clean = cleanHttpUrl(value);
  if (!clean) return false;
  const url = new URL(clean);
  const host = url.hostname.toLowerCase();

  return (
    directImageHosts.has(host) ||
    host.endsWith('.public.blob.vercel-storage.com') ||
    /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(url.pathname)
  );
}

export function publicImageUrl(value?: string) {
  if (!value) return undefined;
  const clean = cleanHttpUrl(value);
  if (!clean) return undefined;
  return providerImagePage(clean) ? `/api/images/resolve?url=${encodeURIComponent(clean)}` : clean;
}
