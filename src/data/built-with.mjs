/**
 * The entries on /built-with, newest first: projects that run on Phalcon.
 * The image of an entry is public/images/built-with/<slug>.webp (1280 x 800,
 * WebP, at most 300 KB). `source` is the repository when the code is public
 * and `href` is not the repository. `author` is null when the author is not
 * known. `authorHref` is the profile of the author (for example on GitHub), or
 * null. `alt` is the alt text of the image.
 *
 * @typedef {{ slug: string, name: string, href: string, description: string, source: string | null, author: string | null, authorHref: string | null, alt: string }} BuiltWith
 */

/** @type {BuiltWith[]} */
export const BUILT_WITH = [
    {
        slug: 'wuwei-lite',
        name: 'WuWei Lite',
        href: 'https://github.com/xiaochong0302/wuwei-lite',
        description: 'A community edition of WuWei LMS, with the core e-learning features for courses, students, and instructors. It is easy to set up and use.',
        source: null,
        author: 'xiaochong0302',
        authorHref: 'https://github.com/xiaochong0302',
        alt: 'WuWei Lite: the home page of the demo',
    },
    {
        slug: 'outsmart',
        name: 'Outsmart',
        href: 'https://outsmart.io',
        description: 'Social media, SEO, and marketing analytics for you and your competitors.',
        source: null,
        author: 'Ty Kroll',
        authorHref: null,
        alt: 'Outsmart: the home page',
    },
    {
        slug: 'robinson',
        name: 'Robinson',
        href: 'https://www.robinson.rs',
        description: 'The website of a popular Serbian travel agency. It has a frontend module and a backend module, both made with Phalcon.',
        source: 'https://github.com/digitronac/robinson',
        author: null,
        authorHref: null,
        alt: 'Robinson: the home page',
    },
];
