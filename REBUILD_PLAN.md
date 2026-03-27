# Rebuild Plan (Martin Site New Look)

## Scope
- Keep the premium new-look homepage from `src/martin-portfolio`.
- Preserve full Astro route depth (`/papers`, `/governance`, `/projects`, `/writing`, etc.).
- Remove leftover Manus/debug artifacts.
- Validate with project build/type-check commands.
- Redeploy to Cloudflare Pages and verify live routes.

## Execution Steps
1. Rebuild Astro site to regenerate full static route tree.
2. Rebuild `src/martin-portfolio` for the new homepage artifact.
3. Compose a single deploy bundle by replacing only `dist/index.html` and adding homepage assets.
4. Remove dead Manus-specific source artifacts and stale runtime dependency.
5. Run `npm run check && npm run build` (Astro) and `pnpm run check && pnpm run build` (martin-portfolio).
6. Deploy composed `dist` to Cloudflare Pages and verify `/`, `/papers/`, `/governance/`.
