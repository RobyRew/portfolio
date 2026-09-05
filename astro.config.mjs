// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

const SITE = 'https://cosmincalin.es';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'ignore',
  compressHTML: true,

  // ── Locale routing ────────────────────────────────────────────────
  // Four locales. EN is the default and is served from the root with no
  // prefix; es/ca/ro keep theirs. Retired /en/* URLs are not emitted.
  i18n: {
    locales: ['en', 'es', 'ca', 'ro'],
    defaultLocale: 'en',
    routing: {
      // The default locale carries no URL prefix: cosmincalin.es/ not /en/.
      // Routes come from a [...lang] rest param whose value is undefined for the
      // default locale, which is what actually drops the segment — this flag
      // alone does not, because [lang] is a required param and Astro rejects an
      // undefined value for one.
      prefixDefaultLocale: false,
      redirectToDefaultLocale: false,
    },
    // No `fallback` — every page lives under `src/pages/[lang]/` and its
    // `getStaticPaths` already emits one route per locale. Enabling fallback
    // makes Astro ALSO try to mirror /en/ pages into /es/, /ca/, /ro/, which
    // collides with the existing routes and floods the build log with
    // "Could not render … as it conflicts with higher priority route" warnings.
  },

  // ── Integrations ──────────────────────────────────────────────────
  integrations: [
    sitemap({
      // Retired routes are 301-stubs (see nginx.conf) — keep them out of the sitemap.
      filter: (page) => !/\/(about|contact|experience|projects)\/$/.test(page),
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-GB', es: 'es-ES', ca: 'ca-ES', ro: 'ro-RO' },
      },
    }),
    icon({
      include: {
        lucide: ['*'],            // tree-shaken at build, only used icons ship
        'simple-icons': ['*'],
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: true,
    },
  },

  build: {
    inlineStylesheets: 'auto',
    assets: '_astro',
  },

  image: {
    domains: [],
    remotePatterns: [],
  },

  // ── View Transitions ──────────────────────────────────────────────
  // Astro 5 enables transitions per-page; turn the API on globally so we
  // can opt-in inside the layout.
  experimental: {
    clientPrerender: true,
  },
});
