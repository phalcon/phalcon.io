<p align="center"><a href="https://phalcon.io" target="_blank">
    <img src="https://assets.phalcon.io/phalcon/images/svg/phalcon-logo-transparent-black.svg" height="100" alt="Phalcon"/>
</a></p>

# Phalcon Website

Source of [phalcon.io](https://phalcon.io). It is an [Astro](https://astro.build) site with Tailwind CSS. GitHub
Actions builds it and pushes `dist/` to the `production` branch, which Cloudflare Pages serves.

All tooling runs in Docker; nothing needs to be installed on the host.

## Local preview

```bash
./serve            # http://localhost:8080
```

`./serve` first removes `.astro/dev.json`, the dev-server lock that a container stopped with Ctrl+C leaves
behind. Without that, the next start does not refresh the content. Stop the preview before a build: both use the
`.astro/` cache.

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

The version and the star count of each flavor are in `src/data/project.json`. The daily run (06:17 UTC) reads the
`phalcon/assets` feeds and moves a version forward when GitHub has a newer release, so a release needs no work here.
To show a release at once:

1. Edit the version in `src/data/project.json` (for example `"5.23.0"` or `"6.0.0RC4"`).
2. Push to `master`. The site builds and publishes.

A version only moves forward: the daily run never replaces it with an older one. The status label ("Stable",
"Release candidate", "Beta", "Alpha") comes from the version, so 6.0.0 shows as "Stable" with no other change. A
version must look like `5.22.1` or `6.0.0RC3`; anything else stops the build.

The other facts of a flavor (PHP range, install command, license) are in `FLAVORS` in `src/data/site.mjs`. Change
them there, by hand.

### Sponsors, contributors and stars

They come from [phalcon/assets](https://github.com/phalcon/assets), which refreshes them every day:

| Data | Where to change it |
|---|---|
| Sponsors | Read from GitHub Sponsors and Open Collective. In-kind partners are in `_sponsors/partners.json` in phalcon/assets |
| Contributors | The repositories are listed in `_github/repositories.json` in phalcon/assets. The site shows the top 60 |
| Stars | Read from GitHub |

The daily run copies them into `src/sponsors.json`, `src/data/contributors.json` and `src/data/project.json`, and
commits what changed ("Updating the site data"). A feed that fails its checks keeps the committed file, and the run
shows a warning. To see what the next run would change:

```bash
./run node scripts/update-data.mjs --dry-run              # from the live feeds
./run node scripts/update-data.mjs --from DIR --dry-run   # from local feed files
```

To update now instead of at 06:17, start the workflow by hand on `master`: in GitHub, Actions → Deploy phalcon.io →
Run workflow, or:

```bash
gh workflow run deploy.yml --repo phalcon/phalcon.io --ref master
```

The run updates the data, and it pushes the data commit and publishes the site only when every check passes.

### Pages and content

| What | Where | Checked by |
|---|---|---|
| Pages | `src/pages/` | `scripts/expectations.mjs` (what each page must show) |
| Links, menus, footer, social networks | `src/data/site.mjs` | `npm run verify` (internal links) |
| Code samples on the home page | `src/data/snippets.mjs` | `src/lib/snippets.test.mjs`: a new class must exist in cphalcon and phalcon; add it to `VERIFIED_CLASSES` |
| Testimonials | `src/data/testimonials.mjs` | `scripts/expectations.mjs` |
| Short links (`/fund`, `/t`) and old URLs | `public/_redirects` | `src/lib/redirects.test.mjs`. Never remove a short link; give a dead one a new target |
| Security headers (CSP) | `public/_headers` | `npm run verify`: a new external image, script or frame host must be added here |

After a change, run `./run npm test`, `./run npm run build` and `./run npm run verify`. When a page changes on
purpose, update its entry in `scripts/expectations.mjs`.

### Deployment

A push to `master`, and the daily run, test, build and verify the site, then publish `dist/` to the `production`
branch, which Cloudflare Pages serves. To roll back, open the deployments of the Pages project and roll back to an
earlier one.

## Where things are

| Path | Purpose |
|---|---|
| `src/data/site.mjs` | Links and the facts of each flavor. Versions and stars come from `project.json` |
| `src/data/project.json` | Version and stars of v5 and v6. Edit it at release time, or let the daily run do it |
| `src/data/routes.mjs` | The pages and the old-URL map |
| `src/data/snippets.mjs` | The code samples on the home page |
| `src/data/contributors.json`, `src/sponsors.json` | From the [phalcon/assets](https://github.com/phalcon/assets) feeds, kept current by the daily run |
| `src/fanart.html` | Empty on purpose. The deploy workflow downloads it from phalcon/assets |
| `public/_redirects`, `public/_headers` | Cloudflare Pages redirects (short links such as `/fund`) and security headers |
| `public/js/` | The client scripts. The CSP allows no inline scripts |
| `public/debug/` | Debug assets of Phalcon 1.x to 3.x |

## License

Phalcon is open source software. cphalcon (v5) is licensed under the BSD 3-Clause License, and phalcon (v6) under the
MIT License. Copyright © 2011-present, Phalcon Team.
