# Martin Lepage Personal Website

A deployment-ready Astro site for **Martin Lepage**: scholar, writer, and AI governance strategist based in Montreal.

## Why Astro

This build uses **Astro + TypeScript + Tailwind CSS** because the site is content-heavy, mostly static, and easiest to maintain when papers, projects, talks, and writing live in markdown collections instead of inside page components.

Next.js was not materially better for this case. The site does not need authenticated dashboards, server actions, or runtime-heavy React islands. Astro gives faster static output, simpler content editing, cleaner RSS/sitemap support, and an easier deployment path for Cloudflare Pages.

## Design Direction

The visual system translates the **Witches' Road** brief into an editorial, trust-heavy atmosphere:

- a dark-first presentation with violet, plum, and bone-toned contrast
- restrained atmosphere instead of overt fantasy signaling
- corridor/path depth, mist, and subtle geometric overlays instead of loud fantasy illustration
- serious typography for scholarship and governance work, without collapsing into corporate SaaS styling
- a content-first layout with symbolic atmosphere concentrated in the hero and section wrappers

The design also borrows lightly from the supplied stationery kit so the site feels related to the existing AI governance identity assets.

## Stack

- Astro 6
- TypeScript
- Tailwind CSS v4 via Vite plugin
- Astro content collections
- MD/markdown content entries
- RSS feed for writing
- Sitemap when `PUBLIC_SITE_URL` or `SITE_URL` is configured

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
│   ├── styles/
│   └── content.config.ts
└── dist/ (generated)
```

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open `http://localhost:4321`.

## Verification

```bash
npm run check
npm run build
```

For production-ready metadata, set `PUBLIC_SITE_URL` or `SITE_URL` before running `npm run build`.

## Editing Workflow

Most updates should happen in markdown or one data file:

- Global bio, contact info, timeline, resume copy: `src/data/site.ts`
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

1. **Live domain**
   - set `PUBLIC_SITE_URL` or `SITE_URL` before production builds
   - use the same public origin for canonical URLs, sitemap output, and RSS metadata

2. **Professional portrait**
   - replace the About page placeholder treatment with a real headshot
   - optionally add a local image under `public/assets/`

3. **Resume PDF**
   - replace `public/files/Martin-Lepage-CV-2026.pdf` with a fully designed final PDF if desired
   - the current file is a generated deployment-safe placeholder artifact

4. **Publication metadata still marked honestly as provisional**
   - venue details
   - DOI/URLs where available
   - exact abstracts where only summaries are currently used
   - duplicated/ambiguous publication-year cases if needed

5. **External profile links**
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
- **Who's the Boob, Who's the Trap?**: publication-stage book manuscript with crossover governance potential
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
5. Set `PUBLIC_SITE_URL` to the final production origin before building.

### GitHub Pages

The simplest path is a GitHub Actions workflow that builds Astro and publishes `dist/`.

At minimum:

1. Run `npm install`
2. Run `npm run build`
3. Deploy the generated `dist/` directory

If you deploy under a subpath instead of a root domain, add the correct `base` value to `astro.config.mjs`.

## Commands

```bash
npm run dev
npm run check
npm run build
npm run preview
```

## Major Build Choices

- **Editorial seriousness first**: the hierarchy answers what Martin does, who it serves, why it is credible, and where to go next.
- **Atmosphere without kitsch**: the Witches' Road influence appears as depth, mist, geometry, thresholds, and muted occult symbolism rather than Halloween or fandom styling.
- **Content collections for maintainability**: new publications, essays, projects, and talks can be added without rewriting page logic.
- **Honest status language**: manuscript-stage work is clearly distinguished from published work, prototypes, and proposal architecture.
