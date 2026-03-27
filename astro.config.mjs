// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { resolveSiteUrl } from './site-config.js';

const site = resolveSiteUrl(process.env);
const redirectOnlyPaths = new Set([
  '/gaia/app/',
  '/astral/',
  '/astral-year/',
  '/astral-year/app/',
  '/astral-year/glossary/',
]);

export default defineConfig({
  site,
  output: 'static',
  legacy: {
    collectionsBackwardsCompat: true,
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);
        return !redirectOnlyPaths.has(pathname);
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
      wrap: true,
    },
  },
});
