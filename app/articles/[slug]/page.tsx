import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/json-ld';
import { ShareButtons } from '@/components/share-buttons';
import { getArticleBySlug } from '@/lib/db';
import { publicImageUrl } from '@/lib/media-url';
import { sanitizeArticleHtml } from '@/lib/sanitize';
import { SITE_LANGUAGE, SITE_LOCALE, SITE_NAME, SITE_URL } from '@/lib/site-meta';
import { absoluteUrl, formatDate } from '@/lib/utils';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

function displayImageCredit(value: string) {
  const clean = value.trim();
  const legacyPexels = clean.match(/^Photo on Pexels\.?\s*(.+)$/i);
  if (legacyPexels?.[1]) return `Photo by ${legacyPexels[1].trim()} on Pexels`;
  return clean;
}

function plainTextExcerpt(html: string, limit = 180) {
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
  if (!text) return undefined;
  return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== 'published') return {};

  const description = article.dek || article.subtitle || plainTextExcerpt(article.body);
  const coverImage = publicImageUrl(article.coverImage);
  const canonical = `/articles/${article.slug}`;
  const keywords = [article.section, ...article.tags].filter(Boolean);

  return {
    title: article.title,
    description,
    keywords,
    authors: [{ name: article.author }],
    creator: article.author,
    publisher: SITE_NAME,
    category: article.section,
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1
      }
    },
    openGraph: {
      type: 'article',
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      title: article.title,
      description,
      url: canonical,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author],
      section: article.section,
      tags: article.tags,
      images: coverImage ? [{ url: coverImage, alt: article.coverAlt || article.title }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description,
      images: coverImage ? [coverImage] : undefined
    }
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.status !== 'published') notFound();

  const clean = sanitizeArticleHtml(article.body);
  const articleUrl = absoluteUrl(`/articles/${article.slug}`);
  const coverImage = publicImageUrl(article.coverImage);
  const coverCredit = article.coverSource ? displayImageCredit(article.coverSource) : '';
  const description = article.dek || article.subtitle || plainTextExcerpt(article.body);

  return (
    <article className="essay">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        '@id': `${articleUrl}#article`,
        url: articleUrl,
        headline: article.title,
        alternativeHeadline: article.subtitle || undefined,
        description,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt || article.publishedAt,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': articleUrl
        },
        image: coverImage ? [absoluteUrl(coverImage)] : undefined,
        thumbnailUrl: coverImage ? absoluteUrl(coverImage) : undefined,
        inLanguage: SITE_LANGUAGE,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        author: { '@type': 'Person', name: article.author },
        publisher: {
          '@id': `${SITE_URL}/#organization`,
          '@type': 'Organization',
          name: SITE_NAME,
          url: SITE_URL,
          logo: {
            '@type': 'ImageObject',
            url: absoluteUrl('/kvisl-bimi.svg')
          }
        },
        copyrightHolder: { '@id': `${SITE_URL}/#organization` },
        copyrightYear: new Date(article.publishedAt).getUTCFullYear(),
        articleSection: article.section,
        keywords: article.tags.length ? article.tags.join(', ') : article.section || undefined
      }} />

      {coverImage && (
        <figure className="essay-cover">
          <img src={coverImage} alt={article.coverAlt || ''} />
          {coverCredit && (
            <figcaption>
              {article.coverSourceUrl
                ? <a href={article.coverSourceUrl} rel="noopener noreferrer">{coverCredit}</a>
                : coverCredit}
            </figcaption>
          )}
        </figure>
      )}

      <header className="essay-header essay-header-editorial">
        <h1>{article.title}</h1>
        {(article.subtitle || article.dek) && <p className="essay-dek">{article.subtitle || article.dek}</p>}
        <div className="essay-author-row">
          <div className="essay-author-copy">
            <span className="essay-byline">by {article.author}</span>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </div>
          <ShareButtons title={article.title} />
        </div>
      </header>

      <div className="essay-layout essay-layout-single">
        <div className="essay-body prose" dangerouslySetInnerHTML={{ __html: clean }} />
      </div>

      {article.supportingImages.length > 0 && (
        <section className="supporting-images" aria-label="Supporting images">
          {article.supportingImages.map((image, index) => {
            const src = publicImageUrl(image);
            return src ? <img key={image} src={src} alt={`Supporting image ${index + 1} for ${article.title}`} loading="lazy" /> : null;
          })}
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

      {(article.section || article.tags.length > 0) && (
        <footer className="essay-taxonomy" aria-labelledby="taxonomy-title">
          <h2 id="taxonomy-title">Explore this essay</h2>
          {article.section && (
            <div className="essay-taxonomy-row">
              <span>Category</span>
              <a href={`/search?q=${encodeURIComponent(article.section)}`}>{article.section}</a>
            </div>
          )}
          {article.tags.length > 0 && (
            <div className="essay-taxonomy-row">
              <span>Tags</span>
              <div className="essay-tag-list">
                {article.tags.map((tag) => <a key={tag} href={`/search?q=${encodeURIComponent(tag)}`}>{tag}</a>)}
              </div>
            </div>
          )}
        </footer>
      )}
    </article>
  );
}
