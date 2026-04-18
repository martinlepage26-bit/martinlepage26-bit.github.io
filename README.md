# Martin Lepage Personal Website

A deployment-ready Astro site for **Martin Lepage**: scholar, writer, and AI governance strategist based in Montreal.

## Why Astro

This build uses **Astro + TypeScript + Tailwind CSS** because the site is content-heavy, mostly static, and easiest to maintain when papers, projects, talks, and writing live in markdown collections instead of inside page components.

Next.js was not materially better for this case. The site does not need authenticated dashboards, server actions, or runtime-heavy React islands. Astro gives faster static output, simpler content editing, cleaner RSS/sitemap support, and an easier deployment path for Cloudflare Pages.

## Design Direction

The site is designed as a **public authority platform** rather than a decorative portfolio:

- governance work is surfaced clearly as a professional entry point
- scholarship, writings, books, projects, and talks remain accessible as a selective archive
- navigation and homepage sections are built for fast visitor self-sorting
- the visual system aims for calm, premium, document-compatible seriousness rather than startup gloss or mystical atmosphere
- contact paths are explicit for consulting, speaking, editorial, academic, and media opportunities

## Stack

- Astro 6
- TypeScript
- Tailwind CSS v4 via Vite plugin
- Astro content collections
- MD/markdown content entries
- RSS feed for writing
- Sitemap generated from the shared production-origin config, with env overrides available when needed

## Project Structure

```text
martin-lepage-site/
├── astro.config.mjs
├── package.json
├── public/
│   ├── assets/
│   ├── files/
│   ├── social/
│   ├── favicon.svg
│   └── site.webmanifest
├── src/
│   ├── components/
│   ├── content/
│   │   ├── papers/
│   │   ├── projects/
│   │   ├── talks/
│   │   └── writings/
│   ├── data/
│   │   └── site.ts
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── lib/
│   ├── pages/
│   │   ├── governance/
│   ├── styles/
│   └── content.config.ts
└── dist/ (generated)
```

## Runtime Prerequisites

Use Node `22.12.0` or newer (see `package.json` engines). This repo includes `.nvmrc` pinned to `22.12.0` for local parity with CI.

```bash
nvm install
nvm use
```

After switching Node, install dependencies and run scripts (`npm ci`, `npm run dev`, `npm run check`, `npm run smoke`) under that version.

## Install

```bash
npm install
```

## Run Locally

Use the default development workflow:

```bash
npm run dev
```

Astro will pick an available local port (usually `http://localhost:4321`).

Use deterministic local mode when you need a stable host/port for scripts, captures, or repeatable debugging:

```bash
npm run dev:local
```

This binds to `http://127.0.0.1:4510` with `--strictPort`.

## ECHO Local TTS

`/echo/` is a browser-local voice reader.
No API key, Worker binding, or backend endpoint is required for playback.

Consolidated entry points:

- `/echo/` -> primary app
- `/ariel/` -> redirect to `/echo/?profile=ariel`
- `/voice11/` -> redirect to `/echo/?profile=voice11`

Behavior notes:

- Drag-and-drop upload supports `.txt`, `.md`, `.docx`, and `.pdf`.
- Text extraction and playback run in-browser.
- Voice selection comes from the browser and operating system (`speechSynthesis`).
- ECHO, Ariel, and Voice11 act as local delivery presets for rate, pitch, volume, and voice matching heuristics.
- Draft text and controls persist in local storage for return visits.

Implementation files:

- `src/pages/echo/index.astro`
- `src/scripts/echo-reader.js`
- `src/styles/echo-standalone.css`

## Verification

```bash
npm run check
npm run build
npm run preview
npm run smoke
```

Smoke test defaults to host `127.0.0.1` and port `4511`.

Optional smoke overrides:

```bash
SMOKE_HOST=127.0.0.1 SMOKE_PORT=4520 npm run smoke
```

Production metadata now defaults to `https://martin.govern-ai.ca`.
Set `PUBLIC_SITE_URL` or `SITE_URL` only when you intentionally want to override that origin for a different environment.

## Editing Workflow

Most updates should happen in markdown or one data file:

- Global bio, contact info, timeline, resume copy: `src/data/site.ts`
- Homepage routing, governance framing, and shared practice messaging: `src/data/site.ts`
- Papers and publications: `src/content/papers/*.md`
- Projects: `src/content/projects/*.md`
- Writing: `src/content/writings/*.md`
- Talks and media: `src/content/talks/*.md`

### Content collections

Each collection is validated in [`src/content.config.ts`](./src/content.config.ts).

Current collections:

- `papers`
- `projects`
- `writings`
- `talks`

## Replace These Placeholders

Before launch, update these items:

1. **Professional portrait**
   - replace the About page placeholder treatment with a real headshot
   - optionally add a local image under `public/assets/`

