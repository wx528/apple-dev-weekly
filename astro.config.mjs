import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://apple-dev-weekly.muchjs.workers.dev',
  integrations: [sitemap()],
});
