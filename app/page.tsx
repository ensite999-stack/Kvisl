import { getPublishedArticles } from '@/lib/db';
import { publicImageUrl } from '@/lib/media-url';

export const revalidate = 60;

export default async function HomePage() {
  const articles = await getPublishedArticles(40);

  return (
    <div className="home kvisl-home">
      {articles.length === 0 ? (
        <section className="home-empty" aria-label="No published articles">
          <p>No articles published yet.</p>
        </section>
      ) : (
        <div className="story-feed">
          {articles.map((article, index) => {
            const taxonomy = [article.section, ...(article.tags || [])].filter(Boolean);
            const Heading = index === 0 ? 'h1' : 'h2';
            const coverImage = publicImageUrl(article.coverImage);

            return (
              <article className="feed-story" key={article.slug}>
                <a className="feed-story-link" href={`/articles/${article.slug}`}>
                  {coverImage && (
                    <div className="feed-image">
                      <img src={coverImage} alt={article.coverAlt || ''} />
                    </div>
                  )}

                  <div className="feed-copy">
                    {taxonomy.length > 0 && (
                      <p className="feed-taxonomy">{taxonomy.join(' / ')}</p>
                    )}
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
