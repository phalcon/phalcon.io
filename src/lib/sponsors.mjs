/**
 * The sponsors roster from the phalcon/assets feed, committed in
 * src/sponsors.json. scripts/update-data.mjs keeps it current, and a feed
 * that fails its checks keeps the committed roster.
 *
 * `group` is the only signal in the data. `sponsor` and `partner` show as
 * logos; `supporter` and `backer` show as names. No amounts are shown.
 *
 * @typedef {{ group: string, id: string, kind: string, logo: string | null, name: string, source: string[], url: string }} Sponsor
 */

export const LOGO_GROUPS = [
    { group: 'sponsor', title: 'Sponsors' },
    { group: 'partner', title: 'Partners' },
];

export const NAME_GROUPS = [
    { group: 'supporter', title: 'Supporters' },
    { group: 'backer', title: 'Backers' },
];

/**
 * The entries of one group, sorted by name. With `withLogo`, entries
 * that have no logo are dropped, because a logo section cannot show them.
 *
 * @param {Sponsor[]} sponsors
 * @param {string} group
 * @param {{ withLogo?: boolean }} [options]
 * @returns {Sponsor[]}
 */
export function inGroup(sponsors, group, { withLogo = false } = {}) {
    return sponsors
        .filter((sponsor) => sponsor.group === group && (!withLogo || sponsor.logo))
        .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
}

/**
 * @param {Sponsor[]} sponsors
 * @returns {Array<{ group: string, title: string, entries: Sponsor[] }>}
 */
export function logoSections(sponsors) {
    return LOGO_GROUPS.map(({ group, title }) => ({ entries: inGroup(sponsors, group, { withLogo: true }), group, title })).filter(
        (section) => section.entries.length > 0
    );
}

/**
 * @param {Sponsor[]} sponsors
 * @returns {Array<{ group: string, title: string, entries: Sponsor[] }>}
 */
export function nameSections(sponsors) {
    return NAME_GROUPS.map(({ group, title }) => ({ entries: inGroup(sponsors, group), group, title })).filter(
        (section) => section.entries.length > 0
    );
}
