import type { APIRoute } from 'astro';
import { getPublishedArticles } from '../lib/db';

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export const GET: APIRoute = async ({ site, url }) => {
  const base = site ?? new URL(url.origin);
  const articles = await getPublishedArticles(1000);
  const staticPaths = ['/', '/archive', '/about', '/subscribe', '/contact', '/search', '/privacy', '/use', '/copyright', '/donate'];
  const entries = [
    ...staticPaths.map((path) => ({ loc: new URL(path, base).toString(), lastmod: null })),
    ...articles.map((article) => ({ loc: new URL(`/essay/${article.slug}`, base).toString(), lastmod: article.published_at }))
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => `  <url><loc>${escapeXml(entry.loc)}</loc>${entry.lastmod ? `<lastmod>${escapeXml(new Date(entry.lastmod).toISOString())}</lastmod>` : ''}</url>`).join('\n')}
</urlset>`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
