/**
 * The pages that the build must produce. A task adds a page here when it
 * creates the page.
 *
 * build.format is "file": the page `/` is dist/index.html, and every other
 * page `p` is dist/p.html.
 */
export const PAGES = [
    '/',
    '/consulting',
    '/contribute',
    '/download',
    '/download/composer',
    '/download/linux',
    '/download/stubs',
    '/download/windows',
    '/hosting',
    '/sponsors',
    '/support',
    '/team',
    '/testimonials',
];

/** The file in dist/ that serves a page path. */
export function distFile(path) {
    return path === '/' ? 'dist/index.html' : `dist${path}.html`;
}

/** The locales of the old Jekyll site. Each also had a short form (/de/ for /de-de/). */
export const LOCALES = ['de-de', 'el-gr', 'en-us', 'es-es', 'fa-ir', 'ko-kr'];

/** The old page slugs, and the new page of each. */
export const OLD_PAGES = {
    '': '/',
    about: '/contribute',
    consulting: '/consulting',
    download: '/download',
    'download/linux': '/download/linux',
    'download/stubs': '/download/stubs',
    // Developer Tools is hidden until a release works with v5 or v6.
    'download/tools': '/download',
    'download/windows': '/download/windows',
    hosting: '/hosting',
    sponsors: '/sponsors',
    support: '/support',
    team: '/team',
    testimonials: '/testimonials',
};

/** Every old URL, and the page that it must reach with one redirect. */
export function legacyUrls() {
    const urls = [
        { from: '/about', to: '/contribute' },
        { from: '/download/tools', to: '/download' },
    ];

    for (const locale of LOCALES) {
        for (const prefix of [locale, locale.slice(0, 2)]) {
            for (const [slug, to] of Object.entries(OLD_PAGES)) {
                urls.push({ from: slug ? `/${prefix}/${slug}` : `/${prefix}`, to });
            }
        }
    }

    return urls;
}
