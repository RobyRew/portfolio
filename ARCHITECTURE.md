# Portfolio v2 — Architecture Proposal

Status: **DRAFT — pending senior review**
Owner: Cosmin Calin
Last updated: 2026-05-24

---

## 1. Goals

1. Replace the current 61 KB CDN/Babel-standalone HTML with a maintainable, typed codebase.
2. Modern, interactive UX that holds up on **mobile and desktop equally** (touch, keyboard, mouse).
3. Lighthouse 100 / 100 / 100 / 100. LCP < 1.5 s on a Moto G4 3G profile.
4. Multi-language (matches the user's own languages — see open question Q1).
5. Reflect current role: **System Administrator N2 — SysOps** at **T-Systems Iberia**, working on the international team for **Deutsche Telekom Technik**.
6. Zero third-party scripts by default. CSP-clean. Vendored assets only.
7. Deploys exactly the same way other apps do (Dockerfile → Dokploy → Traefik), so no infra change required.

---

## 2. Current state (what we're replacing)

`index.html` (61 635 B) — single file with:
- Tailwind **1.x** via JSDelivr CDN (5-year-old major version, no JIT, no v4 features)
- React 18 dev build + Babel standalone (runs JSX transformation **in the browser** — 200-400 ms blocking before paint)
- Lucide via UMD (full bundle, no tree-shake)
- All icons inlined as SVG copy-paste despite the Lucide import
- No type safety, no build step, no i18n, no theme system, no test surface
- Container: `nginx:alpine` (good — keeping this lane)

Not bad as a v1, but every change is risky and every new section adds to the monolith.

---

## 3. Stack choice — Astro 5

**Recommended: Astro 5 + React 19 islands + Tailwind 4 + TypeScript 5.8 + Content Collections**

### Why Astro over the alternatives

| Option | Bundle for this site | i18n | DX | Verdict |
|---|---|---|---|---|
| **Astro 5 (islands)** | ~5–15 KB JS (only interactive widgets ship JS) | Built-in routing | React for islands, `.astro` for layout | **Picked** |
| Next.js 16 static export | ~70–90 KB JS baseline (React runtime always ships) | `next-intl` | Matches `kingdomskids` | Overkill for brochure content |
| Vite + React SPA | ~70 KB baseline | DIY (`react-i18next`) | Matches `calendar-event-generator`, `powerpoint-extractor` | OK, but worse SEO + heavier on mobile |
| SvelteKit | Smallest bundle | Built-in | New paradigm | Adds a 4th frontend stack to maintain |

Astro is the right tool for a content-dominant site (portfolio, blog) where 90 % of the page is static markup and only a handful of widgets need interactivity. The user already knows React, so islands stay familiar; everything else is JSX-like `.astro` syntax with frontmatter.

### Concretely

- **Astro 5.x** — file-based routing, MDX, Content Collections (typed), built-in i18n routing, View Transitions API.
- **React 19** — for interactive islands only (theme toggle, command palette, project filter, contact form, gallery lightbox).
- **Tailwind CSS 4** — matches `calendar-event-generator` / `powerpoint-extractor` / `kingdomskids`. Native CSS layers, `@theme` directive, much faster than v3.
- **TypeScript 5.8 (strict)**.
- **Content Collections** — `src/content/` holds typed Markdown for: `jobs/`, `education/`, `projects/`, `languages/`. Zod schemas validate at build time → no broken data ships.
- **Framer Motion** — only inside islands that animate (matches `kingdomskids` choice).
- **astro-icon** — SVG sprite from Iconify; tree-shaken, no UMD bloat.
- **@fontsource-variable/inter** + **@fontsource-variable/jetbrains-mono** — self-hosted (no Google Fonts → no third-party script, no CSP exception, no CLS).
- **astro:assets** — image optimization (AVIF + WebP + responsive `srcset`) at build time. The gallery becomes a real progressive-image story.

### Out of scope (deliberate)

- No SSR, no Node runtime on the VPS. Pure static `dist/` served by nginx.
- No third-party analytics. (If wanted later → self-hosted Umami or Plausible on the same VPS; ask separately.)
- No CMS. Markdown in git is enough for a portfolio.

---

## 4. Content model

```
src/content/
├── jobs/
│   ├── 2024-tsystems.md         # Current — note Deutsche Telekom Technik scope
│   └── 2021-reserva-de-la-tierra.md
├── education/
│   ├── daw-baix-camp.md         # HNC Web Development (in progress)
│   └── asix-baix-camp.md        # HNC IT Systems Administration
├── projects/
│   ├── toppresenter.md          # Featured macOS app
│   ├── calendar-event-generator.md
│   ├── powerpoint-extractor.md
│   ├── kingdomskids.md
│   ├── bibletype.md
│   ├── js-ppt.md
│   ├── infrastructure.md        # The Ansible repo itself
│   └── chat-converter.md
└── i18n/
    ├── en.json
    ├── es.json
    ├── ca.json                  # If we keep Catalan — see Q1
    └── ro.json
```

Each `.md` carries typed frontmatter: dates, location, tech tags, links, featured flag, an optional `gallery` array. The Zod schema in `src/content/config.ts` makes the build fail if a field is missing — guarantees nothing half-edited ships.

---

## 5. Page structure & interaction

### Routes

```
/                              → Hero + summary + recent projects
/about                         → Long-form bio, languages, interests
/experience                    → Timeline of jobs (T-Systems → Reserva de la Tierra)
/projects                      → Filterable grid (tech, year, featured)
/projects/[slug]               → Per-project page (gallery, stack, links, writeup)
/contact                       → Form + GPG key + social
/cv                            → Print-styled CV (clean, no nav) — also exports to PDF cleanly
```

All routes pre-render to static HTML at build time. URLs are clean and indexable.

### Interaction inventory (mobile + desktop parity)

| Widget | Where | Mobile | Desktop | Notes |
|---|---|---|---|---|
| Theme toggle (light/dark/system) | Header | Tap | Click + keyboard `T` | `prefers-color-scheme` default; `localStorage` override; **no flash** on load (inline script before paint) |
| Locale switcher | Header | Tap menu | Hover menu | Sets `lang` + cookie, navigates to `/{locale}/...` |
| Command palette (`⌘K`) | Global | Long-press FAB | `⌘/Ctrl+K` | `cmdk` library (used in `kingdomskids`) — search projects, jump to section |
| Project filter | `/projects` | Bottom-sheet | Sidebar chips | Filters by tech tag; URL state via search params |
| Tech-stack carousel | Home | Swipe | Drag + arrows | Touch-first, keyboard-accessible |
| Gallery lightbox | Per-project | Pinch-zoom, swipe | Click + arrow keys | Self-hosted (`yet-another-react-lightbox` or DIY ~3 KB) |
| Contact form | `/contact` | Native form widgets | Inline validation | POSTs to a Cloudflare Worker / Formspree / self-hosted listmonk — see Q3 |
| Anchor scrollspy | Long pages | — | Active section indicator in sidebar | `IntersectionObserver` |
| View Transitions | Across navigations | Smooth fade/slide | Smooth fade/slide | Native API, Astro-supported |
| Reduced-motion respect | All animated widgets | — | — | `prefers-reduced-motion` disables Framer Motion |

### Mobile-specific

- Header collapses to a sticky compact bar with a single hamburger (`Sheet` from Radix).
- A persistent bottom navigation when scrolled (Home / Projects / Contact) so primary actions stay one-thumb away.
- Safe-area insets respected for iOS notches.
- All tap targets ≥ 44 × 44 px.

### Keyboard

- Skip-link to main content (a11y).
- `⌘K` palette, `T` theme, `L` locale.
- Visible focus rings (Tailwind `focus-visible:`).

---

## 6. Performance budget

| Metric | Target | How we get there |
|---|---|---|
| JS shipped to `/` | < 10 KB gzip | Islands only; React only on interactive widgets |
| CSS | < 20 KB gzip | Tailwind 4 JIT + `@layer` ordering |
| LCP (3G mobile) | < 1.5 s | Hero image preloaded, AVIF, no blocking JS |
| CLS | 0 | All images dimensioned, font-display swap with `@fontsource-variable` |
| TBT | < 50 ms | No render-blocking scripts |
| Lighthouse | 100 / 100 / 100 / 100 | Static, no analytics, semantic HTML, alt text |

---

## 7. Security baseline

- **Strict CSP** via nginx response headers — `default-src 'self'`; no `unsafe-inline` (Astro inlines critical CSS with hashes, scripts use nonce). No external CDNs to whitelist.
- **Permissions-Policy** — disable camera, mic, geolocation, payment, USB.
- **HSTS** with preload (1 year, includeSubDomains).
- **X-Content-Type-Options: nosniff, X-Frame-Options: DENY** (or `frame-ancestors 'none'`), **Referrer-Policy: strict-origin-when-cross-origin**.
- **Cross-Origin-Opener-Policy: same-origin**, **Cross-Origin-Resource-Policy: same-site**.
- **Subresource Integrity** moot — no third-party scripts.
- Dockerfile uses `nginx:alpine` with `unprivileged` variant (`nginxinc/nginx-unprivileged:alpine`) so the container doesn't need root.
- Read-only root filesystem at runtime.

---

## 8. Repo layout (post-migration)

```
portfolio/
├── astro.config.mjs            # i18n, view transitions, image config
├── tailwind.config.ts
├── tsconfig.json               # strict
├── package.json
├── Dockerfile                  # Multi-stage: node:lts-alpine → nginxinc/nginx-unprivileged:alpine
├── nginx.conf                  # Security headers + cache rules (extracted from Dockerfile)
├── .dockerignore
├── src/
│   ├── content/                # Typed Markdown (jobs, projects, education)
│   ├── content.config.ts       # Zod schemas
│   ├── layouts/
│   ├── components/             # .astro components
│   ├── islands/                # React-only interactive widgets
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── experience.astro
│   │   ├── projects/index.astro
│   │   ├── projects/[slug].astro
│   │   ├── contact.astro
│   │   └── cv.astro
│   ├── i18n/                   # JSON message catalogs
│   ├── styles/global.css
│   └── assets/                 # Photos, processed by astro:assets
├── public/                     # robots.txt, favicons, OG images
└── tests/                      # Playwright a11y + visual regression (small set)
```

---

## 9. Migration plan (phased)

| Phase | Output | Manual verify |
|---|---|---|
| 1 | Astro scaffold + Dockerfile + CI lint; static "hello" page deployed to staging subdomain (`v2.cosmincalin.es`) via Dokploy | Site loads, headers correct |
| 2 | Content collections + EN-only static pages with real data from CV | Lighthouse ≥ 95, content accurate |
| 3 | Theme toggle, locale switcher, project filter (interactive islands) | Mobile + desktop UX QA |
| 4 | i18n strings for chosen locales (Q1) | Each locale renders, no missing keys |
| 5 | Gallery, command palette, contact form (Q3) | Form submits, email arrives |
| 6 | Cut over `cosmincalin.es` from v1 → v2 in Dokploy, archive old branch | Smoke test + 1 week tail |

---

## 10. Open questions (need answers before phase 2)

- **Q1 — Languages**: EN + ES only? Or also CA + RO (all four from your CV)?
- **Q2 — Content scope**: brochure only, or do you want a blog / case-studies section reserved? Cheap to add later, but URL structure decision now (`/blog/...`).
- **Q3 — Contact form**: (a) Cloudflare Worker → email, (b) Formspree / Web3Forms (free tier), (c) self-hosted listmonk on the VPS, (d) just an email link + GPG key, no form.
- **Q4 — Domain**: stays at `cosmincalin.es`?
- **Q5 — Featured projects**: which of the 13 do you want highlighted on the home page? My default pick: TopPresenter, calendar-event-generator, powerpoint-extractor, kingdomskids, infrastructure (the Ansible repo itself).
