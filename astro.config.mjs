import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://apple-dev-weekly.com',
  integrations: [sitemap()],
});
