import { neon } from '@neondatabase/serverless';

export type Article = {
  slug: string;
  title: string;
  dek: string;
  body_html?: string;
  topic: string;
  article_type: string;
  tags: string[];
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
<p>We tend to think of the dining table as a place of warmth and comfort. Plates slide across wooden surfaces, steam rises gently into the air, and meat—an important source of protein and energy—has helped sustain human civilization for thousands of years.</p>
<p>From an evolutionary perspective, there is nothing inherently immoral about humans eating meat. We are omnivores, and meat consumption is, first and foremost, part of a survival strategy shaped by natural selection over an immense span of time.</p>
<p>What makes humans distinctive, however, is not simply our ability to obtain food, but our ability to reflect on the way we obtain it.</p>
<p>Because we possess highly developed capacities for abstract thought, empathy, and moral judgment, we cannot remain forever indifferent to the cost hidden behind what we eat. Once we become aware of that cost, it becomes increasingly difficult to pretend that nothing lies behind the finished product on our plate.</p>
<p>As populations expanded, cities grew, and modern consumer economies developed, traditional livestock farming gradually gave way to large-scale, intensive production systems. Efficiency, cost, output, and reliable supply became central measures of success in the modern food industry.</p>
<p>Within such systems, life itself became standardized.</p>
<p>Breeding is calculated. Growth is calculated. Space is calculated. Feed is calculated. Even death is calculated.</p>
<p>A living creature—capable of sensation, behavior, and instinctive needs—is gradually reduced to weight, growth cycles, loss rates, and profit margins.</p>
<p>The problem is not scale itself.</p>
<p>The deeper question is what happens when efficiency becomes the only standard by which a living being is measured. Is there still room, within such a system, for even a minimum degree of dignity?</p>
<p>Recognizing the suffering that can exist within modern livestock production does not require us to condemn the entire history of human meat consumption. Nor does it mean that everyone must immediately stop eating animal products.</p>
<p>Reality is more complicated than a slogan.</p>
<p>Today’s global food system is bound up with nutrition, agriculture, culture, economic development, and the livelihoods of millions of people. Human societies cannot abandon animal-based foods overnight, nor can we ignore the role livestock farming has played—and continues to play—in food security and economic life.</p>
<p>But acknowledging reality does not mean accepting everything that reality contains.</p>
<p><strong>Between meeting human needs and refusing to inflict unnecessary suffering, there should be a line that civilization is unwilling to cross.</strong></p>
<p>Animals may not be able to debate ethics as humans do, but that does not mean they cannot experience pain, fear, stress, or comfort.</p>
<p>Once we know that another living being is capable of suffering, and we continue to impose prolonged suffering that could reasonably be avoided simply for the sake of efficiency, convenience, or lower costs, the issue is no longer merely agricultural.</p>
<p>It becomes an ethical one.</p>
<p>This is what animal welfare is fundamentally about.</p>
<p>It is not about pretending animals are human. Nor does it require everyone to become vegetarian.</p>
<p>Its demand is more basic:</p>
<p>Even if a living creature will eventually become food, it should not be treated, while alive, as though it were an object without sensation.</p>
<p>Adequate space, opportunities for natural behavior, relief from prolonged restraint, reduced transport stress, avoidance of unnecessary pain, and slaughter methods designed to minimize fear and suffering—none of these changes the existence of the food chain itself.</p>
<p>But they do change the way humans choose to stand within it.</p>
<p>And this question is not only about animals.</p>
<p>It is also about us.</p>
<p>One of the defining features of civilization is the willingness of the powerful to place limits on their own power.</p>
<p>The danger is not simply that humans possess the ability to dominate other species. The danger is that, once this power becomes overwhelming, we may begin to treat suffering as a statistic, life as a disposable input, and efficiency as the ultimate justification for everything we do.</p>
<p>If morality applies only when we face beings as powerful as ourselves, then morality risks becoming little more than a set of rules imposed by a balance of power.</p>
<p>But when a species with overwhelming advantages still chooses to reduce unnecessary harm, perhaps that is where ethics begins to mean something deeper.</p>
<p>Technology is also beginning to offer new answers to this old problem.</p>
<p>Plant-based proteins, precision fermentation, cultivated meat, and other alternative food technologies are attempting to change the way humans obtain protein.</p>
<p>Their importance lies not merely in creating new categories of food.</p>
<p>For the first time, they allow us to ask a question that previous generations could rarely confront in practical terms:</p>
<p><strong>If one day we can preserve taste, nutrition, affordability, and reliable supply while dramatically reducing animal suffering, what reason would remain for continuing the most harmful forms of the old system?</strong></p>
<p>Technology does not automatically create morality.</p>
<p>But technology can expand our choices.</p>
<p>And as our choices expand, so does our responsibility.</p>
<p>Consider a simple thought experiment.</p>
<p>Imagine that one day a species far more intelligent and technologically advanced than humans arrives on Earth. It possesses overwhelming power and begins breeding humans on an industrial scale for food.</p>
<p>We would almost certainly resist.</p>
<p>Because survival is one of the most fundamental instincts of life.</p>
<p>This thought experiment does not prove that predation itself is morally wrong. What it does is force us, for a moment, to step away from the top of the food chain and consider what extreme inequality of power looks like from the position of the weaker being.</p>
<p>When we return to reality, the central question may become clearer.</p>
<p>The question has never been simply:</p>
<p><strong>Should humans eat meat?</strong></p>
<p>The deeper question is:</p>
<p><strong>Now that we possess the power to determine the lives and deaths of other creatures, how will we choose to use that power?</strong></p>
<p>Eating animals may have its roots in survival.</p>
<p>But how we raise them, how we treat them, and how much unnecessary suffering we are willing to prevent belong to another category entirely.</p>
<p>Those are choices.</p>
<p>And they are choices that reveal something about civilization itself.</p>
<p>We may not be able to transform the entire food system overnight. We may never eliminate all forms of suffering from the natural world or from the food chain.</p>
<p>But we can refuse to treat cruelty as inevitable simply because it has become familiar.</p>
<p>We can examine what we eat with greater awareness, exercise restraint in the way we use power, and use science, policy, and technology to search for better alternatives.</p>
<p>Civilization may not mean creating a world in which nothing ever dies.</p>
<p>Perhaps it means that, even when we possess the power to cause suffering, we continue to ask ourselves one question:</p>
<p><strong>Is there a way to make that suffering less?</strong></p>
  `,
  topic: 'Society & Culture',
  article_type: 'Essay',
  tags: ['Ethics', 'Animal Welfare', 'Food Systems'],
  published_at: '2026-09-14T03:28:00.000Z',
  featured: false,
  cover_url: 'https://images.pexels.com/photos/19174595/pexels-photo-19174595.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=1800',
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
    SELECT slug, title, dek, topic, article_type, tags, published_at, featured,
           cover_url, cover_alt, cover_credit, author
    FROM public.kvisl_articles
    WHERE status = 'published'
      AND deleted_at IS NULL
      AND (published_at IS NULL OR published_at <= now())
    ORDER BY published_at DESC NULLS LAST, created_at DESC
    LIMIT ${limit}
  `;

  return rows as Article[];
}

