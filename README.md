# portfolio

Personal portfolio at [cosmincalin.es](https://cosmincalin.es).

**Format** (v3, June 2026): single profile page — cover photo, avatar, bio card with social tooltips, and four deep-linkable tabs (`#projects`, `#resume`, `#skills`, `#gallery`). Project detail pages, a printable CV and legal pages (terms + privacy, all four locales) hang off it. Appearance menu offers light/dark/system theme **and** four accent palettes (mint/blue/violet/amber), both persisted in `localStorage` and applied before first paint.

**Stack**: Astro 5 (islands architecture) · React 19 (interactive widgets only) · Tailwind CSS 4 (via `@theme`) · TypeScript 5.9 (strict) · Self-hosted Inter + JetBrains Mono · `astro-icon` (Lucide + Simple Icons, tree-shaken) · `cmdk` (command palette).

**Structure**: site identity/socials/feature-flags in `src/config/site.ts`; all localised strings in `src/i18n/*.json`; all content as typed collections (`projects`, `jobs`, `education`, `skills`, `gallery`, `legal`) validated by Zod. Tabs, tooltips and the image lightbox are dependency-free (ARIA tabs pattern, CSS tooltips, native `<dialog>`); React islands are reserved for the command palette, locale switcher, appearance menu and project filter.

**Auth**: none today — but Logto-ready. `src/lib/auth/` defines a provider-agnostic interface with a disabled null provider; the cutover checklist lives in [`src/lib/auth/README.md`](src/lib/auth/README.md).

**Deployment**: Multi-stage Dockerfile (Node 20-alpine build → `nginxinc/nginx-unprivileged:alpine` runtime). Served via Dokploy + Traefik on the IONOS VPS.

**Languages**: English, Spanish, Catalan, Romanian — Astro i18n routing at `/{en,es,ca,ro}/…`.

**Analytics**: Self-hosted [Umami](https://umami.is) (cookie-less, GDPR-friendly). Snippet injected via `PUBLIC_UMAMI_*` env vars at build time. Zero third-party JS by default.

See [ARCHITECTURE.md](ARCHITECTURE.md) for design rationale and tradeoffs.

## Local dev

```bash
npm install
npm run dev          # http://localhost:4321
```

## Build + serve

```bash
npm run build        # type-check + Astro build → dist/
npm run preview      # serve dist/ for smoke test
```

## Test in container

```bash
docker build -t portfolio:test .
docker run --rm -p 8080:8080 portfolio:test
# open http://localhost:8080
```

## Deploy

`git push` → Dokploy webhook → automatic redeploy on the VPS. See [`infrastructure/WORKFLOW.md`](../infrastructure/WORKFLOW.md) for the full pipeline.

## Content

All content lives under `src/content/` as typed Markdown (Zod schemas in `src/content.config.ts`). Add a project: drop a `.md` in `src/content/projects/<locale>/<slug>.md`, fill frontmatter, push. The build will fail if the schema doesn't match — no broken data ships.

See [TRANSLATIONS_NEEDED.md](TRANSLATIONS_NEEDED.md) for the list of strings still pending translation to ES/CA/RO.

## Env vars

| Var | Purpose | Required? |
|---|---|---|
| `PUBLIC_UMAMI_SCRIPT_URL`  | URL of `script.js` on your self-hosted Umami | Optional |
| `PUBLIC_UMAMI_WEBSITE_ID`  | Umami site ID (from Umami → Websites → Edit) | Optional |
| `PUBLIC_AUTH_PROVIDER`     | `none` (default). `logto` is reserved for the future SSO cutover — the build fails loudly if set before the adapter exists (`src/lib/auth/README.md`) | Optional |

Both go into Dokploy's "Environment" tab on the portfolio app. No analytics snippet ships if either is missing.

## Legacy

The previous single-file HTML+React+Babel-standalone version is preserved at [`legacy/`](legacy/) in case of rollback. Not part of the build.
