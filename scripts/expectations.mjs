/**
 * What the built pages must contain. scripts/verify-build.mjs checks each
 * entry. A task adds entries when it changes a page. One page can have
 * more than one entry.
 *
 * Entry fields (all are optional, except `page`):
 * - has:       text that the page shows (visible text, entities decoded, exact case)
 * - lacks:     text that the page does not show (a string ignores case; or a RegExp)
 * - html:      raw HTML that the page contains (a string is exact; or a RegExp)
 * - htmlLacks: raw HTML that the page does not contain (a string ignores case; or a RegExp)
 * - links:     values that must be the href of an <a> element, exactly
 * - copies:    text that must be part of a copy button value (data-copy)
 */
import { docs, DOWNLOAD_NAV, FLAVORS, JOIN_LINKS, PROJECT_NAV } from '../src/data/site.mjs';

/** Text that no page contains, anywhere in its HTML. */
export const SITE_LACKS = [
    /\bMCP\b/i,
    /benchmark/i,
    /v6\s*·\s*beta/i,
    /6\.0\.0beta/i,
    /worker[- ]mode/i,
    '192.168.',
    'llms.txt',
    'llms-full',
    /\bJIT\b/,
    // Spec, Build and Deploy: no link to an old locale path or an old docs version.
    /href="\/(?:de|el|en|es|fa|ko)(?:-[a-z]{2})?(?:\/|")/,
    /docs\.phalcon\.io\/[345]\.\d+\//,
    // Developer Tools is hidden until a release works with v5 or v6.
    'href="/download/tools"',
    // Code blocks take their colors from the tokens, not from GitHub's theme (#e6edf3 is its text color).
    '#e6edf3',
];

