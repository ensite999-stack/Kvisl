import { ArticleCard } from '@/components/article-card';
import { getPublishedArticles } from '@/lib/db';
import { formatDate } from '@/lib/utils';

export const revalidate = 60;

export default async function HomePage() {
  const articles = await getPublishedArticles(24);
  const lead = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="home kvisl-home">
      {lead && (
        <section className="lead-story lead-story-first kvisl-lead" aria-labelledby="lead-story-title">
          <a href={`/articles/${lead.slug}`} className="lead-link">
            <div className="lead-image">
              {lead.coverImage ? (
                <img src={lead.coverImage} alt={lead.coverAlt || ''} />
              ) : (
                <div className="lead-placeholder" aria-hidden="true" />
              )}
            </div>
            <div className="lead-copy">
              <div className="lead-taxonomy">
                <p className="eyebrow">{lead.section}</p>
                {lead.tags.length > 0 && <p className="lead-tags">{lead.tags.join(' · ')}</p>}
              </div>
              <h1 id="lead-story-title">{lead.title}</h1>
              <p className="lead-dek">{lead.dek}</p>
              <p className="byline"><span>{formatDate(lead.publishedAt)}</span><span>By {lead.author}</span></p>
            </div>
          </a>
        </section>
      )}

      {rest.length > 0 && (
        <section className="latest" aria-labelledby="latest-title">
          <div className="section-heading"><h2 id="latest-title">Latest</h2></div>
          <div className="article-grid">
            {rest.map((article) => <ArticleCard key={article.slug} article={article} />)}
          </div>
        </section>
      )}
    </div>
  );
}
