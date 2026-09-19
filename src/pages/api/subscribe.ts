import type { APIRoute } from 'astro';
import { subscribe } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const email = String(body?.email ?? '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      return Response.json({ message: '请输入有效的电子邮箱。' }, { status: 400 });
    }
    await subscribe(email);
    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('subscribe failed', error);
    return Response.json({ message: '暂时无法订阅，请稍后重试。' }, { status: 500 });
  }
};
