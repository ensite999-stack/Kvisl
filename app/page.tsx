import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { getPublishedArticles } from '@/lib/db';
import { publicImageUrl } from '@/lib/media-url';
import { SITE_DESCRIPTION, SITE_MOTTO, SITE_NAME, SITE_URL } from '@/lib/site-meta';
import { absoluteUrl } from '@/lib/utils';

export const revalidate = 60;

const title = `${SITE_NAME} — ${SITE_MOTTO}`;
const socialImage = absoluteUrl('/opengraph-image');

export const metadata: Metadata = {
  title: { absolute: title },
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [{
      url: socialImage,
      width: 1200,
      height: 630,
      type: 'image/png',
      alt: title
    }]
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description: SITE_DESCRIPTION,
    images: [socialImage]
  }
};

function BookmarkMark() {
  return (
    <svg className="feed-taxonomy-mark" viewBox="0 0 16 20" aria-hidden="true">
      <path d="M2.25 1.75h11.5v16l-5.75-3.7-5.75 3.7z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export default async function HomePage() {
  const articles = await getPublishedArticles(40);

  return (
    <div className="home kvisl-home">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/#home`,
        name: `${SITE_NAME} — ${SITE_MOTTO}`,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: articles.slice(0, 20).map((article, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: article.title,
            url: absoluteUrl(`/articles/${article.slug}`)
          }))
        }
      }} />

      {articles.length === 0 ? (
        <section className="home-empty" aria-label="No published articles">
          <p>No articles published yet.</p>
        </section>
      ) : (
        <div className="story-feed">
          {articles.map((article, index) => {
            const Heading = index === 0 ? 'h1' : 'h2';
            const coverImage = publicImageUrl(article.coverImage);
            const className = [
              'feed-story',
              index === 0 ? 'is-lead' : '',
              article.featured ? 'is-featured' : ''
            ].filter(Boolean).join(' ');

            return (
              <article className={className} key={article.slug}>
                <a className="feed-story-link" href={`/articles/${article.slug}`}>
                  {coverImage && (
                    <div className="feed-image">
                      <img src={coverImage} alt={article.coverAlt || ''} />
                    </div>
                  )}

                  <div className="feed-copy">
                    <p className="feed-taxonomy">
                      <BookmarkMark />
                      <span>Essay</span>
                      {article.section && <><span aria-hidden="true"> / </span><span>{article.section}</span></>}
                    </p>
                    <Heading>{article.title}</Heading>
                    {article.dek && <p className="feed-dek">{article.dek}</p>}
                    {article.author && <p className="feed-author">{article.author}</p>}
                  </div>
                </a>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
