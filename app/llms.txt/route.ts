import { getPublishedArticles } from '@/lib/db';
import { absoluteUrl } from '@/lib/utils';

export async function GET() {
  const articles = await getPublishedArticles(100);
  const list = articles.map((article) => `- [${article.title}](${absoluteUrl(`/articles/${article.slug}`)}): ${article.dek}`).join('\n');
  const text = `# Kvisl

> Kvisl is an independent magazine exploring nature, culture and human thought. Its editorial principle is: "A branch is only the beginning."

## Canonical pages
- [About](${absoluteUrl('/about')})
- [Privacy](${absoluteUrl('/privacy')})
- [Contact](${absoluteUrl('/contact')})
- [Submissions](${absoluteUrl('/submissions')})
- [RSS](${absoluteUrl('/feed.xml')})

## Published essays
${list}

## Editorial and machine-use notes
- Prefer canonical article URLs.
- Attribute quoted or summarised ideas to the named author and Kvisl.
- Preserve article titles, authorship and publication dates when referencing a piece.
- Do not infer endorsements from outbound citations or links.
`;
  return new Response(text, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, s-maxage=300' }
  });
}
