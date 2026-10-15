/**
 * The entries on /built-with, newest first: projects that run on Phalcon.
 * The image of an entry is public/images/built-with/<slug>.webp (1280 x 800,
 * WebP, at most 300 KB). `tags` has 1 to 10 tags of BUILT_WITH_TAGS, in any
 * order. `source` is the repository when the code is public and `href` is not
 * the repository. `author` is null when the author is not known. `authorHref`
 * is the profile of the author (for example on GitHub), or null. `alt` is the
 * alt text of the image.
 *
 * @typedef {{ slug: string, name: string, href: string, description: string, tags: string[], source: string | null, author: string | null, authorHref: string | null, alt: string }} BuiltWith
 */

/**
 * The preset tags, in three groups: the project type, how the project uses
 * Phalcon, and what runs with Phalcon. Each group is sorted A to Z. An entry
 * can use only these tags. To add a tag, add it to its group.
 */
export const BUILT_WITH_TAGS = {
    type: [
        'Analytics', 'Blog', 'CMS', 'Developer tool', 'E-commerce', 'Education', 'Entertainment', 'Forum',
        'Marketing', 'Media', 'News', 'Productivity', 'SaaS', 'Social network', 'Travel',
    ],
    phalcon: [
        'ACL', 'Assets', 'Cache', 'CLI', 'Events', 'Forms', 'Incubator', 'Micro', 'Multi module', 'ORM',
        'REST API', 'Single module', 'Validation', 'Volt',
    ],
    stack: [
        'APCu', 'Beanstalk', 'Bootstrap', 'Codeception', 'Docker', 'Elasticsearch', 'MariaDB', 'Memcached',
        'MongoDB', 'MySQL', 'Phinx', 'PHPUnit', 'PostgreSQL', 'RabbitMQ', 'React', 'Redis', 'SQLite', 'Vue',
    ],
};

/** @type {BuiltWith[]} */
export const BUILT_WITH = [
    {
        slug: 'wuwei-lite',
        name: 'WuWei Lite',
        href: 'https://github.com/xiaochong0302/wuwei-lite',
        description: 'A community edition of WuWei LMS, with the core e-learning features for courses, students, and instructors. It is easy to set up and use.',
        tags: ['Education', 'Cache', 'CLI', 'Multi module', 'ORM', 'Volt', 'Docker', 'MySQL', 'Phinx', 'Redis'],
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
        tags: ['Analytics', 'Marketing', 'SaaS'],
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
        tags: ['Travel', 'ACL', 'CLI', 'Incubator', 'Multi module', 'ORM', 'Memcached', 'MySQL', 'Phinx', 'PHPUnit'],
        source: 'https://github.com/digitronac/robinson',
        author: null,
        authorHref: null,
        alt: 'Robinson: the home page',
    },
];

/**
 * The tags of an entry in the order of the groups, then in the order of each
 * group. It returns a new list.
 *
 * @param {string[]} tags
 * @returns {string[]}
 */
export function orderTags(tags) {
    const preset = Object.values(BUILT_WITH_TAGS).flat();

    return [...tags].sort((a, b) => preset.indexOf(a) - preset.indexOf(b));
}
