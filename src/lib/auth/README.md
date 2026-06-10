# Auth (dormant)

The portfolio is a fully public, statically built site. There is **no
authentication today** — `getAuthProvider()` returns the disabled
`NullAuthProvider` and no auth UI is rendered (`FEATURES.auth` is false).

This module exists so that a future private area (admin notes, gated CV
download, comment moderation, …) plugs into the existing Logto SSO
(auth.robyrew.com) without touching page code: everything consumes the
`AuthProvider` interface from `./types`, never a vendor SDK directly.

## Cutover checklist (Logto)

1. **Server output** — static HTML cannot check sessions:
   - `npm i @astrojs/node @logto/astro` (or `@logto/js` + hand-rolled routes)
   - `astro.config.mjs`: `output: 'server'` (or `hybrid` — keep public pages
     prerendered) + `adapter: node({ mode: 'standalone' })`
   - Dockerfile: swap nginx-static for the node runtime behind Traefik, or
     keep nginx in front as a reverse proxy for the static assets.
2. **Logto app** — create a "Traditional web" application in the Logto
   console; redirect URI `https://cosmincalin.es/api/auth/callback`,
   post-sign-out URI `https://cosmincalin.es/`.
3. **Environment** (see `.env.example`):
   - `PUBLIC_AUTH_PROVIDER=logto`
   - `LOGTO_ENDPOINT`, `LOGTO_APP_ID`, `LOGTO_APP_SECRET`,
     `LOGTO_COOKIE_SECRET` (≥32 random chars, `openssl rand -base64 32`)
4. **Implement `providers/logto.ts`** satisfying `AuthProvider`, wire the
   callback/sign-out routes under `src/pages/api/auth/`.
5. **Privacy policy** — `src/content/legal/*/privacy.md` explicitly promises
   the policy is updated *before* sign-in ships. Update all four locales.
6. **CSP** — add the Logto endpoint to `connect-src` (and `form-action` for
   the redirect) in `nginx.conf`.

## Why not ship the adapter now?

A dead Logto SDK in a static bundle is attack surface and dependency drift
with zero benefit. The interface is the contract; the adapter is ~100 lines
when actually needed. `getAuthProvider()` throws at build time if the env
var is flipped before the adapter exists, so misconfiguration cannot ship
silently.
