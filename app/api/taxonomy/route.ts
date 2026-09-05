import { NextResponse } from 'next/server';
import { getPublishedArticles } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const articles = await getPublishedArticles(200);
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

  return NextResponse.json(
    { categories: sortTerms(categoryCounts), tags: sortTerms(tagCounts) },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  );
}
