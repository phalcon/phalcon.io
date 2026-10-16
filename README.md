<p align="center"><a href="https://phalcon.io" target="_blank">
    <img src="https://assets.phalcon.io/phalcon/images/svg/phalcon-logo-transparent-black.svg" height="100" alt="Phalcon"/>
</a></p>

# Phalcon Website

Source of [phalcon.io](https://phalcon.io). It is an [Astro](https://astro.build) site with Tailwind CSS. GitHub Actions builds it and pushes `dist/` to the `production` branch, which Cloudflare Pages serves.

All tooling runs in Docker; nothing needs to be installed on the host.

## Built with Phalcon: add your project

[Built with Phalcon](https://phalcon.io/built-with) shows projects that run on Phalcon. To add your project, open a pull request to `master` with two changes:

1. **A screenshot** of your project: `public/images/built-with/<slug>.webp`. It must be WebP, 1280 × 800 pixels, 300 KB or less, with no metadata and no color profile (for example `cwebp -q 80 screenshot.png -o acme-shop.webp`). `<slug>` is a short name for your project, in lowercase letters, digits and hyphens (for example `acme-shop`).
2. **An entry** at the top of `BUILT_WITH` in `src/data/built-with.mjs` (the list is newest first):

```js
{
    slug: 'acme-shop',
    name: 'Acme Shop',
    href: 'https://www.example.com',
    description: 'An online store for rockets and anvils.',
    tags: ['E-commerce', 'Multi module', 'ORM', 'Volt', 'MySQL', 'Redis'],
    source: null,
    author: 'Jane Doe',
    authorHref: 'https://github.com/janedoe',
    alt: 'Acme Shop: the home page',
},
```

| Key | Value |
|---|---|
| `slug` | The file name of the screenshot, without `.webp` |
| `name` | The name of the project |
| `href` | The link to the project (`https://`) |
| `description` | What the project is, in one or two short sentences |
| `tags` | 1 to 10 tags of `BUILT_WITH_TAGS` (in the same file), in any order. The page shows the project type first, then how the project uses Phalcon, then the stack |
| `source` | The link to the public source code, or `null`. Use `null` when `href` is the repository |
| `author` | Your name, or `null` |
| `authorHref` | The link to your profile (for example on GitHub), or `null`. It needs an `author` |
| `alt` | A short text that tells what the screenshot shows |

Use only the tags of `BUILT_WITH_TAGS`. To propose a new tag, add it to the right group (A to Z) in the same pull request.

Then run `./run npm test`: it checks the entry and the screenshot. `./serve` shows the page at `http://localhost:8080/built-with`. Each pull request runs the same tests and the build.

## Local preview

```bash
./serve            # http://localhost:8080
```

`./serve` first removes `.astro/dev.json`, the dev-server lock that a container stopped with Ctrl+C leaves behind. Without that, the next start does not refresh the content. Stop the preview before a build: both use the `.astro/` cache.

## Build, test, check

```bash
./run npm ci
./run npm test               # unit tests (node:test)
./run npx astro check        # types
./run npm run build          # writes dist/
./run npm run verify         # checks dist/ against scripts/expectations.mjs
./run node scripts/check-links.mjs   # external links (needs the network)
```

## Maintaining the site

### Publish a release

The version and the star count of each flavor are in `src/data/project.json`. The daily run (06:17 UTC) reads the `phalcon/assets` feeds and moves a version forward when GitHub has a newer release, so a release needs no work here. To show a release at once:

1. Edit the version in `src/data/project.json` (for example `"5.23.0"` or `"6.0.0RC4"`).
2. Push to `master`. The site builds and publishes.

A version only moves forward: the daily run never replaces it with an older one. The status label ("Stable", "Release candidate", "Beta", "Alpha") comes from the version, so 6.0.0 shows as "Stable" with no other change. A version must look like `5.22.1` or `6.0.0RC3`; anything else stops the build.

The other facts of a flavor (PHP range, install command, license) are in `FLAVORS` in `src/data/site.mjs`. Change them there, by hand.

### Sponsors, contributors and stars

They come from [phalcon/assets](https://github.com/phalcon/assets), which refreshes them every day:

| Data | Where to change it |
|---|---|
| Sponsors | Read from GitHub Sponsors and Open Collective. In-kind partners are in `scripts/sponsors/partners.json` in phalcon/assets |
| Contributors | The repositories are listed in `scripts/github/repositories.json` in phalcon/assets. The site shows the top 60 |
| Stars | Read from GitHub |

The daily run copies them into `src/sponsors.json`, `src/data/contributors.json` and `src/data/project.json`, and commits what changed ("Updating the site data"). A feed that fails its checks keeps the committed file, and the run shows a warning. To see what the next run would change:

```bash
./run node scripts/update-data.mjs --dry-run              # from the live feeds
./run node scripts/update-data.mjs --from DIR --dry-run   # from local feed files
```

To update now instead of at 06:17, start the workflow by hand on `master`: in GitHub, Actions → Deploy phalcon.io → Run workflow, or:

```bash
gh workflow run deploy.yml --repo phalcon/phalcon.io --ref master
```

The run updates the data, and it pushes the data commit and publishes the site only when every check passes.

### Colors and fonts

The colors and the fonts come from `phalcon/css/tokens.css` in [phalcon/assets](https://github.com/phalcon/assets): the design tokens that every Phalcon site uses. The code theme comes from `phalcon/css/code-theme.json` there. `src/styles/tokens.css` and `src/styles/code-theme.json` are copies. Every deploy run downloads the two files again before the build. When a download fails, or when a file is not correct (for example, a token that the site uses is missing or has no value, or the theme uses a code role that `global.css` does not map), the run keeps that committed copy and shows a warning.

- To change a color, change `tokens.css` in phalcon/assets. The site gets it on its next deploy.
- To get the new files now, for a local preview or to commit them: `./run node scripts/update-tokens.mjs`.
- The nav and the footer use `public/css/common.css`, a copy of `phalcon/css/common.css` in phalcon/assets: the shared header and footer of the Phalcon sites. Every deploy run downloads it again, after the tokens. Change it in phalcon/assets, not here.
- The icons (`public/favicon.ico`, `public/favicon.svg`, `public/apple-touch-icon.png`, `public/android-chrome-192x192.png` and `public/android-chrome-512x512.png`) are copies of `phalcon/favicons/` in phalcon/assets, the icons of every Phalcon site. Every deploy run downloads them again. Change them in phalcon/assets, not here.
- Use a color through the tokens: a Tailwind class such as `bg-accent-400`, or `var(--ph-…)` in CSS and in props. `npm test` fails on a typed color (`#…` or `rgb(…)`) in `src/`.
- Code blocks use the code theme (`src/styles/code-theme.json`, read by `src/lib/code-theme.mjs`): the rules of GitHub's dark theme with `--code-<role>` variables. `.astro-code` in `src/styles/global.css` maps them to the dark syntax tokens. phalcon/assets checks the rules.

### Pages and content

| What | Where | Checked by |
|---|---|---|
| Pages | `src/pages/` | `scripts/expectations.mjs` (what each page must show) |
| Links, menus, footer, social networks | `src/data/site.mjs` | `npm run verify` (internal links) |
| Code samples on the home page | `src/data/snippets.mjs` | `src/lib/snippets.test.mjs`: a new class must exist in cphalcon and phalcon; add it to `VERIFIED_CLASSES` |
| Testimonials | `src/data/testimonials.mjs` | `scripts/expectations.mjs` |
| Short links (`/fund`, `/t`) and old URLs | `public/_redirects` | `src/lib/redirects.test.mjs`. Never remove a short link; give a dead one a new target |
| Security headers (CSP) | `public/_headers` | `npm run verify`: a new external image, script or frame host must be added here |

After a change, run `./run npm test`, `./run npm run build` and `./run npm run verify`. When a page changes on purpose, update its entry in `scripts/expectations.mjs`.

### A Built with Phalcon pull request

A pull request that adds a project has a screenshot from a person outside the team. The CI only reads the bytes of the image (`npm test`); it does not decode it. Before the merge, decode the screenshot and encode it again, so that the published file has only the pixels:

```bash
gh pr diff <number> --name-only   # only src/data/built-with.mjs and public/images/built-with/<slug>.webp
gh pr checkout <number>
scripts/reencode <slug>      # public/images/built-with/<slug>.webp: quality 80, no metadata
./run npm test
./serve                      # look at http://localhost:8080/built-with
```

If the pull request changes any other file, read those changes before you run a command: after the checkout, `scripts/reencode`, `./run` and `./serve` run the files of the pull request on your computer.

Then commit the re-encoded file and push it (`git push`). This works when the pull request allows edits by maintainers. If it does not, merge on your computer: `git checkout master`, `git merge <branch>`, `scripts/reencode <slug>`, commit, and push `master` once, so the site never serves the original file.

`scripts/reencode` runs `dwebp` and `cwebp` (`libwebp-tools` on Alpine) in containers with no network, no capabilities, a read-only system and only `public/images/built-with/`. Its first run builds the local image `phalcon-io-webp`. Docker keeps that image, so it does not get libwebp updates by itself. After a libwebp security fix, or every few months, build it again:

```bash
printf 'FROM alpine:3.24\nRUN apk add --no-cache libwebp-tools\n' | docker build --pull --no-cache --tag phalcon-io-webp -
```

### Deployment

A push to `master`, and the daily run, test, build and verify the site, then publish `dist/` to the `production` branch, which Cloudflare Pages serves. To roll back, open the deployments of the Pages project and roll back to an earlier one.

## Where things are

| Path | Purpose |
|---|---|
| `src/data/site.mjs` | Links and the facts of each flavor. Versions and stars come from `project.json` |
| `src/data/project.json` | Version and stars of v5 and v6. Edit it at release time, or let the daily run do it |
| `src/data/routes.mjs` | The pages and the old-URL map |
| `src/data/snippets.mjs` | The code samples on the home page |
| `src/data/contributors.json`, `src/sponsors.json` | From the [phalcon/assets](https://github.com/phalcon/assets) feeds, kept current by the daily run |
| `src/fanart.html` | Empty on purpose. The deploy workflow downloads it from phalcon/assets |
| `src/styles/tokens.css` | Copy of the design tokens from phalcon/assets. Every deploy run refreshes it |
| `public/css/common.css` | Copy of the shared header and footer from phalcon/assets. Every deploy run refreshes it |
| `src/styles/code-theme.json` | Copy of the code theme from phalcon/assets: GitHub's dark rules, with the colors from the tokens. Every deploy run refreshes it |
| `src/lib/code-theme.mjs` | Reads the code theme |
| `src/lib/design-checks.mjs`, `src/lib/design-refresh.mjs`, `src/lib/stars.mjs` | Copies of the shared tools in phalcon/assets (`phalcon/tools/`): the checks and the refresh of the design files, and the star count. Every deploy run gets them again first. Change them in phalcon/assets |
| `public/_redirects`, `public/_headers` | Cloudflare Pages redirects (short links such as `/fund`) and security headers |
| `public/js/` | The client scripts. The CSP allows no inline scripts |
| `public/debug/` | Debug assets of Phalcon 1.x to 3.x |

## License

Phalcon is open source software. cphalcon (v5) is licensed under the BSD 3-Clause License, and phalcon (v6) under the MIT License. Copyright © 2011-present, Phalcon Team.
