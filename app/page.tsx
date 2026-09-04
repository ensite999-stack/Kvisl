import { ArticleCard } from '@/components/article-card';
import { getPublishedArticles } from '@/lib/db';
import { formatDate } from '@/lib/utils';

export const revalidate = 60;

export default async function HomePage() {
  const articles = await getPublishedArticles(24);
  const lead = articles.find((article) => article.featured) || articles[0];
  const rest = articles.filter((article) => article.slug !== lead?.slug);

  return (
    <div className="home aeon-home">
      <section className="home-intro" aria-labelledby="home-intro-title">
        <div>
          <p className="section-label">Independent magazine</p>
          <h1 id="home-intro-title">Ideas begin by branching.</h1>
        </div>
        <p>Essays on nature, culture and human thought, made for slower reading and wider questions.</p>
      </section>

      {lead && (
        <section className="lead-story" aria-labelledby="lead-story-title">
          <a href={`/articles/${lead.slug}`} className="lead-link">
            <div className="lead-image">
              {lead.coverImage ? (
                <img src={lead.coverImage} alt={lead.coverAlt || ''} />
              ) : (
                <div className="lead-placeholder" aria-hidden="true"><img src="/kvisl-wordmark.svg" alt="" /></div>
              )}
            </div>
            <div className="lead-copy">
              <p className="eyebrow">{lead.section}</p>
              <h2 id="lead-story-title">{lead.title}</h2>
              <p className="lead-dek">{lead.dek}</p>
              <p className="byline">By {lead.author} · {formatDate(lead.publishedAt)}</p>
            </div>
          </a>
        </section>
      )}

      <section className="latest" aria-labelledby="latest-title">
        <div className="section-heading">
          <h2 id="latest-title">Latest</h2>
          <span>{articles.length} pieces</span>
        </div>
        <div className="article-grid">
          {rest.map((article) => <ArticleCard key={article.slug} article={article} />)}
        </div>
      </section>
    </div>
  );
}
