import postgres from 'postgres';
import type { Article, ArticleInput, ArticleSource, NewsletterFrequency, NewsletterSubscriber } from './types';

let client: ReturnType<typeof postgres> | null = null;
let schemaPromise: Promise<void> | null = null;

function getClient() {
  if (!process.env.DATABASE_URL) return null;
  if (!client) client = postgres(process.env.DATABASE_URL, { prepare: false, max: 4, idle_timeout: 20 });
  return client;
}

async function ensureSchema() {
  const sql = getClient();
  if (!sql) return;
  if (!schemaPromise) {
    schemaPromise = (async () => {
      await sql`
        create table if not exists articles (
          id uuid primary key default gen_random_uuid(),
          slug text unique not null,
          title text not null,
          subtitle text not null default '',
          dek text not null default '',
          body text not null default '',
          author text not null default '',
          published_at timestamptz not null default now(),
          updated_at timestamptz not null default now(),
          status text not null default 'draft',
          section text not null default 'Essay',
          tags jsonb not null default '[]'::jsonb,
          cover_image text,
          cover_alt text,
          cover_source text not null default '',
          supporting_images jsonb not null default '[]'::jsonb,
          sources jsonb not null default '[]'::jsonb,
          featured boolean not null default false
        )
      `;
      await sql`alter table articles add column if not exists subtitle text not null default ''`;
      await sql`alter table articles add column if not exists tags jsonb not null default '[]'::jsonb`;
      await sql`alter table articles add column if not exists cover_source text not null default ''`;
      await sql`
        create table if not exists newsletter_subscribers (
          id uuid primary key default gen_random_uuid(),
          email text unique not null,
          frequency text not null default 'weekly',
          subscribed_at timestamptz not null default now(),
          unsubscribed_at timestamptz,
          source text not null default 'website'
        )
      `;
      await sql`alter table newsletter_subscribers add column if not exists frequency text not null default 'weekly'`;
      await sql`alter table newsletter_subscribers add column if not exists unsubscribed_at timestamptz`;
      await sql`create index if not exists articles_status_date_idx on articles(status, published_at desc)`;
      await sql`create index if not exists newsletter_frequency_idx on newsletter_subscribers(frequency, unsubscribed_at)`;
    })();
  }
  await schemaPromise;
}

function rowToArticle(row: any): Article {
  return {
    id: String(row.id), slug: row.slug, title: row.title, subtitle: row.subtitle || undefined, dek: row.dek, body: row.body,
    author: row.author, publishedAt: new Date(row.published_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(), status: row.status, section: row.section,
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    coverImage: row.cover_image || undefined, coverAlt: row.cover_alt || undefined, coverSource: row.cover_source || undefined,
    supportingImages: Array.isArray(row.supporting_images) ? row.supporting_images : [],
    sources: Array.isArray(row.sources) ? row.sources as ArticleSource[] : [], featured: Boolean(row.featured)
  };
}

export async function getPublishedArticles(limit = 30): Promise<Article[]> {
  const sql = getClient();
  if (!sql) return [];
  try {
    await ensureSchema();
    const rows = await sql`select * from articles where status = 'published' order by published_at desc limit ${limit}`;
    return rows.map(rowToArticle);
  } catch { return []; }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const sql = getClient();
  if (!sql) return null;
  try {
    await ensureSchema();
    const rows = await sql`select * from articles where slug = ${slug} limit 1`;
    return rows[0] ? rowToArticle(rows[0]) : null;
  } catch { return null; }
}

export async function getAllArticles(): Promise<Article[]> {
  const sql = getClient();
  if (!sql) return [];
  await ensureSchema();
  const rows = await sql`select * from articles order by updated_at desc`;
  return rows.map(rowToArticle);
}

export async function saveArticle(input: ArticleInput): Promise<Article> {
  const sql = getClient();
  if (!sql) throw new Error('DATABASE_URL is not configured.');
  await ensureSchema();
  const rows = await sql`
    insert into articles (slug, title, subtitle, dek, body, author, published_at, status, section, tags,
      cover_image, cover_alt, cover_source, supporting_images, sources, featured, updated_at)
    values (${input.slug}, ${input.title}, ${input.subtitle ?? ''}, ${input.dek}, ${input.body}, ${input.author}, ${input.publishedAt},
      ${input.status}, ${input.section}, ${sql.json(input.tags)}, ${input.coverImage ?? null}, ${input.coverAlt ?? null}, ${input.coverSource ?? ''},
      ${sql.json(input.supportingImages)}, ${sql.json(input.sources)}, ${input.featured ?? false}, now())
    on conflict (slug) do update set
      title=excluded.title, subtitle=excluded.subtitle, dek=excluded.dek, body=excluded.body, author=excluded.author,
      published_at=excluded.published_at, status=excluded.status, section=excluded.section, tags=excluded.tags,
      cover_image=excluded.cover_image, cover_alt=excluded.cover_alt, cover_source=excluded.cover_source,
      supporting_images=excluded.supporting_images, sources=excluded.sources, featured=excluded.featured, updated_at=now()
    returning *
  `;
  return rowToArticle(rows[0]);
}

export async function removeArticle(slug: string) {
  const sql = getClient();
  if (!sql) throw new Error('DATABASE_URL is not configured.');
  await ensureSchema();
  await sql`delete from articles where slug = ${slug}`;
}

export async function subscribeEmail(email: string, frequency: NewsletterFrequency) {
  const sql = getClient();
  if (!sql) throw new Error('DATABASE_URL is not configured.');
  await ensureSchema();
  await sql`
    insert into newsletter_subscribers (email, frequency, unsubscribed_at)
    values (${email.toLowerCase()}, ${frequency}, null)
    on conflict (email) do update set frequency=excluded.frequency, unsubscribed_at=null, subscribed_at=now()
  `;
}

export async function getNewsletterSubscribers(frequency: NewsletterFrequency): Promise<NewsletterSubscriber[]> {
  const sql = getClient();
  if (!sql) throw new Error('DATABASE_URL is not configured.');
  await ensureSchema();
  const rows = await sql`
    select email, frequency from newsletter_subscribers
    where frequency=${frequency} and unsubscribed_at is null
    order by subscribed_at asc
  `;
  return rows.map((row) => ({ email: String(row.email), frequency: row.frequency as NewsletterFrequency }));
}

export async function unsubscribeEmail(email: string) {
  const sql = getClient();
  if (!sql) throw new Error('DATABASE_URL is not configured.');
  await ensureSchema();
  await sql`update newsletter_subscribers set unsubscribed_at=now() where email=${email.toLowerCase()}`;
}
