import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/json-ld';
import { ShareButtons } from '@/components/share-buttons';
import { getArticleBySlug } from '@/lib/db';
import { sanitizeArticleHtml } from '@/lib/sanitize';
import { absoluteUrl, formatDate } from '@/lib/utils';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== 'published') return {};
  const description = article.dek || article.subtitle || undefined;
  return {
    title: article.title,
    description,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description,
      url: `/articles/${article.slug}`,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      images: article.coverImage ? [{ url: article.coverImage, alt: article.coverAlt || article.title }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: article.coverImage ? [article.coverImage] : undefined
    }
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== 'published') notFound();

  const clean = sanitizeArticleHtml(article.body);
  const articleUrl = absoluteUrl(`/articles/${article.slug}`);

  return (
    <article className="essay">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        alternativeHeadline: article.subtitle || undefined,
        description: article.dek || article.subtitle || undefined,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt || article.publishedAt,
        mainEntityOfPage: articleUrl,
        image: article.coverImage || undefined,
        author: { '@type': 'Person', name: article.author },
        publisher: { '@type': 'Organization', name: 'Kvisl', url: absoluteUrl('/') },
        articleSection: article.section
      }} />
      <header className="essay-header">
        <p className="eyebrow">{article.section}</p>
        <h1>{article.title}</h1>
        {(article.subtitle || article.dek) && <p className="essay-dek">{article.subtitle || article.dek}</p>}
        <div className="essay-meta">
          <span>By {article.author}</span>
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        </div>
      </header>

      {article.coverImage && (
        <figure className="essay-cover">
          <img src={article.coverImage} alt={article.coverAlt || ''} />
        </figure>
      )}

      <div className="essay-layout">
        <aside className="essay-side">
          <ShareButtons title={article.title} />
        </aside>
        <div className="essay-body prose" dangerouslySetInnerHTML={{ __html: clean }} />
      </div>

      {article.supportingImages.length > 0 && (
        <section className="supporting-images" aria-label="Supporting images">
          {article.supportingImages.map((image, index) => <img key={image} src={image} alt={`Supporting image ${index + 1} for ${article.title}`} loading="lazy" />)}
        </section>
      )}

      {article.sources.length > 0 && (
        <section className="essay-sources" aria-labelledby="sources-title">
          <h2 id="sources-title">Sources & data</h2>
          <ol>
            {article.sources.map((source, index) => (
              <li key={`${source.label}-${index}`}>
                {source.url ? <a href={source.url} rel="noopener noreferrer">{source.label}</a> : source.label}
                {source.note ? <span> — {source.note}</span> : null}
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}
