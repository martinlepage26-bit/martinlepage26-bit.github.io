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

export const collections = {
  papers,
  projects,
  writings,
  talks,
};
