export type ImageProvider = 'pexels';

export type ProviderImagePage = {
  provider: ImageProvider;
  id: string;
  pageUrl: string;
};

const directImageHosts = new Set([
  'images.pexels.com',
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
    return host.includes('pexels.com') ? 'Photo on Pexels' : '';
  } catch {
    return '';
  }
}

export function providerImagePage(value: string): ProviderImagePage | null {
  const clean = cleanHttpUrl(value);
  if (!clean) return null;
  const url = new URL(clean);
  const host = url.hostname.replace(/^www\./, '').toLowerCase();

  if (host === 'pexels.com') {
    const segment = url.pathname.match(/(?:^|\/)photo\/([^/]+)/)?.[1] || '';
    const id = segment.match(/(?:^|-)(\d+)$/)?.[1];
    if (id) return { provider: 'pexels', id, pageUrl: clean };
  }

  return null;
}

export function isDirectPexelsImageUrl(value: string) {
  const clean = cleanHttpUrl(value);
  if (!clean) return false;
  return new URL(clean).hostname.toLowerCase() === 'images.pexels.com';
}

export function pexelsPhotoIdFromImageUrl(value: string) {
  const clean = cleanHttpUrl(value);
  if (!clean) return '';
  const url = new URL(clean);
  if (url.hostname.toLowerCase() !== 'images.pexels.com') return '';
  return url.pathname.match(/\/photos\/(\d+)(?:\/|$)/)?.[1] || '';
}

export function isLikelyDirectImageUrl(value: string) {
  const clean = cleanHttpUrl(value);
  if (!clean) return false;
  const url = new URL(clean);
  const host = url.hostname.toLowerCase();

  return (
    directImageHosts.has(host) ||
    host.endsWith('.public.blob.vercel-storage.com')
  );
}

export function publicImageUrl(value?: string) {
  if (!value) return undefined;
  const clean = cleanHttpUrl(value);
  if (!clean) return undefined;
  if (providerImagePage(clean)) return `/api/images/resolve?url=${encodeURIComponent(clean)}`;
  return isLikelyDirectImageUrl(clean) ? clean : undefined;
}
