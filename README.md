# Kvisl

Independent magazine built with Next.js, Tiptap and Vercel.

## Editorial system

The private `/admin` area provides:

- click-to-edit title and overview fields
- Tiptap rich-text body editing
- author, date, section and slug fields
- cover image upload, inline image upload and supporting-image URLs
- structured sources/data citations
- draft, publish, edit and delete workflows
- homepage-feature flag
- automatic article typography and responsive layout

Articles and newsletter subscriptions are stored in PostgreSQL through `DATABASE_URL`. Tables are created automatically on first use. Editorial images are uploaded server-side to Cloudflare R2 through its S3-compatible API and are served from the public origin configured in `R2_PUBLIC_URL`.

## Privacy and analytics

The public site includes Vercel Web Analytics and Speed Insights only. There is no Google Analytics, Meta Pixel, advertising SDK, third-party behavioural tracker or ad-tech tag in the codebase.

The public theme preference is stored in localStorage rather than a cookie. The editorial admin uses a strictly necessary HttpOnly session cookie.

Review the published privacy policy whenever infrastructure, analytics or newsletter practices change.

## Accessibility

The design targets WCAG 2.2 AA and includes semantic landmarks, skip navigation, keyboard-operable menus, visible focus, reduced-motion handling, forced-colour support, text reflow, alt-text fields and light/dark/eye-comfort themes. Legal applicability of EAA, EN 301 549, ADA and Section 508 depends on the organisation and jurisdiction; test with real assistive technologies before making a formal compliance claim.

## SEO / GEO

Included:

- canonical metadata, Open Graph and Twitter metadata
- Article / Organization / WebSite JSON-LD
- sitemap and robots.txt
- RSS feed at `/feed.xml`
- `llms.txt` with canonical article references
- semantic article structure and explicit sources/data section
- default Open Graph image
- security.txt
- noindex on editorial routes
- native Web Share / clipboard sharing without social tracking SDKs

## Vercel + Cloudflare R2 setup

1. Import this GitHub repository into Vercel.
2. Set `NEXT_PUBLIC_SITE_URL=https://kvisl.com`.
3. Attach a PostgreSQL-compatible database and expose its connection string as `DATABASE_URL`.
4. Set strong `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` values.
5. Create a Cloudflare R2 bucket and S3 API credentials, then configure `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` and `R2_BUCKET_NAME` in Vercel.
6. Bind a public custom domain to the R2 bucket, preferably `media.kvisl.com`, and set `R2_PUBLIC_URL=https://media.kvisl.com`.
7. Enable Vercel Web Analytics and the desired Vercel Firewall / Bot protection features in the Vercel project.
8. Add `kvisl.com` and `www.kvisl.com` as domains, with one canonical redirect.
9. Test `/admin`, image uploads, newsletter subscription, sitemap, RSS, sharing previews and accessibility before launch.

The application also sends CSP, Referrer-Policy, X-Content-Type-Options, X-Frame-Options, Permissions-Policy and Cross-Origin-Opener-Policy headers.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without `DATABASE_URL`, the public site falls back to a small built-in editorial sample so layout development remains possible. Publishing and newsletter storage require the database. Editorial image uploads require all five `R2_*` variables.
