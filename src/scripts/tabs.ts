/* Controller for the WAI-ARIA tabs pattern, split across two components.
 *
 * The tablist lives in the floating glass bar (TabBar.astro) and the panels
 * live in the page body (TabPanels.astro), so they can no longer be wired by
 * DOM proximity — `data-tab-group` pairs them instead.
 *
 * Keyboard: ←/→/Home/End move the roving tabindex and select; the hash is
 * kept in sync so every tab stays deep-linkable and survives a reload.
 */
function initGroup(list: HTMLElement): void {
  const group = list.dataset.tabGroup;
  if (!group) return;

  const panelHost = document.querySelector<HTMLElement>(`[data-tab-panels="${group}"]`);
  if (!panelHost) return;

  const tabs = [...list.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const ids = tabs.map((tab) => tab.dataset.tab ?? '');
  const panels = ids.map((id) =>
    panelHost.querySelector<HTMLElement>(`[role="tabpanel"][data-tab="${id}"]`),
  );
  if (tabs.length === 0) return;

  function select(id: string, opts: { focus?: boolean; hash?: boolean } = {}): void {
    const index = ids.indexOf(id);
    if (index === -1) return;

    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      tab.tabIndex = active ? 0 : -1;
    });
    panels.forEach((panel, i) => {
      if (panel) panel.hidden = i !== index;
    });

    // Drives the sliding capsule; the stylesheet turns it into a translate.
    list.style.setProperty('--i', String(index));

    if (opts.focus) tabs[index]?.focus();
    if (opts.hash && location.hash.slice(1) !== id) {
      history.replaceState(null, '', `#${id}`);
    }
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(ids[i] ?? '', { hash: true }));
    tab.addEventListener('keydown', (event) => {
      let target = -1;
      if (event.key === 'ArrowRight') target = (i + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') target = (i - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = tabs.length - 1;
      if (target === -1) return;
      event.preventDefault();
      select(ids[target] ?? '', { focus: true, hash: true });
    });
  });

  function fromHash(): void {
    const id = location.hash.slice(1);
    if (ids.includes(id)) select(id);
  }
  window.addEventListener('hashchange', fromHash);
  fromHash();
}

document.querySelectorAll<HTMLElement>('[role="tablist"][data-tab-group]').forEach(initGroup);
