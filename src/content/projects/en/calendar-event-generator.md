---
locale: en
title: Calendar Event Generator
summary: Browser-based ICS event builder with full RFC 5545 compliance — recurrence rules, attendees, reminders, ~50 templates, 50-level undo. Works fully offline as a PWA.
status: active
year: 2026
order: 2
featured: true
category: web-app
tech:
  - React 19
  - TypeScript
  - Vite
  - Tailwind CSS 4
  - Zustand
  - Dexie
  - date-fns
  - PWA
links:
  repo: https://github.com/robyrew/calendar-event-generator
  live: https://calendar.robyrew.com
---

A browser-only ICS calendar event builder with the level of detail you actually need for real-world events — recurrence rules (RRULE), attendees with statuses, reminders, location with maps integration, attachments. Exports to Apple Calendar, Google Calendar, Outlook — anything that speaks RFC 5545.

Notable bits:

- ~50 prebuilt event **templates** (meeting, birthday, doctor's appointment, workout block, …) you can adapt instead of starting from a blank form.
- **50-level undo/redo** powered by an immutable event store — important for "wait, what did I just delete?" moments.
- Multi-select export, so you can build several events and send them as one .ics.
- Fully **client-side**: no server, no analytics, no cookies. PWA — installable, works offline.
- Three locales (English, Spanish, Romanian).
