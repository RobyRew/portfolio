import { useEffect, useState, useCallback, useRef } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface Labels {
  toggle: string;
  light: string;
  dark: string;
  system: string;
}

export default function ThemeToggle({ labels }: { labels: Labels }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Initialize from localStorage / system, mirror to <html data-theme>.
  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme | null) ?? 'system';
    setTheme(stored);
    apply(stored);

    // React to system changes when user is on 'system'.
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (localStorage.getItem('theme') === null || localStorage.getItem('theme') === 'system') {
        apply('system');
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

  const apply = useCallback((t: Theme) => {
    const resolved = t === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : t;
    document.documentElement.setAttribute('data-theme', resolved);
  }, []);

  const set = useCallback((t: Theme) => {
    setTheme(t);
    if (t === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', t);
    apply(t);
    setOpen(false);
  }, [apply]);

  const cycle = useCallback(() => {
    const order: Theme[] = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(theme) + 1) % order.length]!;
    set(next);
  }, [theme, set]);

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
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-40 origin-top-right rounded-lg border border-[var(--line)] bg-[var(--bg)] p-1 shadow-lg"
        >
          {(['light', 'dark', 'system'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              role="menuitemradio"
              aria-checked={theme === opt}
              onClick={() => set(opt)}
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
        </div>
      )}
    </div>
  );
}
