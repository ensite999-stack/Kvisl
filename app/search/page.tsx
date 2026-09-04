import type { Metadata } from 'next';
import { ArticleCard } from '@/components/article-card';
import { getPublishedArticles } from '@/lib/db';

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true }
};

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const term = (raw || '').trim();
  const articles = await getPublishedArticles(100);
  const needle = term.toLowerCase();
  const results = term
    ? articles.filter((article) =>
        [article.title, article.dek, article.author, article.section]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle))
      )
    : [];

  return (
    <div className="search-page">
      <header className="search-page-header">
        <p className="eyebrow">Search Kvisl</p>
        <form className="search-page-form" action="/search" method="get">
          <label className="sr-only" htmlFor="search-page-input">Search articles</label>
          <input id="search-page-input" name="q" type="search" defaultValue={term} placeholder="Search articles" autoFocus />
          <button type="submit">Search</button>
        </form>
      </header>

      <section className="search-results" aria-live="polite">
        {term ? (
          <>
            <div className="section-heading">
              <h1>{results.length ? `Results for “${term}”` : `No results for “${term}”`}</h1>
              <span>{results.length} found</span>
            </div>
            {results.length > 0 && (
              <div className="article-grid">
                {results.map((article) => <ArticleCard key={article.slug} article={article} />)}
              </div>
            )}
          </>
        ) : (
          <p className="search-empty">Enter a title, topic, author or section.</p>
        )}
      </section>
    </div>
  );
}
