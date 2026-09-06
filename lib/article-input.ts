import type { ArticleInput, ArticleSource } from './types';
import { sanitizeArticleHtml } from './sanitize';
import { slugify } from './utils';

function normaliseSources(value: unknown): ArticleSource[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item: any) => ({
      label: String(item?.label || '').trim(),
      url: item?.url ? String(item.url).trim() : undefined,
      note: item?.note ? String(item.note).trim() : undefined
    }))
    .filter((item) => item.label)
    .slice(0, 50);
}

function normaliseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  return value
    .map((item) => String(item).trim())
    .filter((item) => {
      if (!item || item.length > 60) return false;
      const key = item.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 20);
}

function optionalUrl(value: unknown) {
  const candidate = value ? String(value).trim() : '';
  if (!candidate) return undefined;

  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

export function parseArticleInput(body: any): ArticleInput {
  const title = String(body?.title || '').trim();
  const slug = slugify(String(body?.slug || title));
  if (!title || !slug) throw new Error('Title is required.');

  return {
    slug,
    title: title.slice(0, 220),
    subtitle: body?.subtitle ? String(body.subtitle).trim().slice(0, 320) : undefined,
    dek: String(body?.dek || '').trim().slice(0, 600),
    body: sanitizeArticleHtml(String(body?.body || '')),
    author: String(body?.author || 'Kvisl Editors').trim().slice(0, 120),
    publishedAt: String(body?.publishedAt || new Date().toISOString()),
    status: body?.status === 'published' ? 'published' : 'draft',
    section: String(body?.section || '').trim().slice(0, 80),
    tags: normaliseTags(body?.tags),
    coverImage: optionalUrl(body?.coverImage),
    coverAlt: body?.coverAlt ? String(body.coverAlt).trim().slice(0, 300) : undefined,
    coverSource: body?.coverSource ? String(body.coverSource).trim().slice(0, 500) : undefined,
    coverSourceUrl: optionalUrl(body?.coverSourceUrl),
    supportingImages: Array.isArray(body?.supportingImages)
      ? body.supportingImages
          .map((image: unknown) => optionalUrl(image))
          .filter((value: string | undefined): value is string => Boolean(value))
          .slice(0, 30)
      : [],
    sources: normaliseSources(body?.sources),
    featured: Boolean(body?.featured)
  };
}
