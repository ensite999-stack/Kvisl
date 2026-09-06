import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '@/lib/auth';
import { getAllArticles, saveArticle } from '@/lib/db';
import { parseArticleInput } from '@/lib/article-input';

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  try { return NextResponse.json({ articles: await getAllArticles() }); }
  catch (error) { return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to load articles.' }, { status: 503 }); }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  try {
    const input = parseArticleInput(await request.json());
    const article = await saveArticle(input);
    revalidatePath('/');
    revalidatePath('/search');
    revalidatePath(`/articles/${article.slug}`);
    revalidatePath('/feed.xml');
    revalidatePath('/sitemap.xml');
    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to save article.' }, { status: 400 });
  }
}
