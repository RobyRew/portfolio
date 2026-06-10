import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ── Shared primitives ───────────────────────────────────────────────────
const locale = z.enum(['en', 'es', 'ca', 'ro']);
const isoDate = z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, 'YYYY-MM or YYYY-MM-DD');

const linksSchema = z
  .object({
    repo: z.string().url().optional(),
    live: z.string().url().optional(),
    demo: z.string().url().optional(),
    appStore: z.string().url().optional(),
  })
  .strict()
  .optional();

const techTag = z.string().min(1).max(40);

// ── Collections ─────────────────────────────────────────────────────────

const jobs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/jobs' }),
  schema: z.object({
    locale,
    company: z.string(),
    role: z.string(),
    location: z.string(),
    employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']).default('full-time'),
    startDate: isoDate,
    endDate: isoDate.nullable().optional(),         // null/omitted = current
    current: z.boolean().default(false),
    featured: z.boolean().default(false),
    highlights: z.array(z.string()).min(1),
    tech: z.array(techTag).default([]),
    teamScope: z.string().optional(),               // e.g. "International team — Deutsche Telekom Technik"
    logo: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    locale,
    title: z.string(),
    summary: z.string().min(20).max(280),
    status: z.enum(['active', 'maintained', 'archived', 'experimental']).default('active'),
    year: z.number().int().gte(2018).lte(2099),
    tech: z.array(techTag).min(1),
    featured: z.boolean().default(false),
    order: z.number().int().default(100),
    category: z.enum(['web-app', 'native-app', 'library', 'infrastructure', 'tool']).default('web-app'),
    links: linksSchema,
    hero: z.string().optional(),                    // path to hero image under src/assets
    gallery: z.array(z.string()).default([]),

    // Optional long-form case study. If the MDX body has multiple sections
    // (## Problem, ## Approach, ## Outcome, etc.), the project detail page
    // renders them as a structured deep-dive instead of just the summary.
    caseStudy: z
      .object({
        problem: z.string().optional(),
        timeline: z.string().optional(),
        role: z.string().optional(),
        outcome: z.string().optional(),
      })
      .strict()
      .optional(),
  }),
});

const education = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/education' }),
  schema: z.object({
    locale,
    qualification: z.string(),
    institution: z.string(),
    location: z.string(),
    startDate: isoDate,
    endDate: isoDate.nullable().optional(),
    current: z.boolean().default(false),
    summary: z.string(),
  }),
});

/**
 * Skill categories. One YAML file per category; the category label is
 * localised via the i18n key `skills.categories.<id>` (file basename).
 * Item names are proper nouns (Linux, Ansible…) and stay untranslated.
 */
const skills = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/skills' }),
  schema: z.object({
    icon: z.string(),                               // lucide icon name
    order: z.number().int().default(100),
    items: z
      .array(
        z.object({
          name: z.string().min(1).max(60),
          /** 1–5 self-assessed proficiency, drives the meter in the Skills tab. */
          level: z.number().int().min(1).max(5).default(3),
          icon: z.string().optional(),              // optional simple-icons name
          note: z.string().max(120).optional(),
        }),
      )
      .min(1),
  }),
});

/**
 * Personal gallery. Images live in src/assets/gallery and are optimised
 * by astro:assets; `image()` validates the path at build time.
 */
const gallery = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/gallery' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      alt: z.string().min(10),                      // a11y: real description required
      image: image(),
      order: z.number().int().default(100),
      tags: z.array(z.string()).default([]),
    }),
});

/** Legal documents (terms, privacy) — one markdown file per locale. */
const legal = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/legal' }),
  schema: z.object({
    locale,
    title: z.string(),
    lastUpdated: isoDate,
    summary: z.string().optional(),
  }),
});

export const collections = { jobs, projects, education, skills, gallery, legal };
