---
locale: en
title: PowerPoint Extractor
summary: Extract, view, and export data from both modern (.pptx) and legacy (.ppt) PowerPoint files — six export formats, media as ZIP, runs fully in the browser.
status: active
year: 2026
order: 3
featured: true
category: web-app
tech:
  - React 19
  - TypeScript
  - Vite
  - Tailwind CSS 4
  - Zustand
  - jsPDF
  - JSZip
  - pptx-parser
  - PWA
links:
  repo: https://github.com/robyrew/powerpoint-extractor
  live: https://ppt.robyrew.com
---

A browser-only tool to crack open PowerPoint files and get the data inside — text, images, media — out as something useful (JSON, XML, CSV, TXT, HTML, PDF, or a ZIP of the embedded media).

Two parsers, one UI:

- **Modern .pptx** — XML-based, handled with `pptx-parser`.
- **Legacy .ppt** (PowerPoint 97-2003) — binary compound file format, handled by my own [`js-ppt`](#js-ppt) library, a cleanroom implementation from the Microsoft Open Specifications.

Everything runs **client-side**: your slides never leave your machine. PWA, four languages, three themes (light/dark/OLED). Useful for archivists, instructional designers, and anyone migrating off PowerPoint who has hundreds of decks to triage.
