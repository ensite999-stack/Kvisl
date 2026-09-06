import postgres from 'postgres';
import type { NewsletterFrequency } from './types';

let client: ReturnType<typeof postgres> | null = null;
let schemaPromise: Promise<void> | null = null;

function getClient() {
  if (!process.env.DATABASE_URL) return null;
  if (!client) client = postgres(process.env.DATABASE_URL, { prepare: false, max: 2, idle_timeout: 20 });
  return client;
}

async function ensureSchema() {
  const sql = getClient();
  if (!sql) throw new Error('DATABASE_URL is not configured.');
  if (!schemaPromise) {
    schemaPromise = (async () => {
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
      await sql`
        create table if not exists newsletter_confirmation_requests (
          email text primary key,
          frequency text not null,
          token_hash text unique not null,
          expires_at timestamptz not null,
          requested_at timestamptz not null default now()
        )
      `;
      await sql`create index if not exists newsletter_confirmation_expires_idx on newsletter_confirmation_requests(expires_at)`;
    })();
  }
  await schemaPromise;
  return sql;
}

export async function saveNewsletterConfirmationRequest(
  email: string,
  frequency: NewsletterFrequency,
  tokenHash: string,
  expiresAt: Date
) {
  const sql = await ensureSchema();
  await sql`delete from newsletter_confirmation_requests where expires_at <= now()`;
  await sql`
    insert into newsletter_confirmation_requests (email, frequency, token_hash, expires_at, requested_at)
    values (${email.toLowerCase()}, ${frequency}, ${tokenHash}, ${expiresAt}, now())
    on conflict (email) do update set
      frequency=excluded.frequency,
      token_hash=excluded.token_hash,
      expires_at=excluded.expires_at,
      requested_at=now()
  `;
}

export async function confirmNewsletterSubscription(tokenHash: string): Promise<NewsletterFrequency | null> {
  const sql = await ensureSchema();
  const result = await sql.begin(async (tx) => {
    const pending = await tx`
      select email, frequency
      from newsletter_confirmation_requests
      where token_hash=${tokenHash} and expires_at > now()
      limit 1
      for update
    `;
    if (!pending[0]) return null;

    const email = String(pending[0].email).toLowerCase();
    const frequency: NewsletterFrequency = pending[0].frequency === 'daily' ? 'daily' : 'weekly';

    await tx`
      insert into newsletter_subscribers (email, frequency, subscribed_at, unsubscribed_at, source)
      values (${email}, ${frequency}, now(), null, 'website')
      on conflict (email) do update set
        frequency=excluded.frequency,
        subscribed_at=now(),
        unsubscribed_at=null,
        source='website'
    `;
    await tx`delete from newsletter_confirmation_requests where email=${email}`;
    return frequency;
  });

  return result;
}
