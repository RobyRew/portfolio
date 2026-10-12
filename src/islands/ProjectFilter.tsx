import { useEffect, useMemo, useState } from 'react';

interface Props {
  techs: string[];
  showAllLabel: string;
  filterLabel: string;
}

/** Pure-client filter that hides .project-card[data-tech] not matching the active tag.
 *  Keeps the DOM as the source of truth so SSR + no-JS still render the full grid. */
export default function ProjectFilter({ techs, showAllLabel, filterLabel }: Props) {
  const sorted = useMemo(() => [...new Set(techs)].sort((a, b) => a.localeCompare(b)), [techs]);
  const [active, setActive] = useState<string | null>(null);

  // Sync from URL on first mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setActive(params.get('tech'));
  }, []);

  // Apply filter to the DOM grid.
  useEffect(() => {
    const cards = document.querySelectorAll<HTMLElement>('[data-tech]');
    cards.forEach((card) => {
      const cardTechs = (card.dataset['tech'] ?? '').split('|');
      const match = active === null || cardTechs.includes(active);
      card.style.display = match ? '' : 'none';
    });
    const url = new URL(window.location.href);
    if (active) url.searchParams.set('tech', active); else url.searchParams.delete('tech');
    window.history.replaceState(null, '', url.toString());
  }, [active]);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <span className="text-xs font-mono uppercase tracking-wider text-[var(--fg-2)]">
        {filterLabel}:
      </span>
      <button
        type="button"
        onClick={() => setActive(null)}
        className={[
          'rounded-full border px-3 py-1 text-xs transition-colors',
          active === null
            ? 'border-[var(--color-accent-500)] bg-[var(--color-accent-500)]/10 text-[var(--fg)]'
            : 'border-[var(--line)] text-[var(--fg-2)] hover:text-[var(--fg)]',
        ].join(' ')}
      >
        {showAllLabel}
      </button>
      {sorted.map((tech) => (
        <button
          key={tech}
          type="button"
          onClick={() => setActive(tech)}
          className={[
            'rounded-full border px-3 py-1 font-mono text-xs transition-colors',
            active === tech
              ? 'border-[var(--color-accent-500)] bg-[var(--color-accent-500)]/10 text-[var(--fg)]'
              : 'border-[var(--line)] text-[var(--fg-2)] hover:text-[var(--fg)]',
          ].join(' ')}
        >
          {tech}
        </button>
      ))}
    </div>
  );
}
