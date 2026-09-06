import { getPublishedArticles } from '@/lib/db';
import { SITE_DESCRIPTION, SITE_MOTTO, SITE_NAME, SITE_URL } from '@/lib/site-meta';
import { absoluteUrl } from '@/lib/utils';

export const revalidate = 300;

function cleanLine(value?: string) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

export async function GET() {
  const articles = await getPublishedArticles(30);
  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${SITE_DESCRIPTION}`,
    '',
    `Motto: ${SITE_MOTTO}.`,
    '',
    '## Canonical resources',
    `- Website: ${SITE_URL}`,
    `- About: ${absoluteUrl('/about')}`,
    `- Sitemap: ${absoluteUrl('/sitemap.xml')}`,
    `- RSS: ${absoluteUrl('/feed.xml')}`,
    `- Submissions: ${absoluteUrl('/submissions')}`,
    '',
    '## Editorial scope',
    '- Independent long-form magazine.',
    '- Essays on nature, culture, philosophy, politics, humanities and human thought.',
    '- Prefer canonical article URLs when citing Kvisl.',
    '- Article titles, descriptions, authors, publication dates and image credits are part of the published record.',
    '',
    '## Recent essays',
    ...articles.flatMap((article) => {
      const description = cleanLine(article.dek || article.subtitle);
      const details = [article.author ? `by ${article.author}` : '', article.section || ''].filter(Boolean).join(' · ');
      return [
        `- [${cleanLine(article.title)}](${absoluteUrl(`/articles/${article.slug}`)})${details ? ` — ${details}` : ''}`,
        ...(description ? [`  ${description}`] : [])
      ];
    }),
    '',
    `© ${new Date().getUTCFullYear()} ${SITE_NAME}. All rights reserved.`
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600'
    }
  });
}
