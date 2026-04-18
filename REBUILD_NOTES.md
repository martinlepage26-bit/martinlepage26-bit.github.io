# REBUILD_NOTES

## What Changed
- Fixed mixed production deployment by publishing a single coherent artifact set.
- Rebuilt Astro site to restore full static route coverage.
- Rebuilt `src/martin-portfolio` and used it as the new homepage experience.
- Composed deploy output so:
  - `/` uses the premium new-look homepage
  - deep routes (`/papers`, `/governance`, `/projects`, `/writing`, etc.) remain fully functional from Astro
- Removed dead Manus/debug artifacts from source:
  - `src/martin-portfolio/client/src/components/ManusDialog.tsx`
  - `src/martin-portfolio/client/public/__manus__/debug-collector.js`
  - `src/martin-portfolio/client/public/__manus__/version.json`
- Removed unused dependency: `vite-plugin-manus-runtime` from `src/martin-portfolio/package.json`.
- Updated root TypeScript config to avoid cross-checking a separate app subtree:
  - `tsconfig.json` excludes `src/martin-portfolio/**` from Astro check.

## Design Principles Applied
- Clear conversion-first homepage with strong headline, concise supporting copy, and explicit CTA hierarchy.
- Premium AI-product visual direction: high contrast, restrained glow/gradient treatment, disciplined spacing, and modern typography.
- Route-level clarity: homepage for narrative + conversion, inner pages for depth/trust/SEO.
- Performance-aware motion and effects (no heavy runtime overlays or debug collectors).

## Components/Systems Refactored
- Deployment composition system between Astro and `martin-portfolio` outputs.
- Removed unused Manus-specific component/runtime traces.
- Cleaned runtime config and dependency surface in `martin-portfolio`.

## Validation Run
- `src/martin-portfolio`:
  - `corepack pnpm run check` passed
  - `corepack pnpm run build` passed
- root Astro site:
  - `npm run check` passed (1 non-blocking Astro hint)
  - `npm run build` passed (97 pages generated)

## Content Gaps Requiring Owner Input
- No net-new testimonials, client logos, or external proof metrics were added (intentionally, to avoid unverifiable claims).
- If you want stronger conversion proof on `/`, provide approved factual proof points (e.g., publication counts, engagements, outcomes).
- If you want a fully unified source architecture (single framework, single build), confirm whether `martin-portfolio` should be migrated into Astro components next.

## Follow-up Recommendations
1. Move homepage UI from `martin-portfolio` into native Astro components to remove dual-build composition.
2. Add a tiny deployment script to automate the compose step (Astro build + homepage overlay + Pages deploy).
3. Add a small post-deploy smoke script for `/`, `/papers/`, `/governance/`, `/projects/`.
