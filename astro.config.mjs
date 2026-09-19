import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: process.env.SITE_URL,
  output: 'server',
  adapter: vercel(),
  compressHTML: true,
  security: {
    checkOrigin: true
  }
});
