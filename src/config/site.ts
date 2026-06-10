/**
 * Single source of truth for site identity, links and feature flags.
 *
 * Localised *strings* (labels, bio, fact values) live in `src/i18n/*.json`
 * under the `profile.*` keys — this module only holds locale-independent
 * data: URLs, handles, dates, toggles.
 */

export interface SocialLink {
  /** Stable id, also used as the i18n key `profile.socials.<id>` if a label override is needed. */
  id: string;
  label: string;
  username: string;
  url: string;
  /** astro-icon name, e.g. `simple-icons:github`. */
  icon: string;
}

export const IDENTITY = {
  name: 'Cosmin Calin',
  fullName: 'Gheorghe Cosmin Calin',
  /** ISO date — rendered per-locale with Intl. */
  birthDate: '2001-04-06',
  email: 'cosmin.cg22@gmail.com',
  /** Used for JSON-LD and OpenGraph. */
  jobTitle: 'System Administrator (SysOps)',
  employer: 'T-Systems Iberia',
} as const;

export const SOCIALS: readonly SocialLink[] = [
  {
    id: 'github',
    label: 'GitHub',
    username: '@robyrew',
    url: 'https://github.com/robyrew',
    icon: 'simple-icons:github',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    username: 'Cosmin Calin',
    url: 'https://linkedin.com/in/cosmincaliin',
    icon: 'simple-icons:linkedin',
  },
  {
    id: 'email',
    label: 'Email',
    username: IDENTITY.email,
    url: `mailto:${IDENTITY.email}`,
    icon: 'lucide:mail',
  },
  {
    id: 'website',
    label: 'Web',
    username: 'cosmincalin.es',
    url: 'https://cosmincalin.es',
    icon: 'lucide:globe',
  },
] as const;

/**
 * Feature flags. Build-time only (static output) — flipping one re-renders
 * the affected UI out of the HTML entirely, it is not a runtime toggle.
 */
export const FEATURES = {
  gallery: true,
  commandPalette: true,
  /**
   * Auth is OFF until the Logto cutover. See `src/lib/auth/README.md` —
   * enabling requires `output: 'server'` + the node adapter + @logto/astro.
   */
  auth: import.meta.env.PUBLIC_AUTH_PROVIDER === 'logto',
} as const;

/** Accent palettes selectable from the appearance menu (see global.css). */
export const ACCENTS = ['mint', 'blue', 'violet', 'amber'] as const;
export type Accent = (typeof ACCENTS)[number];
export const DEFAULT_ACCENT: Accent = 'mint';
