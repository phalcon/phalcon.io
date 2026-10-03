/**
 * Updates the committed site data from the phalcon/assets feeds:
 * src/data/project.json (versions and stars), src/data/contributors.json and
 * src/sponsors.json. The deploy workflow runs it on its schedule and commits
 * what changed. It needs the network unless --from is given.
 *
 *   ./run node scripts/update-data.mjs              read the feeds from GitHub
 *   ./run node scripts/update-data.mjs --from DIR   read DIR/repositories.json, DIR/contributors.json, DIR/sponsors.json
 *   ./run node scripts/update-data.mjs --dry-run    print what would change, write nothing
 *
 * A feed that fails its checks keeps its file and prints a GitHub Actions
 * warning; the other feeds still update. The exit code is 0 also then: the
 * committed data is the default.
 */
import { readFileSync, writeFileSync } from 'node:fs';

import {
    contributorsProblems,
    nextProject,
    repositoriesProblems,
    sponsorsProblems,
    toJson,
    visibleContributors,
} from '../src/lib/data-update.mjs';

const FEEDS = 'https://raw.githubusercontent.com/phalcon/assets/master/phalcon';
const FILES = {
    contributors: 'src/data/contributors.json',
    project: 'src/data/project.json',
    sponsors: 'src/sponsors.json',
};

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const from = args.includes('--from') ? args[args.indexOf('--from') + 1] : null;

/** One feed, as { data } or { problem }. */
async function load(name) {
    try {
        if (from) {
            return { data: JSON.parse(readFileSync(`${from}/${name}.json`, 'utf8')) };
        }

        const response = await fetch(`${FEEDS}/${name}.json`, { signal: AbortSignal.timeout(30000) });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return { data: JSON.parse(await response.text()) };
    } catch (error) {
        return { problem: `cannot read the feed: ${error.message}` };
    }
}

/** The problems of a feed: the load problem, or the result of its check. */
const problemsOf = (feed, check) => (feed.problem ? [feed.problem] : check(feed.data));

const warn = (name, message) => console.log(`::warning title=Feed ${name}::${message}`);

/** Writes the file when its text changed (not in a dry run), and prints what happened. */
function update(file, text) {
    if (readFileSync(file, 'utf8') === text) {
        console.log(`same          ${file}`);

        return;
    }

    if (!dryRun) {
        writeFileSync(file, text);
    }

    console.log(`${dryRun ? 'would change' : 'changed     '}  ${file}`);
}

const repositories = await load('repositories');
const contributors = await load('contributors');
const sponsors = await load('sponsors');

const repositoryProblems = problemsOf(repositories, repositoriesProblems);

if (repositoryProblems.length > 0) {
    repositoryProblems.forEach((problem) => warn('repositories', problem));
} else {
    const current = JSON.parse(readFileSync(FILES.project, 'utf8'));
    const { project, warnings } = nextProject(current, repositories.data);

    warnings.forEach((warning) => warn('repositories', warning));
    update(FILES.project, toJson(project));
}

const contributorProblems = problemsOf(contributors, contributorsProblems);

if (contributorProblems.length > 0) {
    contributorProblems.forEach((problem) => warn('contributors', problem));
} else {
    update(FILES.contributors, toJson(visibleContributors(contributors.data)));
}

const sponsorProblems = problemsOf(sponsors, sponsorsProblems);

if (sponsorProblems.length > 0) {
    sponsorProblems.forEach((problem) => warn('sponsors', problem));
} else {
    update(FILES.sponsors, toJson(sponsors.data));
}
