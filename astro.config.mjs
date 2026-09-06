import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Old Jekyll URLs were /{locale}/{page}; the redesign is English-only with
// clean URLs. Emit meta-refresh stubs so old links keep working locally.
const locales = ['en-us', 'de-de', 'el-gr', 'es-es', 'fa-ir', 'ko-kr'];
const slugs = [
  '', 'about', 'consulting', 'download/linux', 'download/windows',
  'download/tools', 'download/stubs', 'hosting', 'sponsors', 'support',
  'team', 'testimonials',
];
const redirects = {};
for (const locale of locales) {
  for (const slug of slugs) {
    redirects[`/${locale}${slug ? '/' + slug : ''}`] = slug ? `/${slug}` : '/';
  }
}

export default defineConfig({
  output: 'static',
  server: { host: true, port: 8080 },
  redirects,
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: { ignored: ['**/debug/**', '**/_site/**', '**/vendor/**'] },
    },
  },
});
