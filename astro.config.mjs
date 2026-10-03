import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://phalcon.io',
  output: 'static',
  // One file per page (dist/team.html) and no trailing slash, as on the
  // docs and blog sites. Cloudflare Pages then serves /team with no redirect.
  trailingSlash: 'never',
  build: { format: 'file' },
  server: { host: true, port: 8080 },
  // The Jekyll site had /sitemap.xml; public/_redirects sends it to sitemap-index.xml.
  integrations: [sitemap({ filter: (page) => !page.endsWith('/404') })],
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: { ignored: ['**/public/debug/**', '**/_site/**', '**/vendor/**'] },
    },
  },
});
