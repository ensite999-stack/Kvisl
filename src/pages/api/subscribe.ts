import type { APIRoute } from 'astro';
import { subscribe } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const email = String(body?.email ?? '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      return Response.json({ message: 'Please enter a valid email address.' }, { status: 400 });
    }
    await subscribe(email);
    return Response.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error('subscribe failed', error);
    return Response.json({ message: 'Unable to subscribe right now. Please try again later.' }, { status: 500 });
  }
};
