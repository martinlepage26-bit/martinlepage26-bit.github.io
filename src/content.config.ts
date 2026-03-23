import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const safeUrl = z.string().refine((value) => {
  if (value.startsWith('/')) {
    return true;
  }

  try {
    const parsed = new URL(value);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}, 'Expected an http(s), mailto, or site-relative URL.');

const linkSchema = z.object({
  label: z.string(),
  url: safeUrl,
});

const papers = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    year: z.number().int().optional(),
    venue: z.string(),
    status: z.string(),
    type: z.string(),
    abstract: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean(),
    citation: z.string(),
    links: z.array(linkSchema),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    year: z.number().int().optional(),
    status: z.string(),
    description: z.string(),
    role: z.string(),
    outputs: z.array(z.string()),
    tags: z.array(z.string()),
    featured: z.boolean(),
    image: z.string(),
    imageAlt: z.string(),
    links: z.array(linkSchema),
  }),
});

const writings = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    featured: z.boolean(),
    draft: z.boolean().optional(),
    externalUrl: safeUrl.optional(),
    externalLabel: z.string().optional(),
  }),
});

const talks = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    event: z.string(),
    date: z.coerce.date(),
    dateLabel: z.string().optional(),
    location: z.string(),
    format: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean(),
    links: z.array(linkSchema),
  }),
});

// research: governance-oriented research pieces, protocols, and experiments.
// Designed for portability to the Pharos suite: stable slugs, explicit ordering,
// content/presentation separation, schema shared across card and full-page views.
const research = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // originalTitle preserves the exact source-author naming when title is
    // normalized for navigation or file architecture.
    originalTitle: z.string().optional(),
    // titleNote: preserve exact source title and flag discrepancies here rather
    // than silently normalizing. This field does not render in the UI; it is
    // a migration and provenance note for editors.
    titleNote: z.string().optional(),
    navLabel: z.string().optional(),
    subtitle: z.string().optional(),
    year: z.number().int().optional(),
    status: z.string(),
    type: z.string(),
    family: z.string().optional(),
    phase: z.string().optional(),
    entryRole: z.string().optional(),
    // whatItDoes: one sentence stating what the piece does, used in card view.
    whatItDoes: z.string(),
    abstract: z.string(),
    tags: z.array(z.string()),
    featured: z.boolean(),
    // order: explicit integer for sorting in the index, independent of year.
    order: z.number().int().optional(),
    // relatedWorks: slugs of related research entries (no file extension).
    // Used for cross-linking. Stable across Pharos migration.
    relatedWorks: z.array(z.string()).optional(),
    sourcePaths: z.array(z.string()).default([]),
    links: z.array(linkSchema).default([]),
  }),
});

export const collections = {
  papers,
  projects,
  writings,
  talks,
  research,
};
