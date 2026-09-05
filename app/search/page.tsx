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

  const categoryCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();
  for (const article of articles) {
    const category = article.section?.trim();
    if (category) categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    for (const rawTag of article.tags || []) {
      const tag = rawTag.trim();
      if (tag) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  const sortTerms = (map: Map<string, number>) =>
    [...map.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const categories = sortTerms(categoryCounts);
  const tags = sortTerms(tagCounts);

  const results = term
    ? articles.filter((article) =>
        [article.title, article.subtitle, article.dek, article.author, article.section, ...(article.tags || [])]
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

        {(categories.length > 0 || tags.length > 0) && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
            {categories.length > 0 && (
              <div style={{ marginBottom: tags.length ? 20 : 0 }}>
                <p style={{ margin: '0 0 10px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)' }}>Categories</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {categories.map((item) => (
                    <a key={`category-${item.name}`} href={`/search?q=${encodeURIComponent(item.name)}`} style={{ border: '1px solid var(--line)', padding: '7px 10px', textDecoration: 'none', fontSize: 14 }}>
                      {item.name} <span style={{ color: 'var(--muted)' }}>({item.count})</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {tags.length > 0 && (
              <div>
                <p style={{ margin: '0 0 10px', fontSize: 12, textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)' }}>Tags</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {tags.map((item) => (
                    <a key={`tag-${item.name}`} href={`/search?q=${encodeURIComponent(item.name)}`} style={{ border: '1px solid var(--line)', padding: '7px 10px', textDecoration: 'none', fontSize: 14 }}>
                      {item.name} <span style={{ color: 'var(--muted)' }}>({item.count})</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
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
          <p className="search-empty">Search by title, subtitle, author, category or tag, or choose one above.</p>
        )}
      </section>
    </div>
  );
}
