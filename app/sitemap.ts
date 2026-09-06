import type { MetadataRoute } from 'next';
import { getPublishedArticles } from '@/lib/db';
import { SITE_URL } from '@/lib/site-meta';
import { absoluteUrl } from '@/lib/utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles(500);
  const staticPages = ['/', '/about', '/privacy', '/terms', '/copyright', '/contact', '/submissions', '/accessibility', '/donate'];
  const latestUpdate = articles.reduce<Date | undefined>((latest, article) => {
    const date = new Date(article.updatedAt || article.publishedAt);
    return !latest || date > latest ? date : latest;
  }, undefined);

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((path) => ({
    url: absoluteUrl(path),
    ...(path === '/' && latestUpdate ? { lastModified: latestUpdate } : {}),
    changeFrequency: path === '/' ? 'daily' : 'monthly',
    priority: path === '/' ? 1 : path === '/about' ? 0.7 : 0.5
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(`/articles/${article.slug}`),
    lastModified: new Date(article.updatedAt || article.publishedAt),
    changeFrequency: 'monthly',
    priority: article.featured ? 0.9 : 0.8
  }));

  return [...staticEntries, ...articleEntries].map((entry) => ({ ...entry, url: entry.url.replace(/^https?:\/\/[^/]+/, SITE_URL) }));
}
