/* Light-dismiss and Escape for every <details data-menu>.
 * The two behaviours <details> lacks, in twelve lines, replacing what three
 * React islands each shipped a component runtime to do. */
function closeAll(except?: Element) {
  document.querySelectorAll<HTMLDetailsElement>('details[data-menu][open]')
    .forEach((d) => { if (d !== except) d.open = false; });
}

document.addEventListener('click', (e) => {
  const inside = (e.target as Element)?.closest?.('details[data-menu]');
  closeAll(inside ?? undefined);
});

document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  const open = document.querySelector<HTMLDetailsElement>('details[data-menu][open]');
  if (open) { open.open = false; open.querySelector('summary')?.focus(); }
});

// Only one menu open at a time, the way a menu bar behaves.
document.addEventListener('toggle', (e) => {
  const d = e.target as HTMLDetailsElement;
  if (d.matches?.('details[data-menu]') && d.open) closeAll(d);
}, true);
