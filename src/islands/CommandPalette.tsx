import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import type { Locale } from '@i18n/utils';

interface CmdItem {
  id: string;
  label: string;
  href: string;
  group: 'navigate' | 'project' | 'contact';
  shortcut?: string;
}

// Lightweight in-memory navigation index. Populated client-side on first open
// from <a data-cmd> attributes Astro emits — no extra fetch, no DB.
function gather(): CmdItem[] {
  const els = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[data-cmd]'));
  return els.map((el, i) => ({
    id: `auto-${i}`,
    label: el.getAttribute('data-cmd-label') ?? el.textContent?.trim() ?? el.href,
    href: el.href,
    group: (el.getAttribute('data-cmd-group') as CmdItem['group']) ?? 'navigate',
    shortcut: el.getAttribute('data-cmd-shortcut') ?? undefined,
  }));
}

export default function CommandPalette({
  triggerLabel,
}: {
  locale: Locale;
  triggerLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CmdItem[]>([]);

  // ⌘K / Ctrl+K to toggle. '/' also opens, unless typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (!inField && e.key === '/') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) setItems(gather());
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={triggerLabel}
        onClick={() => setOpen(true)}
        className="hidden h-9 items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--bg-2)] px-3 text-sm text-[var(--fg-2)] transition-colors hover:border-[var(--color-accent-500)] hover:text-[var(--fg)] sm:flex"
      >
        <span aria-hidden>⌕</span>
        <span className="text-xs">{triggerLabel}</span>
        <kbd className="ml-2 rounded-sm border border-[var(--line)] bg-[var(--bg)] px-1 py-px font-mono text-[10px] text-[var(--fg-2)]">⌘K</kbd>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={triggerLabel}
          className="fixed inset-0 z-50 grid place-items-start bg-black/40 p-4 pt-[20vh] backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--bg)] shadow-2xl">
            <Command label={triggerLabel}>
              <div className="border-b border-[var(--line)] px-3">
                <Command.Input
                  autoFocus
                  placeholder={`${triggerLabel}…`}
                  className="h-12 w-full bg-transparent text-sm text-[var(--fg)] outline-none placeholder:text-[var(--fg-2)]"
                />
              </div>
              <Command.List className="max-h-[50vh] overflow-y-auto p-2">
                <Command.Empty className="px-3 py-4 text-center text-sm text-[var(--fg-2)]">
                  …
                </Command.Empty>
                {(['navigate', 'project', 'contact'] as const).map((g) => {
                  const groupItems = items.filter((it) => it.group === g);
                  if (groupItems.length === 0) return null;
                  return (
                    <Command.Group key={g} heading={g} className="mb-1">
                      {groupItems.map((it) => (
                        <Command.Item
                          key={it.id}
                          value={`${it.label} ${it.group}`}
                          onSelect={() => { setOpen(false); window.location.href = it.href; }}
                          className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-[var(--fg)] aria-selected:bg-[var(--bg-2)]"
                        >
                          <span>{it.label}</span>
                          {it.shortcut && (
                            <kbd className="rounded-sm border border-[var(--line)] bg-[var(--bg-2)] px-1.5 py-px font-mono text-[10px] text-[var(--fg-2)]">
                              {it.shortcut}
                            </kbd>
                          )}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  );
                })}
              </Command.List>
              <div className="flex items-center justify-between gap-3 border-t border-[var(--line)] px-3 py-2 text-[11px] text-[var(--fg-2)]">
                <div className="flex items-center gap-2">
                  <kbd className="rounded-sm border border-[var(--line)] bg-[var(--bg-2)] px-1 font-mono">↑↓</kbd>
                  <span>navigate</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="rounded-sm border border-[var(--line)] bg-[var(--bg-2)] px-1 font-mono">↵</kbd>
                  <span>open</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="rounded-sm border border-[var(--line)] bg-[var(--bg-2)] px-1 font-mono">esc</kbd>
                  <span>close</span>
                </div>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
