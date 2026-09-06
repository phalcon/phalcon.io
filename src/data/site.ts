// Site-wide constants and link inventories.
// Local demo: the docs run on the same machine (Nimbus dev/preview server).
export const DOCS_URL = 'http://192.168.0.124:8000';

// Refresh manually — hardcoded so builds never depend on the network.
export const GITHUB_STARS_V6 = '249';
export const GITHUB_STARS_V5 = '10.8k';

export const GITHUB_V6 = 'https://github.com/phalcon/phalcon';
export const GITHUB_V5 = 'https://github.com/phalcon/cphalcon';

export const SITE_TITLE = 'Phalcon Framework';
export const SITE_DESCRIPTION =
  'Phalcon is an open-source, full-stack PHP framework focused on high performance, low overhead and a clean, expressive API. Phalcon v6 is pure PHP.';

// Top navigation. Anchor links resolve against the homepage.
export const NAV_LINKS = [
  { label: 'Docs', href: DOCS_URL },
  { label: 'Download', href: '/download/linux' },
  { label: 'Benchmarks', href: '/#benchmarks' },
  { label: 'Ecosystem', href: '/#ecosystem' },
  { label: 'AI', href: '/#agentic' },
];

export const NAV_SITE_MENU = [
  { label: 'About', href: '/about' },
  { label: 'Team', href: '/team' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'Hosting', href: '/hosting' },
  { label: 'Support', href: '/support' },
  { label: 'Sponsors', href: '/sponsors' },
  { label: 'Consulting', href: '/consulting' },
  { label: 'Built with Phalcon', href: 'https://builtwith.phalcon.io/' },
];

export const FOOTER_COLUMNS = [
  {
    title: 'Framework',
    links: [
      { label: 'Documentation', href: DOCS_URL },
      { label: 'Download', href: '/download/linux' },
      { label: 'Developer Tools', href: '/download/tools' },
      { label: 'IDE Stubs', href: '/download/stubs' },
      { label: 'Performance', href: '/#why' },
      { label: 'Benchmarks', href: '/#benchmarks' },
      { label: 'Ecosystem', href: '/#ecosystem' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'GitHub', href: GITHUB_V6 },
      { label: 'Discussions (v6)', href: 'https://github.com/phalcon/phalcon/discussions' },
      { label: 'Discussions (v3/v4/v5)', href: 'https://github.com/phalcon/cphalcon/discussions' },
      { label: 'Discord', href: 'https://phalcon.io/discord' },
      { label: 'Blog', href: 'https://phalcon.io/blog' },
      { label: 'Team', href: '/team' },
      { label: 'Sponsors', href: '/sponsors' },
      { label: 'Support', href: '/support' },
    ],
  },
  {
    title: 'For machines',
    links: [
      { label: 'MCP server', href: `${DOCS_URL}/ai/mcp-server` },
      { label: 'llms.txt', href: `${DOCS_URL}/llms.txt` },
      { label: 'llms-full.txt', href: `${DOCS_URL}/llms-full.txt` },
      { label: 'Docs as markdown', href: DOCS_URL },
    ],
  },
];

export const SPONSORS = [
  'MCTekK',
  'Cloudflare',
  'Abits',
  'Crowdin',
  'Algolia',
  'O2',
  'DigitalOcean',
  'Postype',
  'JetBrains',
];
