---
locale: en
title: js-ppt
summary: Pure-JavaScript PowerPoint 97-2003 (.ppt) parser — Node library + CLI. Cleanroom implementation from the Microsoft Open Specifications.
status: maintained
year: 2024
order: 10
featured: false
category: library
tech:
  - Node.js
  - JavaScript
  - codepage
  - cfb
  - commander
links:
  repo: https://github.com/robyrew/js-ppt
---

A foundational library for parsing the legacy binary `.ppt` format from PowerPoint 97-2003. Cleanroom implementation built off Microsoft's Open Specifications, Apache 2.0 licensed.

Used as the legacy-format parser inside [PowerPoint Extractor](#powerpoint-extractor). Standalone usable as a CLI:

```bash
npx js-ppt slides.ppt
```
