import 'server-only';
import {
  cleanHttpUrl,
  isLikelyDirectImageUrl,
  providerImagePage,
  sourceNameFromUrl,
  type ImageProvider
} from './media-url';

export type ResolvedImage = {
  url: string;
  source: string;
  sourceUrl?: string;
  provider?: ImageProvider;
};

export class MediaResolutionError extends Error {
  constructor(
    public readonly code: 'INVALID_URL' | 'DIRECT_IMAGE_REQUIRED' | 'PROVIDER_KEY_MISSING' | 'PROVIDER_ERROR',
    message: string,
    public readonly provider?: ImageProvider
  ) {
    super(message);
  }
}

export function mediaConfiguration() {
  return {
    uploadConfigured: Boolean(
      process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN)
    ),
    unsplashConfigured: Boolean(process.env.UNSPLASH_ACCESS_KEY),
    pexelsConfigured: Boolean(process.env.PEXELS_API_KEY)
  };
}

async function resolveUnsplash(id: string): Promise<ResolvedImage> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    throw new MediaResolutionError(
      'PROVIDER_KEY_MISSING',
      'UNSPLASH_ACCESS_KEY is not configured. Paste an images.unsplash.com URL or add the key in Vercel.',
      'unsplash'
    );
  }

  const response = await fetch(`https://api.unsplash.com/photos/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' },
    next: { revalidate: 86_400 }
  });
  if (!response.ok) {
    throw new MediaResolutionError('PROVIDER_ERROR', `Unsplash returned ${response.status}.`, 'unsplash');
  }

  const image = await response.json();
  const url = cleanHttpUrl(image?.urls?.regular || image?.urls?.full || '');
  if (!url) throw new MediaResolutionError('PROVIDER_ERROR', 'Unsplash did not return an image URL.', 'unsplash');

  const photographer = String(image?.user?.name || '').trim();
  const sourceUrl = cleanHttpUrl(image?.links?.html || '');
  const creditUrl = sourceUrl
    ? `${sourceUrl}${sourceUrl.includes('?') ? '&' : '?'}utm_source=kvisl&utm_medium=referral`
    : undefined;

  return {
    url,
    source: photographer ? `Photo by ${photographer} on Unsplash` : 'Photo on Unsplash',
    sourceUrl: creditUrl,
    provider: 'unsplash'
  };
}

async function resolvePexels(id: string): Promise<ResolvedImage> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    throw new MediaResolutionError(
      'PROVIDER_KEY_MISSING',
      'PEXELS_API_KEY is not configured. Paste an images.pexels.com URL or add the key in Vercel.',
      'pexels'
    );
  }

  const response = await fetch(`https://api.pexels.com/v1/photos/${encodeURIComponent(id)}`, {
    headers: { Authorization: key },
    next: { revalidate: 86_400 }
  });
  if (!response.ok) {
    throw new MediaResolutionError('PROVIDER_ERROR', `Pexels returned ${response.status}.`, 'pexels');
  }

  const image = await response.json();
  const url = cleanHttpUrl(image?.src?.large2x || image?.src?.large || image?.src?.original || '');
  if (!url) throw new MediaResolutionError('PROVIDER_ERROR', 'Pexels did not return an image URL.', 'pexels');

  const photographer = String(image?.photographer || '').trim();
  return {
    url,
    source: photographer ? `Photo by ${photographer} on Pexels` : 'Photo on Pexels',
    sourceUrl: cleanHttpUrl(image?.url || ''),
    provider: 'pexels'
  };
}

export async function resolveImageUrl(value: string): Promise<ResolvedImage> {
  const clean = cleanHttpUrl(value);
  if (!clean) throw new MediaResolutionError('INVALID_URL', 'Use a valid http or https URL.');

  if (isLikelyDirectImageUrl(clean)) {
    return { url: clean, source: sourceNameFromUrl(clean) };
  }

  const page = providerImagePage(clean);
  if (!page) {
    throw new MediaResolutionError(
      'DIRECT_IMAGE_REQUIRED',
      'This is a webpage, not a direct image URL. Use a URL ending in .jpg, .png, .webp, .gif or .avif.'
    );
  }

  return page.provider === 'unsplash' ? resolveUnsplash(page.id) : resolvePexels(page.id);
}
