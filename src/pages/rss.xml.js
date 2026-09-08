import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../config';

export async function GET(context) {
  const news = await getCollection('news', ({ data }) => !data.draft);
  const tutorials = await getCollection('tutorials', ({ data }) => !data.draft);
  const items = [...news, ...tutorials]
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.pubDate,
      link: `/${entry.collection}/${entry.id}/`,
    }));

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    items,
  });
}
