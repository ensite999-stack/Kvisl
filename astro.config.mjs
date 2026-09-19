import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

function normalizeSiteUrl(value) {
  if (!value) return undefined;

  const raw = value
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/\s+#.*$/, '');

  if (!raw) return undefined;

  const candidate = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(raw)
    ? raw
    : `https://${raw}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

const site =
  normalizeSiteUrl(process.env.SITE_URL) ??
  normalizeSiteUrl(process.env.URL) ??
  normalizeSiteUrl(process.env.DEPLOY_PRIME_URL) ??
  normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
  normalizeSiteUrl(process.env.VERCEL_URL);

export default defineConfig({
  site,
  output: 'server',
  adapter: netlify(),
  compressHTML: true,
  security: {
    checkOrigin: true
  }
});
