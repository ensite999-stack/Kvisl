import { neon } from '@neondatabase/serverless';

export type Article = {
  slug: string;
  title: string;
  dek: string;
  body_html?: string;
  topic: string;
  published_at: string | null;
  featured: boolean;
  cover_url: string | null;
  cover_alt: string;
  cover_credit: string;
  sources?: string;
  author: string;
};

const fallbackArticle: Article = {
  slug: 'essay-mu4za50p',
  title: 'The Responsibility at the Top of the Food Chain',
  dek: 'When life becomes food, the question is not only what we eat, but how much suffering we are willing to accept.',
  body_html: `
    <p>What we call attention is never merely a private act. To attend to another life is to admit that it occupies the same world we do.</p>
    <p>Kvisl publishes long-form essays for readers who prefer depth to velocity. Connect Neon to load the complete editorial archive.</p>
    <h2>Attention changes the scale of a question</h2>
    <p>Once a thing is seen carefully, it becomes harder to treat as background. Ethics often begins in this change of scale.</p>
  `,
  topic: 'Society & Culture',
  published_at: '2026-09-14T03:28:00.000Z',
  featured: false,
  cover_url: 'https://images.pexels.com/photos/19174595/pexels-photo-19174595.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400',
  cover_alt: 'Serene mountain bay with fish farms under a partly cloudy sky.',
  cover_credit: 'Photo by Onur Burak Akın on Pexels',
  sources: '',
  author: 'Hollis H. Jiang'
};

function client() {
  const url = import.meta.env.DATABASE_URL;
  return url ? neon(url) : null;
}

export async function getPublishedArticles(limit = 12): Promise<Article[]> {
  const sql = client();
  if (!sql) return [fallbackArticle];

  const rows = await sql`
    SELECT slug, title, dek, topic, published_at, featured,
           cover_url, cover_alt, cover_credit, author
    FROM public.kvisl_articles
    WHERE status = 'published'
      AND deleted_at IS NULL
      AND (published_at IS NULL OR published_at <= now())
    ORDER BY featured DESC, published_at DESC NULLS LAST, created_at DESC
    LIMIT ${limit}
  `;

  return rows as Article[];
}

export async function getArticle(slug: string): Promise<Article | null> {
  const sql = client();
  if (!sql) return slug === fallbackArticle.slug ? fallbackArticle : null;

  const rows = await sql`
    SELECT slug, title, dek, body_html, topic, published_at, featured,
           cover_url, cover_alt, cover_credit, sources, author
    FROM public.kvisl_articles
    WHERE slug = ${slug}
      AND status = 'published'
      AND deleted_at IS NULL
      AND (published_at IS NULL OR published_at <= now())
    LIMIT 1
  `;

  return (rows[0] as Article | undefined) ?? null;
}

export async function searchArticles(query: string, limit = 30): Promise<Article[]> {
  const sql = client();
  if (!sql) {
    const q = query.toLowerCase();
    return [fallbackArticle].filter((a) =>
      `${a.title} ${a.dek} ${a.topic} ${a.author}`.toLowerCase().includes(q)
    );
  }

  const q = `%${query.trim()}%`;
  const rows = await sql`
    SELECT slug, title, dek, topic, published_at, featured,
           cover_url, cover_alt, cover_credit, author
    FROM public.kvisl_articles
    WHERE status = 'published'
      AND deleted_at IS NULL
      AND (published_at IS NULL OR published_at <= now())
      AND (title ILIKE ${q} OR dek ILIKE ${q} OR topic ILIKE ${q} OR author ILIKE ${q})
    ORDER BY published_at DESC NULLS LAST
    LIMIT ${limit}
  `;

  return rows as Article[];
}

export async function subscribe(email: string): Promise<void> {
  const sql = client();
  if (!sql) throw new Error('DATABASE_URL is not configured');
  await sql`
    INSERT INTO public.kvisl_subscribers (email)
    VALUES (${email})
    ON CONFLICT (email) DO NOTHING
  `;
}
