# portfolio

Personal portfolio at [cosmincalin.es](https://cosmincalin.es).

**Stack**: Astro 5 (islands architecture) · React 19 (interactive widgets only) · Tailwind CSS 4 (via `@theme`) · TypeScript 5.9 (strict) · Self-hosted Inter + JetBrains Mono · `astro-icon` (Lucide + Simple Icons, tree-shaken) · `cmdk` (command palette).

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

Both go into Dokploy's "Environment" tab on the portfolio app. No analytics snippet ships if either is missing.

## Legacy

The previous single-file HTML+React+Babel-standalone version is preserved at [`legacy/`](legacy/) in case of rollback. Not part of the build.
