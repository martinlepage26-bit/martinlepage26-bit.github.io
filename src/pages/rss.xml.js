import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { siteMeta } from '../data/site';
import { contentSlug } from '../lib/content';

export async function GET(context) {
  const writings = await getCollection('writings', ({ data }) => !data.draft);
  const site = context.site ?? siteMeta.siteUrl;

  if (!site) {
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Martin Lepage - Writings</title><description>RSS feed unavailable until a public site URL is configured.</description><link>/</link></channel></rss>',
      {
        status: 200,
        headers: {
          'Content-Type': 'application/rss+xml; charset=utf-8',
        },
      },
    );
  }

  return rss({
    title: `${siteMeta.name} - Writings`,
    description: 'Essays, reflections, and public-facing writing by Martin Lepage.',
    site,
    items: writings
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((writing) => ({
        title: writing.data.title,
        description: writing.data.description,
        pubDate: writing.data.date,
        link: `/writing/${contentSlug(writing.id)}/`,
      })),
  });
}
