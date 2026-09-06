import Link from 'next/link';
import type { Article } from '@/lib/types';
import { publicImageUrl } from '@/lib/media-url';
import { formatDate } from '@/lib/utils';

export function ArticleCard({ article, compact = false }: { article: Article; compact?: boolean }) {
  const coverImage = publicImageUrl(article.coverImage);
  return (
    <article className={compact ? 'article-card compact' : 'article-card'}>
      <Link href={`/articles/${article.slug}`} className="article-card-link">
        <div className="card-image">
          {coverImage ? (
            <img src={coverImage} alt={article.coverAlt || ''} loading="lazy" />
          ) : (
            <div className="image-placeholder" aria-hidden="true" />
          )}
        </div>
        <div className="card-copy">
          <p className="eyebrow">{article.section}</p>
          <h3>{article.title}</h3>
          <p className="dek">{article.dek}</p>
          <p className="byline">By {article.author} · {formatDate(article.publishedAt)}</p>
        </div>
      </Link>
    </article>
  );
}
