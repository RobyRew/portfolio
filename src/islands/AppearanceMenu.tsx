import { useEffect, useState, useCallback, useRef } from 'react';
import { ACCENTS, DEFAULT_ACCENT, type Accent } from '../config/site';

type Theme = 'light' | 'dark' | 'system';

interface Labels {
  toggle: string;
  light: string;
  dark: string;
  system: string;
  accent: string;
  accents: Record<Accent, string>;
}

// Swatch preview colours — mirror the `--color-accent-500` of each palette
// in global.css (kept inline so the swatch shows the palette, not the
// currently active accent).
const SWATCH: Record<Accent, string> = {
  mint: 'oklch(60% 0.20 150)',
  blue: 'oklch(60% 0.17 248)',
  violet: 'oklch(60% 0.20 302)',
  amber: 'oklch(68% 0.15 65)',
};

export default function AppearanceMenu({ labels }: { labels: Labels }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [accent, setAccent] = useState<Accent>(DEFAULT_ACCENT);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Initialize from localStorage / system, mirror to <html> data attributes.
  useEffect(() => {
    const storedTheme = (localStorage.getItem('theme') as Theme | null) ?? 'system';
    setTheme(storedTheme);
    applyTheme(storedTheme);

    const storedAccent = localStorage.getItem('accent') as Accent | null;
    if (storedAccent && ACCENTS.includes(storedAccent)) {
      setAccent(storedAccent);
      document.documentElement.setAttribute('data-accent', storedAccent);
    }

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (localStorage.getItem('theme') === null || localStorage.getItem('theme') === 'system') {
        applyTheme('system');
      }
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  // Click outside / Esc closes the menu.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // 'T' as a global hotkey to cycle theme.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== 't') return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      cycle();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const applyTheme = useCallback((t: Theme) => {
    const resolved = t === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : t;
    document.documentElement.setAttribute('data-theme', resolved);
  }, []);

  const setThemeChoice = useCallback((t: Theme) => {
    setTheme(t);
    if (t === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', t);
    applyTheme(t);
  }, [applyTheme]);

  const setAccentChoice = useCallback((a: Accent) => {
    setAccent(a);
    if (a === DEFAULT_ACCENT) localStorage.removeItem('accent');
    else localStorage.setItem('accent', a);
    document.documentElement.setAttribute('data-accent', a);
  }, []);

  const cycle = useCallback(() => {
    const order: Theme[] = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length]!;
    setThemeChoice(next);
  }, [theme, setThemeChoice]);

  const currentIcon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀' : '✦';

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label={labels.toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center rounded-md text-base text-[var(--fg-2)] transition-colors hover:bg-[var(--bg-2)] hover:text-[var(--fg)]"
      >
        <span aria-hidden>{currentIcon}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-48 origin-top-right rounded-lg border border-[var(--line)] bg-[var(--bg)] p-1 shadow-lg"
        >
          {(['light', 'dark', 'system'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              role="menuitemradio"
              aria-checked={theme === opt}
              onClick={() => setThemeChoice(opt)}
              className={[
                'flex w-full items-center justify-between rounded-md px-3 py-2 text-sm',
                theme === opt
                  ? 'bg-[var(--bg-2)] text-[var(--fg)]'
                  : 'text-[var(--fg-2)] hover:bg-[var(--bg-2)] hover:text-[var(--fg)]',
              ].join(' ')}
            >
              <span>{labels[opt]}</span>
              {theme === opt && <span aria-hidden>✓</span>}
            </button>
          ))}

          <div className="mx-2 my-1 border-t border-[var(--line)]" role="separator" />

          <p className="px-3 pb-1 pt-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--fg-2)]">
            {labels.accent}
          </p>
          <div className="flex items-center gap-1.5 px-3 pb-2" role="group" aria-label={labels.accent}>
            {ACCENTS.map((a) => (
              <button
                key={a}
                type="button"
                role="menuitemradio"
                aria-checked={accent === a}
                aria-label={labels.accents[a]}
                title={labels.accents[a]}
                onClick={() => setAccentChoice(a)}
                className={[
                  'h-6 w-6 rounded-full border-2 transition-transform hover:scale-110',
                  accent === a ? 'border-[var(--fg)]' : 'border-transparent',
                ].join(' ')}
                style={{ background: SWATCH[a] }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