2. **Resume PDF**
   - replace `public/files/Martin-Lepage-CV-2026.pdf` with a fully designed final PDF if desired
   - the current file is a generated deployment-safe placeholder artifact

3. **Publication metadata still marked honestly as provisional**
   - venue details
   - DOI/URLs where available
   - exact abstracts where only summaries are currently used
   - duplicated/ambiguous publication-year cases if needed

4. **External profile links**
   - verify LinkedIn, GitHub, ORCID, Substack, Instagram, and final preferred public channels

## Notes on Seeded Content

This project is intentionally **not empty**. It includes seeded papers, projects, writing, and talks using:

- the supplied publication record
- the supplied CVs
- the supplied manuscript draft for *Magic After Legitimacy*
- GitHub profile/repository references
- clearly labeled placeholder language where exact metadata is still unknown

No fake employers, degrees, or awards were invented.

## Book-Stage Work Framing

The seeded book-stage entries preserve the editorial distinctions you specified:

- **The Weather Beneath the Walls**: closest to a real publishable book
- **Alchemy of the Wound**: full manuscript needing developmental containment
- **Legitimacy Machines / Altars of Control**: proposal-plus-architecture project, not yet a finished manuscript

## SEO / Metadata

Defaults are handled in `src/layouts/BaseLayout.astro` and `src/lib/seo.ts`:

- page titles
- meta descriptions
- Open Graph tags
- Twitter/X card tags
- canonical URLs
- Person structured data
- Article structured data for writing and publication detail pages

## Deployment

### Cloudflare Pages

This is a static site. Use:

- Build command: `npm run build`
- Output directory: `dist`

If deploying from Git:

1. Push the repository to GitHub.
2. Create a Cloudflare Pages project from that repo.
3. Set the build command to `npm run build`.
4. Set the output directory to `dist`.
5. The production origin defaults to `https://martin.govern-ai.ca`. Set `PUBLIC_SITE_URL` only if you intentionally need a different build origin.

### GitHub Pages

This repo includes a GitHub Actions workflow at `.github/workflows/verify.yml` that:

1. Runs `npm ci`
2. Runs `npm run check`
3. Runs `npm run smoke` (which builds the site and verifies preview routes)
4. Publishes `dist/` to GitHub Pages on successful pushes to `main`

To enable deployment the first time, open **Settings -> Pages** and set **Source** to `GitHub Actions`.

If you deploy under a subpath instead of a root domain, add the correct `base` value to `astro.config.mjs`.

### Deployment Governance (Manual Settings)

Production deployment control is external and must be verified in platform settings:

1. In Cloudflare Pages project settings, set `Production branch` to `main`.
2. In Cloudflare Pages build settings, keep `Build command` as `npm run build` and `Build output directory` as `dist`.
3. In GitHub branch protection/rulesets for `main`, keep `Require status checks to pass before merging` with required check `Verify / verify`.
4. In GitHub branch protection/rulesets for `main`, keep `Require a pull request before merging` and keep direct pushes to `main` restricted to maintainers.

Without these external settings, production deploys may proceed from unverified commits even though in-repo CI exists.

## Maintainer Merge Controls

In-repo enforcement is defined in `.github/workflows/verify.yml`:

1. `Verify / verify` runs `npm run check` and `npm run smoke` on pull requests and pushes to `main`
2. `Verify / deploy` publishes to GitHub Pages after `verify` passes on `main`

Merge blocking is a GitHub setting, not a repo file. Maintain this manually for `main` under **Settings -> Branches** (or **Settings -> Rules -> Rulesets**):

1. Enable `Require a pull request before merging`.
2. Enable `Require status checks to pass before merging`.
3. Add required check `Verify / verify`.
4. Enable `Require branches to be up to date before merging`.
5. Keep direct pushes to `main` restricted to maintainers only (via branch protection/ruleset restrictions).

Without these GitHub settings, the `Verify` workflow runs but does not block merges.

## Commands

```bash
npm run dev
npm run dev:local
npm run check
npm run build
npm run preview
npm run smoke
```

## Major Build Choices

- **Authority-platform hierarchy first**: the homepage answers who Martin is, what kind of work he does, who the site is for, and what the next step should be.
- **Governance gets a dedicated route**: `/governance/` is the professional trust surface for consulting- and documentation-oriented visitors, while `/projects/` remains the wider in-progress archive.
- **Content collections for maintainability**: new publications, essays, projects, and talks can be added without rewriting page logic.
- **Honest status language**: manuscript-stage work is clearly distinguished from published work, prototypes, and proposal architecture.

## Source of Truth

The `main` branch is the single source of truth for this repository.

- All production deployments (Cloudflare Pages) are built from `main`
- All changes must be merged into `main` to be considered production-ready
- Long-lived divergence from `main` is not allowed

If your local branch differs from `origin/main`, you must reconcile before pushing.
