import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@i18n/utils';

interface Alt { locale: Locale; href: string; }

const NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  ca: 'Català',
  ro: 'Română',
};
const FLAGS: Record<Locale, string> = { en: '🇬🇧', es: '🇪🇸', ca: '🏴󠁥󠁳󠁣󠁴󠁿', ro: '🇷🇴' };

export default function LocaleSwitcher({
  locale,
  alternates,
  label,
}: {
  locale: Locale;
  alternates: Alt[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1 rounded-md px-2 text-sm text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg)]"
      >
        <span aria-hidden>{FLAGS[locale]}</span>
        <span className="font-mono text-xs uppercase">{locale}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-44 origin-top-right rounded-lg border border-[var(--line)] bg-[var(--bg)] p-1 shadow-lg"
        >
          {alternates.map(({ locale: loc, href }) => (
            <a
              key={loc}
              role="menuitem"
              href={href}
              hrefLang={loc}
              className={[
                'flex items-center gap-2 rounded-md px-3 py-2 text-sm',
                loc === locale
                  ? 'bg-[var(--bg-2)] text-[var(--fg)]'
                  : 'text-[var(--fg-2)] hover:bg-[var(--bg-2)] hover:text-[var(--fg)]',
              ].join(' ')}
            >
              <span aria-hidden>{FLAGS[loc]}</span>
              <span>{NAMES[loc]}</span>
              {loc === locale && <span aria-hidden className="ml-auto">✓</span>}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
