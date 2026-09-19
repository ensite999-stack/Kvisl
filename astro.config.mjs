import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

const vercelSite =
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined;

export default defineConfig({
  site: process.env.SITE_URL ?? vercelSite,
  output: 'server',
  adapter: vercel(),
  compressHTML: true,
  security: {
    checkOrigin: true
  }
});
