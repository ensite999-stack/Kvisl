import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { removeArticle } from '@/lib/db';

type Props = { params: Promise<{ slug: string }> };

export async function DELETE(_: Request, { params }: Props) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }
  try {
    const { slug } = await params;
    await removeArticle(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : 'Unable to delete article.' }, { status: 400 });
  }
}
