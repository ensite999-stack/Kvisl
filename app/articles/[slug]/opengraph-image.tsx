import { ImageResponse } from 'next/og';
import { getArticleBySlug } from '@/lib/db';
import { SITE_MOTTO, SITE_NAME } from '@/lib/site-meta';

export const alt = 'Kvisl article preview';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function plainTextExcerpt(html: string, limit = 170) {
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return '';
  return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text;
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const title = article?.title || SITE_NAME;
  const description = article
    ? article.dek || article.subtitle || plainTextExcerpt(article.body)
    : SITE_MOTTO;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f4f1ea',
          color: '#111111',
          fontFamily: 'Arial, Helvetica, sans-serif',
          padding: '48px 56px 50px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 25,
            fontWeight: 700,
            letterSpacing: '-0.02em'
          }}
        >
          {SITE_NAME}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1040 }}>
          <div
            style={{
              display: 'flex',
              fontSize: title.length > 62 ? 48 : 58,
              lineHeight: 1.02,
              fontWeight: 700,
              letterSpacing: '-0.035em',
              marginBottom: 18
            }}
          >
            {title}
          </div>
          {description ? (
            <div
              style={{
                display: 'flex',
                maxWidth: 980,
                fontSize: 24,
                lineHeight: 1.32,
                fontWeight: 400,
                color: '#4d4d4d'
              }}
            >
              {description}
            </div>
          ) : null}
        </div>
      </div>
    ),
    size
  );
}
