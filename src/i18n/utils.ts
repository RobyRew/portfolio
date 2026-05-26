import en from './en.json';
import es from './es.json';
import ca from './ca.json';
import ro from './ro.json';
import type { CollectionEntry } from 'astro:content';

export const LOCALES = ['en', 'es', 'ca', 'ro'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

const dictionaries: Record<Locale, typeof en> = { en, es, ca, ro };

/** Path-deep lookup: t(messages, 'nav.home') → "Home" */
type Dict = Record<string, unknown>;
function deepGet(obj: Dict, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Dict)[key];
    return undefined;
  }, obj);
}

export function getDict(locale: Locale) {
  return dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];
}

export function t(
  locale: Locale,
  key: string,
  vars: Record<string, string | number> = {},
): string {
  const dict = getDict(locale);
  let value = deepGet(dict as Dict, key);
  // Fall back to English if the key is missing in the chosen locale.
  if (value === undefined && locale !== DEFAULT_LOCALE) {
    value = deepGet(dictionaries[DEFAULT_LOCALE] as Dict, key);
  }
  if (typeof value !== 'string') return key;
  return value.replace(/\{\{(\w+)\}\}/g, (_, name) =>
    name in vars ? String(vars[name]) : `{{${name}}}`,
  );
}

export function tList(locale: Locale, key: string): string[] {
  const dict = getDict(locale);
  let value = deepGet(dict as Dict, key);
  if (!Array.isArray(value) && locale !== DEFAULT_LOCALE) {
    value = deepGet(dictionaries[DEFAULT_LOCALE] as Dict, key);
  }
  return Array.isArray(value) ? (value as string[]) : [];
}

/** Build a localized URL prefix. `path('en', 'projects')` → '/en/projects' */
export function path(locale: Locale, ...segments: string[]): string {
  const clean = segments
    .flatMap((s) => s.split('/'))
    .filter(Boolean)
    .join('/');
  return `/${locale}${clean ? `/${clean}` : ''}`;
}

/** Strip the locale prefix from a URL. */
export function stripLocale(pathname: string): string {
  for (const loc of LOCALES) {
    const prefix = `/${loc}`;
    if (pathname === prefix) return '/';
    if (pathname.startsWith(`${prefix}/`)) return pathname.slice(prefix.length);
  }
  return pathname;
}

/** Generic helper: pick a content entry in the requested locale, fall back to EN. */
export function entriesForLocale<T extends { data: { locale: Locale } }>(
  all: T[],
  locale: Locale,
): T[] {
  const inLocale = all.filter((e) => e.data.locale === locale);
  if (inLocale.length > 0) return inLocale;
  return all.filter((e) => e.data.locale === DEFAULT_LOCALE);
}

/** Per-slug fallback. Strips the `en/`, `es/` etc. prefix from the entry id. */
export function entryBySlug<T extends CollectionEntry<'projects' | 'jobs' | 'education'>>(
  all: T[],
  locale: Locale,
  slug: string,
): { entry: T | undefined; isFallback: boolean } {
  const inLocale = all.find((e) => stripLocaleFromId(e.id) === slug && e.data.locale === locale);
  if (inLocale) return { entry: inLocale, isFallback: false };
  const fallback = all.find((e) => stripLocaleFromId(e.id) === slug && e.data.locale === DEFAULT_LOCALE);
  return { entry: fallback, isFallback: !!fallback };
}

export function stripLocaleFromId(id: string): string {
  // id pattern: "en/foo" → "foo"
  const parts = id.split('/');
  if (parts[0] && (LOCALES as readonly string[]).includes(parts[0])) {
    return parts.slice(1).join('/');
  }
  return id;
}

/** A short YYYY-MM date formatted per-locale. */
export function formatDate(locale: Locale, iso?: string | null): string {
  if (!iso) return t(locale, 'labels.present');
  const date = new Date(iso.length === 7 ? `${iso}-01` : iso);
  try {
    return new Intl.DateTimeFormat(localeIntl(locale), {
      year: 'numeric',
      month: 'short',
    }).format(date);
  } catch {
    return iso;
  }
}

export function localeIntl(locale: Locale): string {
  return { en: 'en-GB', es: 'es-ES', ca: 'ca-ES', ro: 'ro-RO' }[locale];
}

/** All locale-pair variants of a given page, for hreflang tags + locale switcher. */
export function alternateLinks(_currentLocale: Locale, currentPath: string): Array<{ locale: Locale; href: string }> {
  const stripped = stripLocale(currentPath);
  return LOCALES.map((loc) => ({
    locale: loc,
    href: `/${loc}${stripped === '/' ? '' : stripped}`,
  }));
}