/** @type {Array<{page: string, has?: string[], lacks?: Array<string|RegExp>, html?: Array<string|RegExp>, htmlLacks?: Array<string|RegExp>, links?: string[], copies?: string[]}>} */
export const CONTENT = [
    // Task 2: header and footer (shared by every page; checked on the home page)
    {
        page: '/',
        has: ['cphalcon (v5) BSD-3-Clause · phalcon (v6) MIT', 'Get Phalcon'],
        links: [FLAVORS.v5.repo, '/download', '/contribute', '/sponsors', 'https://phalcon.io/t'],
        // The nav and the footer use the classes of common.css (phalcon/assets), not Tailwind classes.
        html: ['src="/js/nav.js"', '<link rel="stylesheet" href="/css/common.css">', '<nav class="ph-nav">', 'class="ph-footer"', 'class="ph-nav__dropdown-link"'],
        htmlLacks: ['bg-night-950/92', 'group-hover:text-mist-100', 'lg:grid-cols-[1.4fr_1fr_1fr_1fr]'],
    },
    // Task 3: head tags
    {
        page: '/',
        html: [
            'googletagmanager.com/gtag/js?id=G-CR3DKB9Q7P',
            'src="/js/analytics.js" data-ga-id="G-CR3DKB9Q7P"',
            'src="/js/copy.js"',
            `"codeRepository":"${FLAVORS.v5.repo}"`,
            `"codeRepository":"${FLAVORS.v6.repo}"`,
            'property="og:image" content="https://assets.phalcon.io/phalcon/social/github.phalcon.main-site.png?v=2"',
            'rel="canonical" href="https://phalcon.io/"',
            'href="https://assets.phalcon.io/phalcon/favicons/favicon.svg"',
            /^<!DOCTYPE html>\s*<html lang="en">\s*<head>/i,
        ],
    },
    // Design tokens: code blocks use the code theme (src/lib/code-theme.mjs)
    {
        page: '/',
        html: ['color:var(--code-keyword)'],
    },
    {
        page: '/team',
        html: ['rel="canonical" href="https://phalcon.io/team"'],
    },
    // Task 4: sponsors page
    {
        page: '/sponsors',
        has: ['GitHub Sponsors', 'OpenCollective', "ensure the project's stability"],
        links: ['https://phalcon.io/fund', 'https://opencollective.com/phalcon', '/consulting'],
        lacks: ["projects's"],
    },
    // Task 5: hero
    {
        page: '/',
        has: [
            'A full-stack PHP framework delivered as a C extension.',
            'You do not need to know C to use it',
            FLAVORS.v5.tab,
            FLAVORS.v6.tab,
            'open source · BSD-3 / MIT · since 2012',
        ],
        copies: [FLAVORS.v5.install, FLAVORS.v6.install],
        lacks: ['now pure PHP', 'Why v6?'],
        html: ['id="install-panel-v5"', 'id="install-panel-v6"', 'src="/js/tabs.js"'],
        htmlLacks: [/id="install-panel-v\d"[^>]*\shidden/],
    },
    // Task 6: two flavors
    {
        page: '/',
        has: [
            'Two flavors, one API',
            `${FLAVORS.v5.status} · ${FLAVORS.v5.version}`,
            `${FLAVORS.v6.status} · ${FLAVORS.v6.version}`,
            FLAVORS.v5.php,
            FLAVORS.v6.php,
            FLAVORS.v5.license,
            ...FLAVORS.v5.pickWhen,
            ...FLAVORS.v6.pickWhen,
            'Same Phalcon\\ namespaces',
            'Maintained in parallel',
        ],
        links: [FLAVORS.v5.repo, FLAVORS.v6.repo, FLAVORS.v5.installPage, FLAVORS.v6.installPage],
        html: ['id="flavors"'],
    },
    // Task 7: low overhead
    {
        page: '/',
        has: [
            'Low overhead, by design.',
            'EXTENSION',
            'loaded once',
            'the lowest overhead for MVC-based applications',
            'The tradeoff, stated plainly',
        ],
        html: ['id="why"'],
    },
    // Task 8: features
    {
        page: '/',
        has: ['This code runs on v5 and v6.', 'Core', 'Database', 'Front End', 'Business Logic', 'Services'],
        lacks: ['organised'],
        htmlLacks: ['number_format', /id="panel-[a-z]+"[^>]*\shidden/],
        links: [docs('volt'), docs('db-phql'), docs('routing'), docs('encryption-crypt')],
        html: ['data-tabs'],
    },
    // Task 9: community
    {
        page: '/',
        has: ['Built by a community, funded by sponsors.', 'Shipping since', '2012', 'Top contributors'],
        lacks: ['entering a new chapter', '2,571'],
        links: [...JOIN_LINKS.map((link) => link.href), '/contribute', '/sponsors'],
    },
    // Task 10: download overview and composer
    {
        page: '/download',
        has: ['1. Choose a flavor', '2. Choose a platform', FLAVORS.v5.title, FLAVORS.v6.title],
        links: DOWNLOAD_NAV.map((item) => item.href),
    },
    {
        page: '/download/composer',
        has: [FLAVORS.v6.version, FLAVORS.v6.extensions.join(', '), 'You do not need IDE stubs for v6'],
        copies: [FLAVORS.v6.install],
        links: [...DOWNLOAD_NAV.map((item) => item.href), docs('installation', '6.0'), FLAVORS.v6.docs],
    },
    ...['/download/linux', '/download/windows', '/download/stubs'].map((page) => ({
        page,
        links: DOWNLOAD_NAV.map((item) => item.href),
    })),
    // Task 11: v5 install pages
    {
        page: '/download/linux',
        has: ['PIE (recommended)', 'at least 4 GB of RAM', 'Install v6 with Composer'],
        copies: [
            FLAVORS.v5.install,
            'export CFLAGS="-Wno-incompatible-pointer-types"',
            'pecl install phalcon',
            'sudo apt-get install php-phalcon5',
            'brew install phalcon',
            `git checkout tags/v${FLAVORS.v5.version} ./`,
            'cd ext',
        ],
        lacks: ['mcrypt', 'Mongo', 'PSR', 'phalcon-5.0.0', 'php7-phalcon', 'v5.0.0'],
        htmlLacks: ['git://', 'cd cphalcon/build'],
        links: [
            'https://github.com/php/pie',
            `${docs('installation')}#compile-from-sources`,
            `${docs('installation')}#shared-hosting`,
            '/download/composer',
            '/support',
        ],
    },
    {
        page: '/download/windows',
        has: ['thread safety', 'Install v6 with Composer'],
        copies: ['extension=php_phalcon.dll', 'pecl install phalcon'],
        links: [
            'https://github.com/phalcon/cphalcon/releases/latest',
            `${docs('webserver-setup')}#xampp`,
            `${docs('webserver-setup')}#wamp`,
            `${docs('installation')}#windows`,
        ],
        htmlLacks: ['/5.6/', 'PSR'],
    },
    // Task 12: stubs (Developer Tools is hidden)
    {
        page: '/download/stubs',
        has: ['IDE stubs are for v5 only.'],
        copies: ['composer require --dev phalcon/ide-stubs:^v5.0'],
        links: ['https://github.com/phalcon/ide-stubs', docs('static-analysis'), 'https://www.youtube.com/watch?v=UbUx_6Cs6r4'],
    },
    // Task 13: project pages
    {
        page: '/contribute',
        has: [
            'You do not need to know C to help.',
            'Code and tests',
            'Documentation',
            'Spread the word',
            'Share your story',
            'Sponsor',
            'Thanks for flying with Phalcon! <3',
        ],
        lacks: ['Crowdin', '14,000', 'C developer'],
        links: [
            FLAVORS.v5.repo,
            FLAVORS.v6.repo,
            'https://github.com/zephir-lang/zephir',
            'https://github.com/phalcon/documentation',
            'mailto:team@phalcon.io',
            '/sponsors',
            ...PROJECT_NAV.map((item) => item.href),
        ],
    },
    {
        page: '/team',
        has: ['Andres was the inspiration behind Phalcon. Although he is no longer with the project, we are always thankful for his vision.'],
        lacks: ['Andres is was'],
        links: PROJECT_NAV.map((item) => item.href),
    },
    {
        page: '/testimonials',
        has: ['Nikita Vershinin, Lead Developer, Kolesa.kz and krisha.kz', 'Ivan Penchev', 'Murat Küçükosman'],
        links: ['mailto:team@phalcon.io', ...PROJECT_NAV.map((item) => item.href)],
    },
    // Final review: facts and links
    {
        // Built from FLAVORS, so it follows project.json when the daily run moves the version.
        page: '/download/composer',
        has: [`Status: ${FLAVORS.v6.status.toLowerCase()}, ${FLAVORS.v6.version}.`],
    },
    {
        page: '/',
        links: ['https://phalcon.io/brighteon'],
    },
    // Task 16: links that failed the link check
    {
        page: '/testimonials',
        has: ['bezbykow.pl', 'u.dolap.co'],
        htmlLacks: ['href="https://bezbykow.pl"', 'href="https://u.dolap.co"'],
    },
    {
        page: '/consulting',
        links: ['https://mctekk.com'],
        htmlLacks: ['mctekk.com/phalcon'],
    },
    // Task 15: hosting and support
    {
        page: '/hosting',
        has: ['Where Phalcon runs.', `Phalcon v6 runs on any host with PHP ${FLAVORS.v6.php} and Composer, shared hosting included.`],
        lacks: ['Ubuntu 12.04', '5.2 - 7.2', 'Rackspace', 'Mediasecure'],
        htmlLacks: ['/images/hosting/'],
        links: ['/download/linux', '/download/composer'],
    },
    {
        page: '/support',
        links: [
            FLAVORS.v5.discussions,
            FLAVORS.v6.discussions,
            FLAVORS.v5.issues,
            FLAVORS.v6.issues,
            '/download',
            'https://phalcon.io/discord',
            'https://phalcon.io/so',
        ],
        has: ['v5 (cphalcon)', 'v6 (phalcon)', 'Before you post on Stack Overflow'],
        lacks: ['Telegram, Gab'],
    },
];
