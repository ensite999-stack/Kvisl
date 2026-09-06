import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '@/lib/auth';
import { removeArticle, updateArticle } from '@/lib/db';
import { parseArticleInput } from '@/lib/article-input';

type Props = { params: Promise<{ slug: string }> };

function refreshArticlePaths(...slugs: string[]) {
  revalidatePath('/');
  revalidatePath('/search');
  revalidatePath('/feed.xml');
  revalidatePath('/sitemap.xml');
  for (const slug of new Set(slugs)) revalidatePath(`/articles/${slug}`);
}

export async function PATCH(request: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { slug: originalSlug } = await params;
    const input = parseArticleInput(await request.json());
    const article = await updateArticle(originalSlug, input);
    refreshArticlePaths(originalSlug, article.slug);
    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to update article.' },
      { status: 400 }
    );
  }
}

export async function DELETE(_: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const { slug } = await params;
    await removeArticle(slug);
    refreshArticlePaths(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to delete article.' }, { status: 400 });
  }
}
