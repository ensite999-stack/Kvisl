import type { APIRoute } from 'astro';
import { createRepublishRequest } from '../../lib/db';

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const articleSlug = String(form.get('article_slug') ?? '').trim();
  const articleTitle = String(form.get('article_title') ?? '').trim();
  const publicationName = String(form.get('publication_name') ?? '').trim();
  const contactName = String(form.get('contact_name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const destination = String(form.get('destination') ?? '').trim();
  const notes = String(form.get('notes') ?? '').trim();

  if (!articleSlug || !articleTitle || !publicationName || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response('Invalid request', { status: 400 });
  }

  await createRepublishRequest({
    articleSlug,
    articleTitle,
    publicationName,
    contactName,
    email,
    destination,
    notes
  });

  return redirect('/republish?article=' + encodeURIComponent(articleSlug) + '&sent=1', 303);
};
