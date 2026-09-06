import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdminAuthenticated } from '@/lib/auth';
import { setArticleFeatured } from '@/lib/db';

type Props = { params: Promise<{ slug: string }> };

export async function POST(request: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const body = await request.json().catch(() => ({}));
    const article = await setArticleFeatured(slug, Boolean(body?.featured));
    revalidatePath('/');
    revalidatePath(`/articles/${article.slug}`);
    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to update featured article.' },
      { status: 400 }
    );
  }
}
