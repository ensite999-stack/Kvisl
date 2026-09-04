import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';

const allowed = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: 'Unauthorized.' }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ message: 'Vercel Blob is not configured.' }, { status: 503 });
  }

  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'No file supplied.' }, { status: 400 });
  }
  if (!allowed.has(file.type) || file.size > 12 * 1024 * 1024) {
    return NextResponse.json({ message: 'Use JPG, PNG, WebP, AVIF or GIF up to 12 MB.' }, { status: 400 });
  }

  const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, '-').slice(-120);
  const blob = await put(`editorial/${Date.now()}-${safe}`, file, {
    access: 'public',
    addRandomSuffix: true
  });
  return NextResponse.json({ url: blob.url });
}
