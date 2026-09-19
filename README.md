# Kvisl

**To attend is to inhabit.**

Kvisl is an independent, member-run, non-profit magazine for long-form thinking about people and the world.

## Stack

- Astro + strict TypeScript
- Vercel SSR adapter
- Neon Postgres (`public.kvisl_articles`, `public.kvisl_subscribers`)
- Manual PWA manifest + service worker
- No UI framework; editorial CSS is kept intentionally small and legible

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

Set:

```env
DATABASE_URL=postgresql://...
SITE_URL=https://kvisl.org
```

Without `DATABASE_URL`, the site renders a local fallback article so visual work can continue.

## Existing Neon model expected

The frontend reads published rows from `public.kvisl_articles` and newsletter signups are inserted into `public.kvisl_subscribers`. Article HTML is sanitized before rendering.

## Vercel

1. Import the GitHub repository into Vercel.
2. Add `DATABASE_URL` to Production, Preview, and Development as appropriate.
3. Add `SITE_URL` with the canonical production origin.
4. Deploy. Astro is configured with `@astrojs/vercel` in server mode.

## Brand assets

The supplied mark is preserved in `public/logo-source.png` and exported into favicon, Apple touch and PWA icon sizes under `public/icons/`.

Brand purple: `#702963`.
