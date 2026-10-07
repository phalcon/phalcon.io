/**
 * Site-wide data: versions, links and link lists.
 *
 * The versions and star counts are in project.json. The deploy workflow keeps
 * them current from the phalcon/assets feeds (scripts/update-data.mjs). A
 * manual edit there also works: a version only moves forward.
 */
import project from './project.json' with { type: 'json' };
import { statusOf } from '../lib/versions.mjs';

export const SITE_URL = 'https://phalcon.io';
export const SITE_TITLE = 'Phalcon Framework';
export const SITE_DESCRIPTION =
    'Phalcon is an open-source, full-stack PHP framework delivered as a C extension, with a pure PHP edition that has the same API.';
export const DOCS_URL = 'https://docs.phalcon.io';
export const ASSETS_URL = 'https://assets.phalcon.io/phalcon';
export const ANALYTICS_ID = 'G-CR3DKB9Q7P';
export const CONTACT_EMAIL = 'team@phalcon.io';
export const OPENCOLLECTIVE_URL = 'https://opencollective.com/phalcon';
export const SINCE = 2012;

/** A page of the docs. `version` is "latest" (v5) or "6.0" (v6). The docs use no trailing slash. */
export const docs = (slug, version = 'latest') => `${DOCS_URL}/${version}/${slug}`;

/** A short link on phalcon.io. public/_redirects serves it. */
export const shortLink = (name) => `${SITE_URL}/${name}`;

export const FUND_URL = shortLink('fund');

/** The two flavors. They have the same API and are maintained in parallel. */
export const FLAVORS = {
    v5: {
        key: 'v5',
        name: 'cphalcon',
        title: 'Phalcon v5',
        tab: 'C extension · v5',
        delivery: 'C extension, written in Zephir',
        version: project.v5.version,
        status: statusOf(project.v5.version),
        php: '8.1 - 8.5',
        install: 'pie install phalcon/cphalcon',
        installPage: '/download/linux',
        license: 'BSD-3-Clause',
        repo: 'https://github.com/phalcon/cphalcon',
        discussions: 'https://github.com/phalcon/cphalcon/discussions',
        issues: 'https://github.com/phalcon/cphalcon/issues',
        stars: project.v5.stars,
        docs: `${DOCS_URL}/latest`,
        extensions: ['PDO', 'SPL', 'standard', 'hash', 'json'],
        pickWhen: [
            'You want the best speed and the lowest memory use per request.',
            'You control the server and the PHP extensions that it loads.',
        ],
    },
    v6: {
        key: 'v6',
        name: 'phalcon',
        title: 'Phalcon v6',
        tab: 'Pure PHP · v6',
        delivery: 'Composer package, pure PHP',
        version: project.v6.version,
        status: statusOf(project.v6.version),
        php: '8.1+',
        install: 'composer require phalcon/phalcon',
        installPage: '/download/composer',
        license: 'MIT',
        repo: 'https://github.com/phalcon/phalcon',
        discussions: 'https://github.com/phalcon/phalcon/discussions',
        issues: 'https://github.com/phalcon/phalcon/issues',
        stars: project.v6.stars,
        docs: `${DOCS_URL}/6.0`,
        extensions: ['fileinfo', 'json', 'mbstring', 'pdo', 'xml'],
        pickWhen: [
            'Your host does not allow custom PHP extensions.',
            'You want to step-debug or run static analysis into framework code.',
        ],
    },
};

/** The links in the header bar. */
export const NAV_LINKS = [
    { label: 'Download', href: '/download' },
    { label: 'Docs', href: DOCS_URL },
    { label: 'Features', href: '/#features' },
];

/** The Community menu in the header. */
export const COMMUNITY_LINKS = [
    { label: 'Discord', href: shortLink('discord') },
    { label: 'Discussions (v5)', href: FLAVORS.v5.discussions },
    { label: 'Discussions (v6)', href: FLAVORS.v6.discussions },
    { label: 'Stack Overflow', href: shortLink('so') },
    { label: 'Blog', href: shortLink('blog') },
    { label: 'Support', href: '/support' },
];

/** The Project menu in the header. */
export const PROJECT_LINKS = [
    { label: 'Contribute', href: '/contribute' },
    { label: 'Team', href: '/team' },
    { label: 'Testimonials', href: '/testimonials' },
    { label: 'Sponsors', href: '/sponsors' },
    { label: 'Hosting', href: '/hosting' },
    { label: 'Built with Phalcon', href: 'https://builtwith.phalcon.io' },
];

/** The "join" links of the Community section on the home page. */
export const JOIN_LINKS = [
    { label: 'Discord', href: shortLink('discord') },
    { label: 'Discussions (v5)', href: FLAVORS.v5.discussions },
    { label: 'Discussions (v6)', href: FLAVORS.v6.discussions },
    { label: 'GitHub', href: FLAVORS.v5.repo },
    { label: 'Stack Overflow', href: shortLink('so') },
];

/** Social networks, in the footer. */
export const SOCIALS = [
    { label: 'Telegram', href: shortLink('telegram') },
    { label: 'Gab', href: shortLink('gab') },
    { label: 'MeWe', href: shortLink('mewe') },
    { label: 'Facebook', href: shortLink('fb') },
    { label: 'X (Twitter)', href: shortLink('t') },
    { label: 'BitChute', href: shortLink('bitchute') },
    { label: 'Brighteon', href: shortLink('brighteon') },
    { label: 'YouTube', href: shortLink('youtube') },
    { label: 'LinkedIn', href: shortLink('linkedin') },
    { label: 'Reddit', href: shortLink('reddit') },
];

export const FOOTER_COLUMNS = [
    {
        title: 'Framework',
        links: [
            { label: 'Documentation', href: DOCS_URL },
            { label: 'Download', href: '/download' },
            { label: 'IDE Stubs', href: '/download/stubs' },
            { label: 'Hosting', href: '/hosting' },
        ],
    },
    {
        title: 'Project',
        links: [
            { label: 'Contribute', href: '/contribute' },
            { label: 'Team', href: '/team' },
            { label: 'Testimonials', href: '/testimonials' },
            { label: 'Sponsors', href: '/sponsors' },
            { label: 'Consulting', href: '/consulting' },
            { label: 'Built with Phalcon', href: 'https://builtwith.phalcon.io' },
        ],
    },
    {
        title: 'Community',
        links: [
            { label: 'Discord', href: shortLink('discord') },
            { label: 'Discussions (v5)', href: FLAVORS.v5.discussions },
            { label: 'Discussions (v6)', href: FLAVORS.v6.discussions },
            { label: 'GitHub (v5)', href: FLAVORS.v5.repo },
            { label: 'GitHub (v6)', href: FLAVORS.v6.repo },
            { label: 'Stack Overflow', href: shortLink('so') },
            { label: 'Blog', href: shortLink('blog') },
            { label: 'Support', href: '/support' },
        ],
    },
];

/** Sub-navigation of the download pages. */
export const DOWNLOAD_NAV = [
    { label: 'Overview', href: '/download' },
    { label: 'Linux/macOS/BSD', href: '/download/linux' },
    { label: 'Windows', href: '/download/windows' },
    { label: 'Composer (v6)', href: '/download/composer' },
    { label: 'IDE Stubs', href: '/download/stubs' },
];

/** Sub-navigation of the Contribute, Team and Testimonials pages. */
export const PROJECT_NAV = [
    { label: 'Contribute', href: '/contribute' },
    { label: 'Team', href: '/team' },
    { label: 'Testimonials', href: '/testimonials' },
];
