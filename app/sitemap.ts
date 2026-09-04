import type { MetadataRoute } from 'next';
import { getPublishedArticles } from '@/lib/db';
import { absoluteUrl } from '@/lib/utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles(500);
  const staticPages = ['/', '/about', '/privacy', '/terms', '/copyright', '/contact', '/submissions', '/accessibility', '/donate'];
  return [
    ...staticPages.map((path) => ({
      url: absoluteUrl(path),
      lastModified: new Date('2026-09-04'),
      changeFrequency: path === '/' ? 'daily' as const : 'monthly' as const,
      priority: path === '/' ? 1 : 0.5
    })),
    ...articles.map((article) => ({
      url: absoluteUrl(`/articles/${article.slug}`),
      lastModified: new Date(article.updatedAt || article.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: article.featured ? 0.9 : 0.7
    }))
  ];
}
