import type { APIRoute } from 'astro';
import { getPublishedArticles } from '../lib/db';
import { site as siteMeta } from '../lib/site';

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export const GET: APIRoute = async ({ site, url }) => {
  const base = site ?? new URL(url.origin);
  const articles = await getPublishedArticles(100);

  const items = articles.map((article) => {
    const link = new URL(`/essay/${article.slug}`, base).toString();
    return `<item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      ${article.published_at ? `<pubDate>${new Date(article.published_at).toUTCString()}</pubDate>` : ''}
      <description>${escapeXml(article.dek)}</description>
      <author>${escapeXml(article.author)}</author>
    </item>`;
  }).join('\n');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Kvisl</title>
    <link>${escapeXml(new URL('/', base).toString())}</link>
    <description>${escapeXml(siteMeta.description)}</description>
    <language>zh-CN</language>
    ${items}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600'
    }
  });
};
