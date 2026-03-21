import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { pageMeta, siteMeta } from '../data/site';
import { contentSlug } from '../lib/content';

export async function GET(context) {
  const writings = await getCollection('writings', ({ data }) => !data.draft);
  const site = context.site ?? siteMeta.siteUrl;

  return rss({
    title: pageMeta.rss.title,
    description: pageMeta.rss.description,
    site,
    customData: `<language>${siteMeta.locale}</language>`,
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
