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

export const collections = { jobs, projects, education };
