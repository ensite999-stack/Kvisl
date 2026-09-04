import { getPublishedArticles } from '@/lib/db';
import { absoluteUrl } from '@/lib/utils';

function xml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;'
  }[char] || char));
}

export async function GET() {
  const articles = await getPublishedArticles(100);
  const items = articles.map((article) => `
    <item>
      <title>${xml(article.title)}</title>
      <link>${xml(absoluteUrl(`/articles/${article.slug}`))}</link>
      <guid>${xml(absoluteUrl(`/articles/${article.slug}`))}</guid>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <description>${xml(article.dek)}</description>
      <dc:creator>${xml(article.author)}</dc:creator>
    </item>`).join('');

  const body = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
    <channel>
      <title>Kvisl</title>
      <link>${absoluteUrl('/')}</link>
      <description>Independent essays on nature, culture and human thought.</description>
      <language>en</language>
      ${items}
    </channel>
  </rss>`;

  return new Response(body, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=300'
    }
  });
}