export async function getArticle(slug: string): Promise<Article | null> {
  const sql = client();
  if (!sql) return slug === fallbackArticle.slug ? fallbackArticle : null;

  const rows = await sql`
    SELECT slug, title, dek, body_html, topic, article_type, tags, published_at, featured,
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

export async function searchArticles(
  filters: { query?: string; category?: string; tag?: string },
  limit = 30
): Promise<Article[]> {
  const query = filters.query?.trim() ?? '';
  const category = filters.category?.trim() ?? '';
  const tag = filters.tag?.trim() ?? '';
  const sql = client();

  if (!sql) {
    const q = query.toLowerCase();
    return [fallbackArticle].filter((article) => {
      const matchesQuery = !q || `${article.title} ${article.dek} ${article.article_type} ${article.topic} ${article.author} ${article.tags.join(' ')}`
        .toLowerCase().includes(q);
      const matchesCategory = !category || article.topic === category;
      const matchesTag = !tag || article.tags.includes(tag);
      return matchesQuery && matchesCategory && matchesTag;
    });
  }

  const like = `%${query}%`;
  const rows = await sql`
    SELECT slug, title, dek, topic, article_type, tags, published_at, featured,
           cover_url, cover_alt, cover_credit, author
    FROM public.kvisl_articles
    WHERE status = 'published'
      AND deleted_at IS NULL
      AND (published_at IS NULL OR published_at <= now())
      AND (
        ${query} = ''
        OR title ILIKE ${like}
        OR dek ILIKE ${like}
        OR article_type ILIKE ${like}
        OR topic ILIKE ${like}
        OR author ILIKE ${like}
        OR EXISTS (SELECT 1 FROM unnest(tags) AS t WHERE t ILIKE ${like})
      )
      AND (${category} = '' OR topic = ${category})
      AND (${tag} = '' OR ${tag} = ANY(tags))
    ORDER BY published_at DESC NULLS LAST
    LIMIT ${limit}
  `;

  return rows as Article[];
}

export async function getSearchFacets(): Promise<{ categories: string[]; tags: string[] }> {
  const sql = client();
  if (!sql) return { categories: [fallbackArticle.topic], tags: fallbackArticle.tags.slice(0, 10) };

  const categories = await sql`
    SELECT DISTINCT topic
    FROM public.kvisl_articles
    WHERE status = 'published'
      AND deleted_at IS NULL
      AND topic <> ''
    ORDER BY topic
  `;

  const tags = await sql`
    SELECT tag, count(*)::int AS count
    FROM public.kvisl_articles, unnest(tags) AS tag
    WHERE status = 'published'
      AND deleted_at IS NULL
      AND tag <> ''
    GROUP BY tag
    ORDER BY count DESC, tag ASC
    LIMIT 10
  `;

  return {
    categories: categories.map((row) => String(row.topic)),
    tags: tags.map((row) => String(row.tag))
  };
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


export type AdminArticle = Article & {
  status: 'draft' | 'published' | 'deleted';
  body_html: string;
  sources: string;
};

export async function getAdminArticles(): Promise<AdminArticle[]> {
  const sql = client();
  if (!sql) return [];
  const rows = await sql`
    SELECT slug, title, dek, body_html, topic, article_type, tags, status, published_at, featured,
           cover_url, cover_alt, cover_credit, sources, author
    FROM public.kvisl_articles
    WHERE deleted_at IS NULL
      AND status <> 'deleted'
    ORDER BY updated_at DESC, created_at DESC
  `;
  return rows as AdminArticle[];
}

export async function getAdminArticle(slug: string): Promise<AdminArticle | null> {
  const sql = client();
  if (!sql) return null;
  const rows = await sql`
    SELECT slug, title, dek, body_html, topic, article_type, tags, status, published_at, featured,
           cover_url, cover_alt, cover_credit, sources, author
    FROM public.kvisl_articles
    WHERE slug = ${slug}
      AND deleted_at IS NULL
      AND status <> 'deleted'
    LIMIT 1
  `;
  return (rows[0] as AdminArticle | undefined) ?? null;
}

export type AdminArticleInput = {
  slug?: string;
  title: string;
  dek: string;
  bodyHtml: string;
  topic: string;
  articleType: 'Essay' | 'Note';
  tags: string[];
  status: 'draft' | 'published';
  publishedAt: string | null;
  coverUrl: string | null;
  coverAlt: string;
  coverCredit: string;
  sources: string;
  author: string;
};

const newArticleSlug = (articleType: 'Essay' | 'Note') =>
  `${articleType.toLowerCase()}-${Date.now().toString(36)}`;

export async function saveAdminArticle(input: AdminArticleInput): Promise<string> {
  const sql = client();
  if (!sql) throw new Error('DATABASE_URL is not configured');

  const slug = input.slug?.trim() || newArticleSlug(input.articleType);
  const normalizedTags = input.tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag, index, all) => all.findIndex((item) => item.toLowerCase() === tag.toLowerCase()) === index)
    .slice(0, 10);
  const tagPayload = normalizedTags.join('|||');
  const publishedAt = input.publishedAt || null;

  await sql`
    INSERT INTO public.kvisl_articles (
      slug, title, dek, body_html, topic, article_type, tags, status, published_at,
      cover_url, cover_alt, cover_credit, sources, author, updated_at
    )
    VALUES (
      ${slug}, ${input.title}, ${input.dek}, ${input.bodyHtml}, ${input.topic},
      ${input.articleType}, CASE WHEN ${tagPayload} = '' THEN '{}'::text[] ELSE string_to_array(${tagPayload}, '|||') END,
      ${input.status}, ${publishedAt}::timestamptz, ${input.coverUrl}, ${input.coverAlt},
      ${input.coverCredit}, ${input.sources}, ${input.author}, now()
    )
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      dek = EXCLUDED.dek,
      body_html = EXCLUDED.body_html,
      topic = EXCLUDED.topic,
      article_type = EXCLUDED.article_type,
      tags = EXCLUDED.tags,
      status = EXCLUDED.status,
      published_at = EXCLUDED.published_at,
      cover_url = EXCLUDED.cover_url,
      cover_alt = EXCLUDED.cover_alt,
      cover_credit = EXCLUDED.cover_credit,
      sources = EXCLUDED.sources,
      author = EXCLUDED.author,
      deleted_at = NULL,
      updated_at = now()
  `;

  return slug;
}

export async function deleteAdminArticle(slug: string): Promise<void> {
  const sql = client();
  if (!sql) throw new Error('DATABASE_URL is not configured');
  await sql`
    UPDATE public.kvisl_articles
    SET status = 'deleted',
        deleted_at = now(),
        updated_at = now()
    WHERE slug = ${slug}
      AND deleted_at IS NULL
  `;
}

export async function createRepublishRequest(input: {
  articleSlug: string;
  articleTitle: string;
  publicationName: string;
  contactName: string;
  email: string;
  destination: string;
  notes: string;
}): Promise<void> {
  const sql = client();
  if (!sql) throw new Error('DATABASE_URL is not configured');
  await sql`
    INSERT INTO public.kvisl_republish_requests
      (article_slug, article_title, publication_name, contact_name, email, destination, notes)
    VALUES
      (${input.articleSlug}, ${input.articleTitle}, ${input.publicationName}, ${input.contactName},
       ${input.email}, ${input.destination}, ${input.notes})
  `;
}
