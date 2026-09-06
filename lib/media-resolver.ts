import 'server-only';
import {
  cleanHttpUrl,
  isDirectPexelsImageUrl,
  pexelsPhotoIdFromImageUrl,
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
    pexelsConfigured: Boolean(process.env.PEXELS_API_KEY)
  };
}

async function resolvePexels(id: string, preferredUrl?: string): Promise<ResolvedImage> {
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
  const apiUrl = cleanHttpUrl(image?.src?.large2x || image?.src?.large || image?.src?.original || '');
  const url = preferredUrl || apiUrl;
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

  if (isDirectPexelsImageUrl(clean)) {
    const id = pexelsPhotoIdFromImageUrl(clean);
    if (id && process.env.PEXELS_API_KEY) {
      try {
        return await resolvePexels(id, clean);
      } catch {
        // A valid direct image should remain usable even if the credit lookup is temporarily unavailable.
      }
    }
    return { url: clean, source: sourceNameFromUrl(clean), provider: 'pexels' };
  }

  const page = providerImagePage(clean);
  if (!page) {
    throw new MediaResolutionError(
      'DIRECT_IMAGE_REQUIRED',
      'Use an images.pexels.com image URL or a Pexels photo-page URL.'
    );
  }

  return resolvePexels(page.id);
}
