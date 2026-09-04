import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getAllArticles, saveArticle } from '@/lib/db';
import type { ArticleInput, ArticleSource } from '@/lib/types';
import { sanitizeArticleHtml } from '@/lib/sanitize';
import { slugify } from '@/lib/utils';

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

function parseArticle(body: any): ArticleInput {
  const title = String(body?.title || '').trim();
  const slug = slugify(String(body?.slug || title));
  if (!title || !slug) throw new Error('Title is required.');

  return {
    slug,
    title: title.slice(0, 220),
    dek: String(body?.dek || '').trim().slice(0, 600),
    body: sanitizeArticleHtml(String(body?.body || '')),
    author: String(body?.author || 'Kvisl Editors').trim().slice(0, 120),
    publishedAt: String(body?.publishedAt || new Date().toISOString()),
    status: body?.status === 'published' ? 'published' : 'draft',
    section: String(body?.section || 'Essay').trim().slice(0, 80),
    coverImage: body?.coverImage ? String(body.coverImage).trim() : undefined,
    coverAlt: body?.coverAlt ? String(body.coverAlt).trim().slice(0, 300) : undefined,
    supportingImages: Array.isArray(body?.supportingImages) ? body.supportingImages.map(String).filter(Boolean).slice(0, 30) : [],
    sources: normaliseSources(body?.sources),
    featured: Boolean(body?.featured)
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    return NextResponse.json({ articles: await getAllArticles() });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to load articles.' }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const article = parseArticle(await request.json());
    return NextResponse.json({ article: await saveArticle(article) });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to save article.' }, { status: 400 });
  }
}
