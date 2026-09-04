import { NextResponse } from 'next/server';
import { clearAdminSession, createAdminSession, verifyPassword } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!verifyPassword(String(body?.password || ''))) {
    return NextResponse.json({ message: 'Invalid password.' }, { status: 401 });
  }
  await createAdminSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
