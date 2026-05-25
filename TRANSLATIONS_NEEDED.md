# Translations pending

Status of localised content as of 2026-05-24.

The site **renders in all four languages on day one** — UI strings (nav, buttons, labels, hero copy) are translated in `src/i18n/{en,es,ca,ro}.json`. What's not yet translated is the **long-form Markdown** for jobs, projects and education in ES, CA, RO. Those routes fall back to the English content with a small "translation pending" banner on top until you fill them in.

## How fallback works

`src/i18n/utils.ts → entryBySlug()` looks up the entry by `<locale>/<slug>`. If it doesn't exist for the requested locale, it returns the English entry and flips `isFallback = true`. The detail page shows a banner reading `t('fallback.translationPending')`.

## What needs translating (per locale)

Copy the EN file into the matching `es/`, `ca/`, `ro/` folder, keep the frontmatter shape, translate the body. The build will validate the frontmatter is well-formed.

### Jobs (`src/content/jobs/`)

- [ ] `<locale>/tsystems.md`
- [ ] `<locale>/reserva-de-la-tierra.md`

### Projects (`src/content/projects/`)

- [ ] `<locale>/toppresenter.md`
- [ ] `<locale>/calendar-event-generator.md`
- [ ] `<locale>/powerpoint-extractor.md`
- [ ] `<locale>/kingdomskids.md`
- [ ] `<locale>/bibletype.md`
- [ ] `<locale>/infrastructure.md`
- [ ] `<locale>/js-ppt.md`
- [ ] `<locale>/presentation-studio.md`
- [ ] `<locale>/chat-converter.md`

### Education (`src/content/education/`)

- [ ] `<locale>/daw.md`
- [ ] `<locale>/asix.md`

Replace `<locale>` with `es`, `ca`, `ro`. So in total: 12 files × 3 locales = **36 translations**.

## Quick start (copy-then-translate)

```bash
# Copy ES skeletons in one go (then edit each file's body)
for f in src/content/projects/en/*.md; do
  base=$(basename "$f")
  cp "$f" "src/content/projects/es/$base"
  sed -i '' 's/^locale: en$/locale: es/' "src/content/projects/es/$base"
done
# Repeat for ca, ro and for jobs/, education/.
```

## Why this approach?

- **No empty 404s** in non-EN locales — the user always gets useful content.
- **Visible "translation pending" banner** so visitors know what's going on and you know what's outstanding.
- **Build-time validation** keeps the data shape consistent across locales — no half-translated frontmatter shipping.
- **Per-route fallback** instead of per-page redirect means search-engine canonicals stay correct.
